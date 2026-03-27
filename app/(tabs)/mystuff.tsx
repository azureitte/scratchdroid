import { ForwardedRef, forwardRef, memo, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    useWindowDimensions,
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
import { useInfiniteMystuff } from '@/hooks/useInfiniteMystuff';

import MystuffRow from '@/components/panels/MystuffRow';
import Tabs from '@/components/general/Tabs';
import ListLoadMore from '@/components/panels/ListLoadMore';

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
    fetchNextPage,
    isRefreshing,
    handleRefresh,
    router,
}: {
    projects: ScratchMystuffProjectItem[];
    hasNextPage: boolean;
    isLoading: boolean;
    fetchNextPage: () => void;
    isRefreshing: boolean;
    handleRefresh: () => void;
    router: Router;
}, ref: ForwardedRef<FlatList<any>>) => (
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
        ListFooterComponent={<ListLoadMore
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            fetchNextPage={fetchNextPage}
        />}
        refreshControl={<RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
        />}
    />
)));

const TabStudios = memo(forwardRef(({ 
    studios,
    hasNextPage,
    isLoading,
    fetchNextPage,
    isRefreshing,
    handleRefresh,
    myUsername,
    router,
}: {
    studios: ScratchMystuffStudioItem[];
    hasNextPage: boolean;
    isLoading: boolean;
    fetchNextPage: () => void;
    isRefreshing: boolean;
    handleRefresh: () => void;
    myUsername?: string;
    router: Router;
}, ref: ForwardedRef<FlatList<any>>) => (
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
        ListFooterComponent={<ListLoadMore
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            fetchNextPage={fetchNextPage}
        />}
        refreshControl={<RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
        />}
    />
)));

const MyStuffPage = () => {
    const screen = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { session } = useSession();

    const [tabIndex, setTabIndex] = useState(0);

    const projects = useInfiniteMystuff({ type: 'projects', subtype: 'all', enabled: tabIndex === 0 });
    const studios = useInfiniteMystuff({ type: 'studios', subtype: 'all', enabled: tabIndex === 1 });
    const trash = useInfiniteMystuff({ type: 'projects', subtype: 'trashed', enabled: tabIndex === 2 });

    const [ projectsRefreshing, setProjectsRefreshing ] = useState(true);
    const [ studiosRefreshing, setStudiosRefreshing ] = useState(true);
    const [ trashRefreshing, setTrashRefreshing ] = useState(true);

    const projectsListRef = useRef<FlatList<any>>(null);
    const studiosListRef = useRef<FlatList<any>>(null);
    const trashListRef = useRef<FlatList<any>>(null);

    useEffect(() => {
        if (!projects.isLoading) setProjectsRefreshing(false);
        if (!studios.isLoading) setStudiosRefreshing(false);
        if (!trash.isLoading) setTrashRefreshing(false);
    }, [projects.isLoading, studios.isLoading, trash.isLoading]);

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

    const renderScene = ({ route }: { route: Route }) => {
        if (Math.abs(tabIndex - tabKeys.indexOf(route.key)) > 1) return <View />;

        switch (route.key) {
            case 'projects': 
                return <TabProjects
                    projects={projects.data as ScratchMystuffProjectItem[]}
                    hasNextPage={projects.hasNextPage}
                    isLoading={projects.isLoading}
                    fetchNextPage={projects.fetchNextPage}
                    isRefreshing={projectsRefreshing}
                    handleRefresh={handleProjectRefresh}
                    router={router}
                    ref={projectsListRef}
                    key='projects'
                />;
            case 'studios':
                return <TabStudios
                    studios={studios.data as ScratchMystuffStudioItem[]}
                    hasNextPage={studios.hasNextPage}
                    isLoading={studios.isLoading}
                    fetchNextPage={studios.fetchNextPage}
                    isRefreshing={studiosRefreshing}
                    handleRefresh={handleStudiosRefresh}
                    ref={studiosListRef}
                    router={router}
                    myUsername={session?.user?.username}
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
});
