import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import type { ScratchProject, ScratchUser } from '@/util/types';
import { apiReq } from '@/util/api';
import { relativeDate } from '@/util/functions';

import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import CommentSection from '@/components/panels/CommentSection';
import Carousel from '@/components/panels/Carousel';
import ProjectCard from '@/components/panels/ProjectCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useInfiniteUserComments } from '@/hooks/useInfiniteUserComments';

type UserPageHeaderProps = {
    user: ScratchUser;
    sharedProjects: ScratchProject[];
    pfpCachePrevent: RefObject<number>;
}

const UserPageHeader = ({
    user,
    sharedProjects,
    pfpCachePrevent,
}: UserPageHeaderProps) => {
    
    const renderProject = useCallback((project: ScratchProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={user?.username ?? ''}
        viewCount={project.stats.views}
    />, [user]);

    return (<View style={[styles.content]}>
        <View style={styles.banner}>
            
        </View>

        <View style={styles.info}>
            <Image 
                source={{
                    uri: user.profile.images['90x90'] + '?a=' + pfpCachePrevent.current,
                }}
                style={styles.avatar}
            />
            <Text style={styles.infoText}>@{user.username}</Text>
            <Text style={styles.infoSubtext}>{ 
                user.scratchteam ? 'Scratch Team' : 'Scratcher' 
            } • Joined { 
                relativeDate(new Date(user.history.joined))
            }</Text>
            <Text style={styles.infoSubtext}>{ user.profile.country }</Text>
        </View>

        <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>About Me</Text>
            <Text style={styles.contentCardText} selectable>{ user.profile.bio }</Text>
            <Text style={styles.contentCardTitle}>What I'm working on</Text>
            <Text style={styles.contentCardText} selectable>{ user.profile.status }</Text>
        </View>

        <Carousel 
            title="Shared Projects" 
            items={sharedProjects}
            render={renderProject}
        />

    </View>)
}

const UserPage = () => {

    const { username } = useLocalSearchParams<{ username: string }>();
    const insets = useSafeAreaInsets();

    const [ sharedProjects, setSharedProjects ] = useState<ScratchProject[]>([]);
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const pfpCachePrevent = useRef(Math.random());

    useChangeAppStateOnFocus({
        footerVisible: false,
        primaryColor: 'regular',
    });

    const comments = useInfiniteUserComments({
        user: username,
        enabled: !!username,
    });

    const user = useQuery({
        queryKey: ['user', username],
        queryFn: async () => {
            if (!username) return;

            const userRes = await apiReq<ScratchUser>({
                host: 'https://api.scratch.mit.edu',
                path: `/users/${username}/`,
                responseType: 'json',
            });
            if (!userRes.success) throw new Error(userRes.error);

            return userRes.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    useEffect(() => {
        handleSharedProjectsRefresh();
    }, [user]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        pfpCachePrevent.current = Math.random();
        await Promise.all([
            comments.refresh(),
            user.refetch(),
            handleSharedProjectsRefresh,
        ]);
        setIsRefreshing(false);
    };

    const handleSharedProjectsRefresh = async () => {
        if (!user.data) return;

        const sharedProjectsRes = await apiReq<ScratchProject[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${user.data!.username}/projects/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (sharedProjectsRes.success)
            setSharedProjects(sharedProjectsRes.data);
    };


    if (user.isError) return <Text>{user.error.message}</Text>;
    if (user.isLoading || !user.data) return <ActivityIndicator />;

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
            comments={comments.data} 
            header={<UserPageHeader 
                user={user.data} 
                sharedProjects={sharedProjects}
                pfpCachePrevent={pfpCachePrevent}
            />}
            hasNextPage={comments.hasNextPage}
            isLoading={comments.isLoading}
            fetchNextPage={comments.fetchNextPage}
            isRefreshing={isRefreshing}
            handleRefresh={handleRefresh}
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

    content: {
        gap: 16,
    },
    
    banner: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: '#aaa',
    },

    info: {
        paddingHorizontal: 16,
        gap: 4,
        marginTop: -64,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 12,
        boxShadow: '0 0 0 8px #121212',
        backgroundColor: '#121212',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 24,
        fontWeight: 600,
        color: '#fff',
    },
    infoSubtext: {
        fontSize: 16,
        fontWeight: 500,
        color: '#888',
    },

    contentCard: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#1C1C1C',
        gap: 8,
    },
    contentCardTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#888',
        marginTop: 4,
    },
    contentCardText: {
        fontSize: 18,
        lineHeight: 28,
        fontWeight: 400,
        color: '#fff',
        marginBottom: 8,
    },
});
