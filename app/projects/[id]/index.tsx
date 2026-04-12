import { useCallback, useMemo, useRef, useState } from 'react';
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

import { lightTap } from '@/util/functions';
import { projectHasCloudVariables } from '@/util/parsing/projects';

import { useSession } from '@/hooks/useSession';
import { useSheet } from '@/hooks/useSheet';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useProject } from '@/hooks/queries/useProject';
import { useLoveProject } from '@/hooks/mutations/useLoveProject';
import { useFavProject } from '@/hooks/mutations/useFavProject';

import CommentSection, { CommentSectionRef } from '@/components/panels/CommentSection';
import ProjectPageHeader from '@/components/panels/ProjectPageHeader';
import ListLoading from '@/components/panels/ListLoading';

import type { ProjectOptionsMenuProps } from '@/app-menus/project/options.menu';

const ProjectPage = () => {

    const { id, commentId } = useLocalSearchParams<{ 
        id: string,
        commentId?: string,
    }>();
    const projectId = Number(id);

    const { session } = useSession();
    const sheet = useSheet();
    const insets = useSafeAreaInsets();

    const { 
        project,
        setLovedByMeDirectly, 
        setFavedByMeDirectly,
        setCommentsAllowedDirectly,
    } = useProject(projectId);
    const data = project.data;
    const isOwn = data?.project.author.username === session?.user?.username;

    const loveAction = useLoveProject({
        projectId,
        onSuccess: (loved) => {
            setLovedByMeDirectly(loved);
            lightTap();
        },
        onError: () => {
            if (!data) return;
            setLovedByMeDirectly(!data.lovedByMe);
        },
    });
    const favAction = useFavProject({
        projectId: projectId,
        onSuccess: (faved) => {
            setFavedByMeDirectly(faved);
            lightTap();
        },
        onError: () => {
            if (!data) return;
            setFavedByMeDirectly(!data.favedByMe);
        },
    });

    const handleLove = () => {
        if (!data) return;
        setLovedByMeDirectly(!data.lovedByMe); // optimistic update
        loveAction.mutate({ from: data.lovedByMe, to: !data.lovedByMe });
    }
    const handleFav = () => {
        if (!data) return;
        setFavedByMeDirectly(!data.favedByMe); // optimistic update
        favAction.mutate({ from: data.favedByMe, to: !data.favedByMe });
    }

    const handleProjectOptions = () => {
        if (!data) return;
        sheet.push<ProjectOptionsMenuProps>('projectOptions', { 
            projectId: projectId,
            projectTitle: data.project.title,
            canRemix: !isOwn,
            canReport: !isOwn,
            canComment: data.project.canComment,
            canToggleCommenting: isOwn,
            setCommentsAllowed: setCommentsAllowedDirectly,
        });
    }

    const [ isRefreshing, setIsRefreshing ] = useState(false);
    const [ webviewActive, setWebviewActive ] = useState(false);

    const ignoreProjectUnload = useRef(false);
    const commentSectionRef = useRef<CommentSectionRef>(null);

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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAll();
        setIsRefreshing(false);
    };

    const fetchAll = async () => {
        await Promise.all([
            project.refetch(),
            commentSectionRef.current?.refresh(),
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
                author={data?.project.author.username}
                highlightedComment={commentId ? Number(commentId) : undefined}
                isOwn={isOwn}
                canComment={data.project.canComment}

                header={<ProjectPageHeader 
                    project={data.project}
                    projectId={Number(id)}
                    extensions={data.file?.extensions ?? []}
                    isCloud={hasCloudData}
                    loves={{
                        count: data.project.stats.loves ?? 0,
                        active: data.lovedByMe,
                        loading: loveAction.isPending,
                        onPress: handleLove,
                    }}
                    favs={{
                        count: data.project.stats.favorites ?? 0,
                        active: data.favedByMe,
                        loading: favAction.isPending,
                        onPress: handleFav,
                    }}
                    remixes={data.remixes}
                    studios={data.studios}
                    isOwn={isOwn}
                    webviewActive={webviewActive}
                    handleProjectOptions={handleProjectOptions}
                    onInfoPress={() => ignoreProjectUnload.current = true}
                />}
                isRefreshing={isRefreshing}
                handleRefresh={handleRefresh}
                ref={commentSectionRef}
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
