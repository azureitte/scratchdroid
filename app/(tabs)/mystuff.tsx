import { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    View,
} from 'react-native';
import type { Route } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import type { 
    ScratchMystuffProjectItem, 
    ScratchMystuffStudioItem 
} from '@/util/types/api/account.types';
import { off, on } from '@/util/eventBus';

import { useSession } from '@/hooks/useSession';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useInfiniteMystuff } from '@/hooks/queries/useInfiniteMystuff';
import { useGlobalScroll } from '@/hooks/useGlobalScroll';

import MystuffRow from '@/components/panels/MystuffRow';
import FiltersPanel from '@/components/general/FiltersPanel';
import ScrollablePageHeader from '@/components/panels/ScrollablePageHeader';
import TabList, { TabListRenderScene } from '@/components/panels/TabList';

const TAB_ROUTES = [
    { key: 'projects', title: 'Projects' },
    { key: 'studios', title: 'Studios' },
    { key: 'trash', title: 'Trash' },
];

const HEADER_HEIGHT = 128;
const HEADER_STICK = 70;

const MyStuffPage = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { session } = useSession();

    const [tabIndex, setTabIndex] = useState(0);

    const [ projectsFilters, setProjectsFilters ] = useState<string[]>(['all']);
    const [ studiosFilters, setStudiosFilters ] = useState<string[]>(['all']);

    const projectsListRef = useRef<FlatList<any>>(null);
    const studiosListRef = useRef<FlatList<any>>(null);
    const trashListRef = useRef<FlatList<any>>(null);

    const projects = useInfiniteMystuff({ type: 'projects', subtype: projectsFilters[0] as any, enabled: tabIndex === 0 });
    const studios = useInfiniteMystuff({ type: 'studios', subtype: studiosFilters[0] as any, enabled: tabIndex === 1 });
    const trash = useInfiniteMystuff({ type: 'projects', subtype: 'trash', enabled: tabIndex === 2 });

    const { scroll: globalScroll, handleScrollChange } = useGlobalScroll({ scrollStick: HEADER_STICK });

    useEffect(() => {
        on('mystuff-tab-re-pressed', handleScrollToTop);
        return () => off('mystuff-tab-re-pressed', handleScrollToTop);
    }, []);

    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: true,
        primaryColor: 'regular',
    });

    const handleScrollToTop = () => {
        const listRef = 
            tabIndex === 0 ? projectsListRef :
            tabIndex === 1 ? studiosListRef :
            tabIndex === 2 ? trashListRef :
            null;
        if (!listRef) return;
        listRef.current?.scrollToOffset({ animated: false, offset: 0 });
    };

    const renderProjectItem = useCallback((item: ScratchMystuffProjectItem) => <MystuffRow 
        type='project' 
        item={item} 
        onPress={() => router.push(`/projects/${item.pk}`)}
    />, [router]);

    const renderStudioItem = useCallback((item: ScratchMystuffStudioItem) => <MystuffRow 
        type='studio' 
        item={item} 
        myUsername={session?.user?.username}
        onPress={() => router.push(`/studios/${item.pk}`)}
    />, [session, router]);

    const renderScene = useCallback((route: Route): TabListRenderScene => {
        switch (route.key) {
            case 'projects':
                return {
                    items: projects.data,
                    render: renderProjectItem,
                    hasNextPage: projects.hasNextPage,
                    isLoading: projects.isLoading,
                    isFirstLoading: projects.isFirstLoading,
                    fetchNextPage: projects.fetchNextPage,
                    onRefresh: projects.refresh,
                    header: <FiltersPanel
                        filters={[
                            { key: 'public', title: 'Public' },
                            { key: 'private', title: 'Private' },
                        ]}
                        value={projectsFilters}
                        onChange={setProjectsFilters}
                    />,
                    ref: projectsListRef,
                }
            case 'studios':
                return {
                    items: studios.data,
                    render: renderStudioItem,
                    hasNextPage: studios.hasNextPage,
                    isLoading: studios.isLoading,
                    isFirstLoading: studios.isFirstLoading,
                    fetchNextPage: studios.fetchNextPage,
                    onRefresh: studios.refresh,
                    header: <FiltersPanel
                        filters={[
                            { key: 'owned', title: 'Hosted by me' },
                            { key: 'curated', title: 'Curated by me' },
                        ]}
                        value={studiosFilters}
                        onChange={setStudiosFilters}
                    />,
                    ref: studiosListRef,
                }
            case 'trash':
                return {
                    items: trash.data,
                    render: renderProjectItem,
                    hasNextPage: trash.hasNextPage,
                    isLoading: trash.isLoading,
                    fetchNextPage: trash.fetchNextPage,
                    ref: trashListRef,
                }
            default:
                return {
                    items: [],
                    render: () => <View />,
                    hasNextPage: false,
                    isLoading: false,
                    isFirstLoading: false,
                    fetchNextPage: () => {},
                }
        }
    }, [projectsFilters, studiosFilters, tabIndex, projects, studios, trash]);

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 60 }]}>
            <ScrollablePageHeader
                scrollY={globalScroll}
                headerStick={HEADER_STICK}
                title="My Stuff"
            />

            <TabList
                routes={TAB_ROUTES}
                currentTab={tabIndex}
                onTabChange={setTabIndex}
                onTabBecomeActive={handleScrollChange}
                renderScene={renderScene}
                globalScrollY={globalScroll}
                headerHeight={HEADER_HEIGHT}
                scrollStick={HEADER_STICK}
            />
        </View>
    );
};

export default MyStuffPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: '#121212',
    },
});
