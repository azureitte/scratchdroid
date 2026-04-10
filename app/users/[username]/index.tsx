import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { scrollCommentSectionToId } from '@/util/functions';
import { refreshCacheForUser } from '@/util/thumbnailCaching';
import { off, on } from '@/util/eventBus';
import type { Comment } from '@/util/types/app/comments.types';

import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useUserComments } from '@/hooks/queries/useUserComments';
import { useUser } from '@/hooks/queries/useUser';
import { useSession } from '@/hooks/useSession';

import CommentSection, { CommentSectionRef } from '@/components/panels/CommentSection';
import ListLoading from '@/components/panels/ListLoading';
import UserPageHeader from '@/components/panels/UserPageHeader';


const UserPage = () => {

    const { username, commentId } = useLocalSearchParams<{ 
        username: string,
        commentId?: string,
    }>();

    const { session } = useSession();

    const { 
        user, 
        setIsFollowingDirectly,
        setCommentsAllowedDirectly,
    } = useUser(username);
    const comments = useUserComments({
        user: username,
        enabled: !!username,
    });

    const [ isRefreshing, setIsRefreshing ] = useState(false);
    const [ headerRerender, setHeaderRerender ] = useState(0);

    const listRef = useRef<CommentSectionRef>(null);
    const initPageFetchCount = useRef(0);

    useChangeAppStateOnFocus({
        footerVisible: false,
        primaryColor: 'regular',
    });

    const insets = useSafeAreaInsets();


    // initial fetch
    useEffect(() => {
        comments.refresh();
    }, []);

    // scroll to target comment, if commentId param was provided
    useEffect(() => {
        if (commentId && comments.data.length && !comments.isFirstLoading) {
            // if has comment with provided id, resolve
            const found = scrollCommentSectionToId(
                listRef.current, 
                comments.data, 
                commentId
            );
            if (found) return;

            // if not, fetch comments until comment with provided id is found
            // limit at 40 pages max
            if (comments.hasNextPage && initPageFetchCount.current < 40) {
                comments.fetchNextPage();
                initPageFetchCount.current++;
            }
        }
    }, [comments, comments.data, commentId]);


    // insert comments directly when recieved event

    const handleAddComment = useCallback((comment?: Comment) => {
        if (!comment) return;

        const newData = comments.addCommentDirectly(comment);
        setTimeout(() => {
            scrollCommentSectionToId(
                listRef.current, 
                newData, 
                comment.id,
            );
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
        refreshCacheForUser(username);
        await fetchAll();
        setHeaderRerender(prev => (prev + 1) % 64); // force header to rerender
        setIsRefreshing(false);
    };

    const fetchAll = async () => {
        await Promise.all([
            user.refetch(),
            comments.refresh(),
        ]);
    };


    if (user.isError) return <Text>{user.error.message}</Text>;
    if (user.isLoading || !user.data) return <ListLoading marginTop={insets.top + 60} />;

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
            type='user'
            objectId={user.data.user.id}
            objectName={username}
            comments={comments.data} 
            isOwn={session?.user?.username === username}
            canComment={user.data.canComment}
            header={<UserPageHeader 
                data={user.data} 
                username={username}
                rerender={headerRerender}
                isOwn={session?.user?.username === username}
                setIsFollowing={setIsFollowingDirectly}
                setCanComment={setCommentsAllowedDirectly}
            />}
            hasNextPage={comments.hasNextPage}
            isLoading={comments.isLoading}
            isFirstLoading={comments.isFirstLoading}
            fetchNextPage={comments.fetchNextPage}
            isRefreshing={isRefreshing}
            handleRefresh={handleRefresh}
            ref={listRef}
        />
        </View>
    </>);
    
};

export default UserPage;

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
        backgroundColor: '#121212',
    },
});
