import { memo, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import CountryFlag from "react-native-country-flag";

import type { BannerProject, ScratchProject, ScratchUser } from '@/util/types';
import { apiReq } from '@/util/api';
import { addPrefixUrl, relativeDate } from '@/util/functions';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';

import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useInfiniteUserComments } from '@/hooks/useInfiniteUserComments';

import CommentSection, { CommentSectionRef } from '@/components/panels/CommentSection';
import Carousel from '@/components/panels/Carousel';
import ProjectCard from '@/components/panels/ProjectCard';
import UserCard from '@/components/panels/UserCard';
import ListLoading from '@/components/panels/ListLoading';
import { countryToCode } from '@/util/countries';

type UserPageHeaderProps = {
    user: ScratchUser;
    username: string;
    bannerProject: BannerProject|null;
    sharedProjects: ScratchProject[];
    favoriteProjects: ScratchProject[];
    followers: ScratchUser[];
    following: ScratchUser[];
    pfpCachePrevent: RefObject<number>;
}

const UserPageHeader = memo(({
    user: myUser,
    username: myUsername,
    bannerProject,
    sharedProjects,
    favoriteProjects,
    followers,
    following,
    pfpCachePrevent,
}: UserPageHeaderProps) => {

    const router = useRouter();
    
    const renderProject = useCallback((project: ScratchProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={myUsername}
        viewCount={project.stats.views}
    />, [myUser]);

    const renderUser = useCallback((user: ScratchUser) => <UserCard
        id={user.id}
        username={user.username}
        image={user.profile.images['60x60']}
    />, []);

    return (<View style={[styles.content]}>
        <Pressable 
            style={styles.banner}
            onPress={() => bannerProject && router.push(`/projects/${bannerProject.id}`)}
            android_ripple={DEFAULT_RIPPLE_CONFIG}
        >
            <LinearGradient
                colors={['#000', '#0000']}
                locations={[0.16, 1]}
                style={styles.bannerGradient}
            />
            { !!bannerProject && <>
                <Image
                    source={{ uri: addPrefixUrl(bannerProject.thumbnail_url) }}
                    style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerSubtext} numberOfLines={1}>{'  ' + bannerProject.label + '  '}</Text>
                    <Text style={styles.bannerTitle} numberOfLines={1}>{'  ' + bannerProject.title + '  '}</Text>
                </View>
            </>}
        </Pressable>

        <View style={styles.info}>
            <Image 
                source={{
                    uri: myUser.profile.images['90x90'] + '?a=' + pfpCachePrevent.current,
                }}
                width={480}
                height={360}
                style={styles.avatar}
            />
            <Text style={styles.infoText}>@{myUsername}</Text>
            <Text style={styles.infoSubtext}>{ 
                myUser.scratchteam ? 'Scratch Team' : 'Scratcher' 
            } • Joined { 
                relativeDate(new Date(myUser.history.joined))
            }</Text>
            <View style={styles.infoSubtextWrap}>
                <CountryFlag isoCode={countryToCode(myUser.profile.country)} size={14} style={{ opacity: 0.6, borderRadius: 4 }} />
                <Text style={styles.infoSubtext}>{ myUser.profile.country }</Text>
            </View>
        </View>

        <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>About Me</Text>
            <Text style={styles.contentCardText} selectable>{ myUser.profile.bio }</Text>
            <Text style={styles.contentCardTitle}>What I'm working on</Text>
            <Text style={styles.contentCardText} selectable>{ myUser.profile.status }</Text>
        </View>

        <Carousel 
            title="Shared Projects" 
            items={sharedProjects}
            render={renderProject}
        />

        <Carousel 
            title="Favorite Projects" 
            items={favoriteProjects}
            render={renderProject}
        />

        <Carousel 
            title="Followers" 
            items={followers}
            render={renderUser}
        />

        <Carousel 
            title="Following" 
            items={following}
            render={renderUser}
        />

    </View>)
});

const UserPage = () => {

    const { username, commentId } = useLocalSearchParams<{ 
        username: string,
        commentId?: string,
    }>();
    const insets = useSafeAreaInsets();

    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const [ bannerProject, setBannerProject ] = useState<BannerProject|null>(null);
    const [ sharedProjects, setSharedProjects ] = useState<ScratchProject[]>([]);
    const [ favoriteProjects, setFavoriteProjects ] = useState<ScratchProject[]>([]);
    const [ followers, setFollowers ] = useState<ScratchUser[]>([]);
    const [ following, setFollowing ] = useState<ScratchUser[]>([]);

    const [ targetCommentIdx, setTargetCommentIdx ] = useState<number|null>(null);

    const pfpCachePrevent = useRef(Math.random());
    const firstFetch = useRef(true);

    const listRef = useRef<CommentSectionRef>(null);

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
        if (user && firstFetch.current) {
            fetchAll();
            firstFetch.current = false;
        }
    }, [user]);

    useEffect(() => {
        // if commentId was provided
        if (commentId && comments.data.length && !comments.isFirstLoading) {
            // if has comment with provided id, resolve
            const comment = comments.data.find(c => c.id === Number(commentId));
            if (comment) {
                setTargetCommentIdx(comments.data.indexOf(comment));
                return;
            }

            // if not, fetch comments until comment with provided id is found
            if (comments.hasNextPage) {
                comments.fetchNextPage();
            }
        }
    }, [comments, comments.data, commentId]);

    useEffect(() => {
        if (targetCommentIdx !== null && comments.data.length) {
            listRef.current?.scrollToIndex(targetCommentIdx);
        }
    }, [targetCommentIdx, comments.data]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        pfpCachePrevent.current = Math.random();
        await fetchAll();
        setIsRefreshing(false);
    };

    const fetchSharedProjects = useCallback(async () => {
        const sharedProjectsRes = await apiReq<ScratchProject[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/projects/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (sharedProjectsRes.success) {
            setSharedProjects(sharedProjectsRes.data);
            return sharedProjectsRes.data;
        }
        return [];
    }, [username]);

    const fetchFavoriteProjects = useCallback(async () => {
        const favoriteProjectsRes = await apiReq<ScratchProject[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/favorites/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (favoriteProjectsRes.success)
            setFavoriteProjects(favoriteProjectsRes.data);
    }, [username]);

    const fetchBannerProject = useCallback(async (fallback?: ScratchProject) => {
        const bannerProjectRes = await apiReq<any>({
            path: `/site-api/users/all/${username}/`,
            responseType: 'json',
        });
        if (!bannerProjectRes.success) return;

        const data = bannerProjectRes.data;
        if (!fallback) fallback = sharedProjects[0];
        if (!data.featured_project_data) {
            if (fallback)
                setBannerProject({
                    id: fallback.id,
                    title: fallback.title,
                    thumbnail_url: fallback.image,
                    label: data.featured_project_label_name ?? 'Featured Project',
                });
        } else {
            setBannerProject({
                ...data.featured_project_data,
                label: data.featured_project_label_name ?? 'Featured Project',
            });
        }
    }, [username, sharedProjects]);

    const fetchSharedThenBanner = async () => {
        const [fallback] = await fetchSharedProjects();
        await fetchBannerProject(fallback);
    };

    const fetchFollowers = useCallback(async () => {
        const followersRes = await apiReq<ScratchUser[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/followers/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (followersRes.success)
            setFollowers(followersRes.data);
    }, [username]);

    const fetchFollowing = useCallback(async () => {
        const followingRes = await apiReq<ScratchUser[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/following/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (followingRes.success)
            setFollowing(followingRes.data);
    }, [username]);

    const fetchAll = async () => {
        await Promise.all([
            user.refetch(),
            fetchSharedThenBanner(),
            fetchFavoriteProjects(),
            fetchFollowers(),
            fetchFollowing(),
            comments.refresh(),
        ]);
    };


    if (user.isError) return <Text>{user.error.message}</Text>;
    if (user.isLoading || !user.data || firstFetch.current) return <ListLoading marginTop={insets.top + 60} />;

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
                username={username}
                bannerProject={bannerProject}
                sharedProjects={sharedProjects}
                favoriteProjects={favoriteProjects}
                followers={followers}
                following={following}
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

    content: {
        gap: 16,
    },
    
    banner: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: '#1d2b4d',
        position: 'relative',
        overflow: 'hidden',
    },
    bannerImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    bannerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    bannerOverlay: {
        position: 'absolute',
        top: 66,
        right: 16,
        zIndex: 2,
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        maxWidth: '80%',
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: 500,
        color: '#fff',

        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 16,
        paddingVertical: 10,
        marginVertical: -10,
        marginRight: -10,
    },
    bannerSubtext: {
        fontSize: 18,
        fontWeight: 400,
        color: '#ffffff9a',
        
        textShadowColor: '#000a',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 16,
        paddingVertical: 10,
        marginVertical: -10,
        marginRight: -6,
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
    infoSubtextWrap: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
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
