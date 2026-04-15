import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { off, on } from '@/util/eventBus';
import type { FeaturedTab } from '@/util/types/featured.types';
import type { Project } from '@/util/types/projects.types';
import type { CarouselProject, CarouselStudio } from '@/util/types/users.types';
import type { ActivityUnit } from '@/util/types/activity.types';

import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useSession } from '@/hooks/useSession';
import { useApi } from '@/hooks/useApi';
import { useL10n } from '@/hooks/useL10n';

import ProjectCard from '@/components/panels/ProjectCard';
import Carousel from '@/components/panels/Carousel';
import Heading from '@/components/general/Heading';
import ListLoading from '@/components/panels/ListLoading';
import StudioCard from '@/components/panels/StudioCard';
import ActivityCard from '@/components/panels/ActivityCard';

const HomePage = () => {

    const insets = useSafeAreaInsets();
    const { t } = useL10n();
    const { isLoading, session } = useSession();
    const { q: { getFeatured, getFollowingActivity, getFollowingLoves } } = useApi();

    const [ isRefreshing, setIsRefreshing ] = useState(false);
    const [ isFirstFetch, setIsFirstFetch ] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    const [ activity, setActivity ] = useState<ActivityUnit[]>([]);
    const [ projectLoves, setProjectLoves ] = useState<Project[]>([]);
    const [ featuredTab, setFeaturedTab ] = useState<FeaturedTab>({
        featuredProjects: [],
        featuredStudios: [],
        recentProjects: [],
        designStudio: [],
    });

    useEffect(() => {
        handleRefresh();
    }, [isLoading, session]);

    useEffect(() => {
        on('tab-re-pressed', handleScrollToTop);
        return () => off('tab-re-pressed', handleScrollToTop);
    }, []);

    const fetchFeatured = useCallback(async () => {
        try {
            const res = await getFeatured();
            setFeaturedTab(res);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchLoves = useCallback(async () => {
        if (!session) return;
        try {
            const res = await getFollowingLoves(session);
            // newest projects first
            setProjectLoves(res
                ?.sort((a, b) => 
                    b.history.created.getTime() 
                  - a.history.created.getTime())
            );
        } catch (e) {
            console.error(e);
        }
    }, [session]);

    const fetchActivity = useCallback(async () => {
        if (!session) return;
        try {
            const res = await getFollowingActivity(session);
            setActivity(res);
        } catch (e) {
            console.error(e);
        }
    }, [session]);

    const handleRefresh = async () => {
        if (isLoading || !session) return;

        const { user } = session;
        if (!user) return;

        await Promise.all([
            fetchLoves(),
            fetchFeatured(),
            fetchActivity(),
        ]);

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

    const sdsName = featuredTab.designStudioTitle;

    const renderLovedProject = useCallback((project: Project) => <ProjectCard
        id={project.id}
        title={project.title}
        author={project.author.username}
        viewCount={project.stats.views}
    />, []);

    const renderFeaturedProject = useCallback((project: CarouselProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={project.author}
        loveCount={project.loves}
    />, []);

    const renderFeaturedStudio = useCallback((project: CarouselStudio) => <StudioCard
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
            <View style={styles.card}>
                <Heading style={styles.cardTitle}>
                    <FormattedMessage id="general.whatsHappening" />
                </Heading>
                <ActivityCard
                    activity={activity}
                    href="/activity"
                    showAvatars
                />
            </View>

            <Carousel 
                title="Loved by who I follow" 
                items={projectLoves}
                render={renderLovedProject}
            />

            <Carousel 
                title={t('splash.featuredProjects')}
                items={featuredTab.featuredProjects}
                render={renderFeaturedProject} 
            />

            <Carousel 
                title={t('splash.featuredStudios')}
                items={featuredTab.featuredStudios}
                render={renderFeaturedStudio}
            />

            { !!featuredTab.recentProjects.length && <Carousel 
                title="Recent Projects"
                items={featuredTab.recentProjects}
                render={renderFeaturedProject}
            /> }

            <Carousel 
                title={sdsName ?? '...'} 
                subtitle={t('splash.scratchDesignStudioTitle')}
                items={featuredTab.designStudio}
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

    card: {
        paddingTop: 20,
        gap: 12,
    },
    cardTitle: {
        fontSize: 24,
        paddingHorizontal: 16,
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
