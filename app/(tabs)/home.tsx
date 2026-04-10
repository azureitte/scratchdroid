import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { apiReq } from '@/util/api';
import { off, on } from '@/util/eventBus';
import type { FeaturedProject, FeaturedTab } from '@/util/types/api/featured.types';
import type { ScratchProject } from '@/util/types/api/project.types';

import { useSession } from '@/hooks/useSession';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';

import ProjectCard from '@/components/panels/ProjectCard';
import Carousel from '@/components/panels/Carousel';
import Heading from '@/components/general/Heading';
import ListLoading from '@/components/panels/ListLoading';
import StudioCard from '@/components/panels/StudioCard';

const HomePage = () => {

    const insets = useSafeAreaInsets();
    const { isLoading, session } = useSession();

    const [ isRefreshing, setIsRefreshing ] = useState(false);
    const [ isFirstFetch, setIsFirstFetch ] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    const [ activity, setActivity ] = useState<any[]>([]);
    const [ projectLoves, setProjectLoves ] = useState<ScratchProject[]>([]);
    const [ featuredTab, setFeaturedTab ] = useState<FeaturedTab>({
        community_featured_projects: [],
        community_featured_studios: [],
        community_most_loved_projects: [],
        community_most_remixed_projects: [],
        community_newest_projects: [],
        curator_top_projects: [],
        scratch_design_studio: [],
    });

    useEffect(() => {
        handleRefresh();
    }, [isLoading, session]);

    useEffect(() => {
        on('tab-re-pressed', handleScrollToTop);
        return () => off('tab-re-pressed', handleScrollToTop);
    }, []);

    const handleRefresh = async () => {
        if (isLoading || !session) return;

        const { user } = session;
        if (!user) return;

        const [lovesRes, featuredRes, activityRes] = await Promise.all([
            apiReq<ScratchProject[]>({
                host: 'https://api.scratch.mit.edu',
                path: '/users/' + user.username + '/following/users/loves',
                auth: user.token,
                responseType: 'json',
            }),
            apiReq<FeaturedTab>({
                host: 'https://api.scratch.mit.edu',
                path: '/proxy/featured/',
                responseType: 'json',
            }),
            await apiReq({
                host: 'https://api.scratch.mit.edu',
                path: '/users/' + user.username + '/following/users/activity',
                params: { limit: 3 },
                auth: user.token,
                responseType: 'json',
            })
        ]);

        // newest projects first
        if (lovesRes.success) setProjectLoves(
            lovesRes.data
                ?.sort((a, b) => 
                    new Date(b.history.created).getTime() 
                  - new Date(a.history.created).getTime())
        );
        if (featuredRes.success) setFeaturedTab(featuredRes.data);
        if (activityRes.success) setActivity(activityRes.data);

        setIsRefreshing(false);
        setIsFirstFetch(false);
    }

    const handleScrollToTop = (e: string) => {
        if (e !== 'home') return;
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };
    
    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: true,
        primaryColor: 'regular',
    });

    const sdsName = featuredTab.scratch_design_studio[0]?.gallery_title;

    const renderLovedProject = useCallback((project: ScratchProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={project.author.username}
        viewCount={project.stats.views}
    />, []);

    const renderFeaturedProject = useCallback((project: FeaturedProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={project.creator}
        loveCount={project.love_count}
    />, []);

    const renderFeaturedStudio = useCallback((project: FeaturedProject) => <StudioCard
        id={project.id}
        title={project.title}
    />, []);

    return (<>
    
        <LinearGradient 
            colors={['#121212', '#121212', '#12121200']}
            style={[styles.topHide, { height: insets.top + 60 }]} 
        />
        <LinearGradient 
            colors={['#12121200', '#121212', '#121212']}
            style={[styles.botHide, { height: insets.bottom + 50 }]} 
        />

        <ScrollView 
            style={[styles.container]} 
            contentContainerStyle={{
                paddingTop: insets.top + 60,
                paddingBottom: insets.bottom + 90,
            }}
            refreshControl={<RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                    setIsRefreshing(true);
                    handleRefresh();
                }}
                progressViewOffset={80}
            />}
            ref={scrollViewRef}
        >
        { isFirstFetch && <ListLoading /> }

        <View style={[styles.content, {
            opacity: isFirstFetch ? 0 : 1,
        }]}>
            <View style={{ padding: 16, gap: 20 }}>
                <Heading style={{ fontSize: 24 }}>What's Happening</Heading>
                <ScrollView style={styles.codeBlock} nestedScrollEnabled>
                    <Text style={styles.codeBlockText}>
                        {JSON.stringify(activity, null, 2)}
                    </Text>
                </ScrollView>
            </View>

            <Carousel 
                title="Loved by who I follow" 
                items={projectLoves}
                render={renderLovedProject}
            />

            <Carousel 
                title="Featured Projects"
                items={featuredTab.community_featured_projects}
                render={renderFeaturedProject} 
            />

            <Carousel 
                title="Featured Studios"
                items={featuredTab.community_featured_studios}
                render={renderFeaturedStudio}
            />

            <Carousel 
                title="Recent Projects"
                items={featuredTab.community_newest_projects}
                render={renderFeaturedProject}
            />

            <Carousel 
                title={sdsName ?? '...'} 
                subtitle="Scratch Design Studio"
                items={featuredTab.scratch_design_studio}
                render={renderFeaturedProject}
            />
        </View>
        </ScrollView>
    </>);
};

export default HomePage;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
    },

    topHide: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    botHide: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },

    content: {
        gap: 32,
    },

    codeBlock: {
        backgroundColor: '#000',
        maxHeight: 256,
        width: '100%',
        overflow: 'scroll',
        padding: 8,
        borderRadius: 12,
        marginBottom: 12,
    },
    codeBlockText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
    },
});
