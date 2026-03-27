import { ForwardedRef, forwardRef, memo, useEffect, useRef, useState } from 'react';
import {
    DeviceEventEmitter,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { Route } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Router, useRouter } from 'expo-router';

import type { 
    ScratchMystuffProjectItem, 
    ScratchMystuffStudioItem 
} from '@/util/types';

import { useSession } from '@/hooks/useSession';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useInfiniteMystuff } from '@/hooks/useInfiniteMystuff';

import MystuffRow from '@/components/panels/MystuffRow';
import Tabs from '@/components/general/Tabs';
import ListLoadMore from '@/components/panels/ListLoadMore';
import FiltersPanel, { Filter } from '@/components/general/FiltersPanel';
import ListLoading from '@/components/panels/ListLoading';

const TAB_ROUTES = [
    { key: 'projects', title: 'Projects' },
    { key: 'studios', title: 'Studios' },
    { key: 'trash', title: 'Trash' },
];
const tabKeys = TAB_ROUTES.map(route => route.key);

const TabProjects = memo(forwardRef(({ 
    projects,
    hasNextPage,
    isLoading,
    isFirstLoading,
    fetchNextPage,
    isRefreshing,
    handleRefresh,
    router,
    filters,
    filterValue,
    setFilterValue,
}: {
    projects: ScratchMystuffProjectItem[];
    hasNextPage: boolean;
    isLoading: boolean;
    isFirstLoading?: boolean;
    fetchNextPage: () => void;
    isRefreshing: boolean;
    handleRefresh: () => void;
    router: Router;

    filters?: Filter[];
    filterValue?: string[];
    setFilterValue?: (filters: string[]) => void;
}, ref: ForwardedRef<FlatList<any>>) => (
    <>
    { (filters && filterValue) ? <FiltersPanel
        filters={filters}
        value={filterValue}
        onChange={setFilterValue}
    /> : <View style={styles.divider} />}
    <FlatList
        data={projects}
        renderItem={({ item }) => (
            <MystuffRow 
                type='project' 
                item={item} 
                onPress={() => router.push(`/projects/${item.pk}`)} 
            />
        )}
        ref={ref}
        ListFooterComponent={isFirstLoading 
            ? <ListLoading /> 
            : <ListLoadMore
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                fetchNextPage={fetchNextPage}
            />
        }
        refreshControl={<RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
        />}
    />
    </>
)));

const TabStudios = memo(forwardRef(({ 
    studios,
    hasNextPage,
    isLoading,
    isFirstLoading,
    fetchNextPage,
    isRefreshing,
    handleRefresh,
    myUsername,
    router,
    filters,
    filterValue,
    setFilterValue,
}: {
    studios: ScratchMystuffStudioItem[];
    hasNextPage: boolean;
    isLoading: boolean;
    isFirstLoading?: boolean;
    fetchNextPage: () => void;
    isRefreshing: boolean;
    handleRefresh: () => void;
    myUsername?: string;
    router: Router;

    filters?: Filter[];
    filterValue?: string[];
    setFilterValue?: (filters: string[]) => void;
}, ref: ForwardedRef<FlatList<any>>) => (
    <>
    { filters && filterValue && <FiltersPanel
        filters={filters}
        value={filterValue}
        onChange={setFilterValue}
    />}
    <FlatList
        data={studios}
        renderItem={({ item }) => (
            <MystuffRow 
                type='studio' 
                item={item} 
                myUsername={myUsername} 
                onPress={() => router.push(`/studios/${item.pk}`)}
            />
        )}
        ref={ref}
        ListFooterComponent={isFirstLoading 
            ? <ListLoading /> 
            : <ListLoadMore
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                fetchNextPage={fetchNextPage}
            />
        }
        refreshControl={<RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
        />}
    />
    </>
)));

const MyStuffPage = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { session } = useSession();

    const [tabIndex, setTabIndex] = useState(0);

    const [ projectsRefreshing, setProjectsRefreshing ] = useState(true);
    const [ studiosRefreshing, setStudiosRefreshing ] = useState(true);
    const [ trashRefreshing, setTrashRefreshing ] = useState(true);

    const [ projectsFilters, setProjectsFilters ] = useState<string[]>(['all']);
    const [ studiosFilters, setStudiosFilters ] = useState<string[]>(['all']);

    const projectsListRef = useRef<FlatList<any>>(null);
    const studiosListRef = useRef<FlatList<any>>(null);
    const trashListRef = useRef<FlatList<any>>(null);

    const projects = useInfiniteMystuff({ type: 'projects', subtype: projectsFilters[0] as any, enabled: tabIndex === 0 });
    const studios = useInfiniteMystuff({ type: 'studios', subtype: studiosFilters[0] as any, enabled: tabIndex === 1 });
    const trash = useInfiniteMystuff({ type: 'projects', subtype: 'trashed', enabled: tabIndex === 2 });

    useEffect(() => {
        if (!projects.isLoading) setProjectsRefreshing(false);
        if (!studios.isLoading) setStudiosRefreshing(false);
        if (!trash.isLoading) setTrashRefreshing(false);
    }, [projects.isLoading, studios.isLoading, trash.isLoading]);

    useEffect(() => {
        DeviceEventEmitter.addListener('tab-re-pressed', handleScrollToTop);
        return () => DeviceEventEmitter.removeAllListeners();
    }, []);

    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: true,
        primaryColor: 'regular',
    });

    const handleProjectRefresh = () => {
        setProjectsRefreshing(true);
        projects.refresh();
    };
    const handleStudiosRefresh = () => {
        setStudiosRefreshing(true);
        studios.refresh();
    };
    const handleTrashRefresh = () => {
        setTrashRefreshing(true);
        trash.refresh();
    };

    const handleScrollToTop = (e: string) => {
        if (e !== 'mystuff') return;
        const listRef = 
            tabIndex === 0 ? projectsListRef :
            tabIndex === 1 ? studiosListRef :
            tabIndex === 2 ? trashListRef :
            null;
        if (!listRef) return;

        listRef.current?.scrollToIndex({ animated: false, index: 0 });
    };

    const renderScene = ({ route }: { route: Route }) => {
        if (Math.abs(tabIndex - tabKeys.indexOf(route.key)) > 1) return <View />;

        switch (route.key) {
            case 'projects': 
                return <TabProjects
                    projects={projects.data as ScratchMystuffProjectItem[]}
                    hasNextPage={projects.hasNextPage}
                    isLoading={projects.isLoading}
                    isFirstLoading={projects.isFirstLoading}
                    fetchNextPage={projects.fetchNextPage}
                    isRefreshing={projectsRefreshing}
                    handleRefresh={handleProjectRefresh}
                    router={router}
                    ref={projectsListRef}
                    filters={[
                        { key: 'shared', title: 'Public' },
                        { key: 'notshared', title: 'Private' },
                    ]}
                    filterValue={projectsFilters}
                    setFilterValue={setProjectsFilters}
                    key='projects'
                />;
            case 'studios':
                return <TabStudios
                    studios={studios.data as ScratchMystuffStudioItem[]}
                    hasNextPage={studios.hasNextPage}
                    isLoading={studios.isLoading}
                    isFirstLoading={studios.isFirstLoading}
                    fetchNextPage={studios.fetchNextPage}
                    isRefreshing={studiosRefreshing}
                    handleRefresh={handleStudiosRefresh}
                    ref={studiosListRef}
                    router={router}
                    myUsername={session?.user?.username}
                    filters={[
                        { key: 'owned', title: 'Hosted by me' },
                        { key: 'curated', title: 'Curated by me' },
                    ]}
                    filterValue={studiosFilters}
                    setFilterValue={setStudiosFilters}
                    key='studios'
                />;
            case 'trash':
                return <TabProjects
                    projects={trash.data as ScratchMystuffProjectItem[]}
                    hasNextPage={trash.hasNextPage}
                    isLoading={trash.isLoading}
                    fetchNextPage={trash.fetchNextPage}
                    isRefreshing={trashRefreshing}
                    handleRefresh={handleTrashRefresh}
                    router={router}
                    ref={trashListRef}
                    key='trash'
                />;
        }

        return <View />;
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 60 }]}>
            <View style={[styles.pageStart, { paddingTop: insets.top + 82 }]}>
                <Text style={styles.headingText}>My Stuff</Text>
            </View>

            <Tabs 
                routes={TAB_ROUTES}
                currentTab={tabIndex}
                onTabChange={setTabIndex}
                renderScene={renderScene}
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

    pageStart: {
        backgroundColor: '#1d2b4d',
        padding: 16,
        zIndex: 2,
        width: '100%',
    },

    headingText: {
        fontSize: 28,
        fontWeight: 900,
        color: '#fff',
    },

    divider: {
        height: 24,
    }
});
