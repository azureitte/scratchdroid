import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { scrollCommentSectionToId } from '@/util/functions';

import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useInfiniteUserComments } from '@/hooks/useInfiniteUserComments';
import { useUser } from '@/hooks/useUser';

import CommentSection, { CommentSectionRef } from '@/components/panels/CommentSection';
import ListLoading from '@/components/panels/ListLoading';
import UserPageHeader from '@/components/panels/UserPageHeader';


const UserPage = () => {

    const { username, commentId } = useLocalSearchParams<{ 
        username: string,
        commentId?: string,
    }>();

    const user = useUser(username);
    const comments = useInfiniteUserComments({
        user: username,
        enabled: !!username,
    });

    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const pfpCachePrevent = useRef(Math.random());
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


    const handleRefresh = async () => {
        setIsRefreshing(true);
        pfpCachePrevent.current = Math.random();
        await fetchAll();
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
            header={<UserPageHeader 
                data={user.data} 
                username={username}
                pfpCachePrevent={pfpCachePrevent}
            />}
            hasNextPage={comments.hasNextPage}
            isLoading={comments.isLoading}
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
