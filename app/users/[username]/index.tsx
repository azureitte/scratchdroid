import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { lightTap } from '@/util/functions';
import { refreshCacheForUser } from '@/util/thumbnailCaching';

import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useSession } from '@/hooks/useSession';
import { useSheet } from '@/hooks/useSheet';
import { useUser } from '@/hooks/queries/useUser';
import { useInfiniteActivity } from '@/hooks/queries/useInfiniteActivity';
import { useFollowUser } from '@/hooks/mutations/useFollowUser';

import CommentSection, { CommentSectionRef } from '@/components/panels/CommentSection';
import ListLoading from '@/components/panels/ListLoading';
import UserPageHeader from '@/components/panels/UserPageHeader';

import type { UserOptionsMenuProps } from '@/app-menus/user/options.menu';
import { ActivityUnit } from '@/util/types/activity.types';
import { useApi } from '@/hooks/useApi';


const UserPage = () => {

    const { username, commentId } = useLocalSearchParams<{ 
        username: string,
        commentId?: string,
    }>();

    const { session } = useSession();
    const sheet = useSheet();
    const { q: { getUserActivity } } = useApi();

    const { 
        user, 
        setIsFollowingDirectly,
        setCommentsAllowedDirectly,
    } = useUser(username);
    
    const [ activity, setActivity ] = useState<ActivityUnit[]>([]);

    const fetchActivity = useCallback(async () => {
        const res = await getUserActivity({
            username,
            from: 0,
            limit: 6,
        });
        setActivity(res);
    }, []);

    useEffect(() => {
        fetchActivity();
    }, []);

    const isOwn = session?.user?.username === username;

    const followAction = useFollowUser({
        username,
        onSuccess: (following) => {
            setIsFollowingDirectly(following);
            lightTap();
        },
    });

    const handleFollow = () => {
        if (!user.data) return;
        setIsFollowingDirectly(!user.data.isFollowing);
        followAction.mutate({ 
            from: user.data.isFollowing, 
            to: !user.data.isFollowing 
        });
    }

    const handleUserOptions = () => {
        if (!user.data) return;
        sheet.push<UserOptionsMenuProps>('userOptions', { 
            username,
            canComment: user.data.canComment,
            canToggleCommenting: isOwn,
            canReport: !isOwn,
            setCanComment: setCommentsAllowedDirectly,
        });
    }

    const [ isRefreshing, setIsRefreshing ] = useState(false);
    const [ headerRerender, setHeaderRerender ] = useState(0);

    const commentSectionRef = useRef<CommentSectionRef>(null);

    useChangeAppStateOnFocus({
        footerVisible: false,
        primaryColor: 'regular',
    });

    const insets = useSafeAreaInsets();

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
            commentSectionRef.current?.refresh(),
            fetchActivity(),
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
            objectId={user.data.id}
            objectName={username}
            highlightedComment={commentId ? Number(commentId) : undefined}
            isOwn={isOwn}
            canComment={user.data.canComment}

            header={<UserPageHeader 
                user={user.data} 
                activity={activity}
                username={username}
                rerender={headerRerender}
                isOwn={isOwn}
                followAction={{
                    isPending: followAction.isPending,
                    dispatch: handleFollow,
                }}
                handleUserOptions={handleUserOptions}
            />}
            isRefreshing={isRefreshing}
            handleRefresh={handleRefresh}
            ref={commentSectionRef}
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
