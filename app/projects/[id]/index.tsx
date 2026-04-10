import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    AppState,
    AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { scrollCommentSectionToId } from '@/util/functions';
import { projectHasCloudVariables } from '@/util/parsing/projects';
import { off, on } from '@/util/eventBus';
import type { Comment } from '@/util/types/app/comments.types';

import { useProject } from '@/hooks/queries/useProject';
import { useProjectComments } from '@/hooks/queries/useProjectComments';
import { useSession } from '@/hooks/useSession';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';

import CommentSection, { CommentSectionRef } from '@/components/panels/CommentSection';
import ProjectPageHeader from '@/components/panels/ProjectPageHeader';
import ListLoading from '@/components/panels/ListLoading';

const ProjectPage = () => {

    const { id, commentId } = useLocalSearchParams<{ 
        id: string,
        commentId?: string,
    }>();

    const { project, setLovedByMeDirectly, setFavedByMeDirectly } = useProject(Number(id));
    const data = project.data;
    const comments = useProjectComments({
        project: Number(id),
        author: data?.project.author.username ?? '',
        highlightedComment: commentId ? Number(commentId) : undefined,
        enabled: !!id && !!data?.project,
    });

    const [ isRefreshing, setIsRefreshing ] = useState(false);
    const [ webviewActive, setWebviewActive ] = useState(false);

    const { session } = useSession();
    const insets = useSafeAreaInsets();

    const ignoreProjectUnload = useRef(false);
    const listRef = useRef<CommentSectionRef>(null);

    useChangeAppStateOnFocus({
        footerVisible: false,
        primaryColor: 'regular',
    });

    const appState = useRef<AppStateStatus>(AppState.currentState);
    
    const handleFocusEffect = useCallback(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            appState.current = nextState;
        };

        const sub = AppState.addEventListener('change', handleAppStateChange);

        setWebviewActive(true);
        ignoreProjectUnload.current = false;

        return () => {
            if (appState.current === 'active' && !ignoreProjectUnload.current) {
                setWebviewActive(false);
            }
            sub.remove();
        };
    }, []);
    useFocusEffect(handleFocusEffect);

    // initial fetch
    useEffect(() => {
        comments.refresh();
    }, []);

    // scroll to target comment, if commentId param was provided
    useEffect(() => {
        if (commentId && comments.highlightLoaded)
            scrollCommentSectionToId(
                listRef.current, 
                comments.data, 
                commentId
            );
    }, [comments.highlightLoaded, commentId]);

    // insert comments directly when recieved event
    
    const handleAddComment = useCallback((comment?: Comment) => {
        if (!comment) return;
        let newData = comments.addCommentDirectly(comment);
        
        setTimeout(() => {
            if (comment.isReply)
                scrollCommentSectionToId(
                    listRef.current, 
                    newData, 
                    comment.id,
                );
            else
                listRef.current?.scrollToIndex(0);
        }, 100);
    }, [comments.data]);

    const handleDeleteComment = useCallback((comment: Comment) => {
        comments.deleteCommentDirectly(comment);
    }, [comments]);

    const handleReplaceComment = useCallback((comment: Comment) => {
        comments.replaceCommentDirectly(comment);
    }, [comments]);

    useFocusEffect(() => {
        on('add-comment', handleAddComment);
        on('delete-comment', handleDeleteComment);
        on('replace-comment', handleReplaceComment);
        return () => {
            off('add-comment', handleAddComment);
            off('delete-comment', handleDeleteComment);
            off('replace-comment', handleReplaceComment);
        };
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAll();
        setIsRefreshing(false);
    };

    const fetchAll = async () => {
        await Promise.all([
            project.refetch(),
            comments.refresh(),
        ]);
    };

    const hasCloudData = useMemo(() => projectHasCloudVariables(data?.file), [data]);

    if (project.isError) return <Text>{project.error.message}</Text>;
    if (project.isLoading || !data) return <ListLoading marginTop={insets.top + 60} />;

    return (<>
        <LinearGradient 
            colors={['#121212', '#121212', '#12121200']}
            style={[styles.topHide, { height: insets.top + 60 }]} 
        />
        <View style={[styles.container, { 
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
        }]}>
            <CommentSection 
                type='project'
                objectId={Number(id)}
                comments={comments.data}
                isOwn={session?.user?.username === data?.project.author.username}
                canComment={data.project.comments_allowed ?? true}
                header={<ProjectPageHeader 
                    project={data.project}
                    projectId={Number(id)}
                    extensions={data.file?.extensions ?? []}
                    isCloud={hasCloudData}
                    lovedByMe={data.lovedByMe}
                    favedByMe={data.favedByMe}
                    setLovedByMe={setLovedByMeDirectly}
                    setFavedByMe={setFavedByMeDirectly}
                    remixes={data.remixes}
                    studios={data.studios}
                    myUsername={session?.user?.username}
                    webviewActive={webviewActive}
                    onInfoPress={() => ignoreProjectUnload.current = true}
                />}
                hasNextPage={comments.hasNextPage}
                isLoading={comments.isLoading}
                isFirstLoading={comments.isFirstLoading}
                fetchNextPage={comments.fetchNextPage}
                fetchReplies={comments.fetchRepliesFor}
                isRefreshing={isRefreshing}
                handleRefresh={handleRefresh}
                ref={listRef}
            />
        </View>
    </>);
    
};

export default ProjectPage;

const styles = StyleSheet.create({
    topHide: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },

    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#121212',
    },
});
