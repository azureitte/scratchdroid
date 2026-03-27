import { ForwardedRef, forwardRef, memo, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { Route, TabBar, TabView } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/hooks/useSession';
import { useInfiniteMystuff } from '@/hooks/useInfiniteMystuff';
import Button from '@/components/general/Button';
import { ScratchMystuffProjectItem, ScratchMystuffStudioItem } from '@/util/types';
import MystuffRow from '@/components/panels/MystuffRow';
import { Router, useRouter } from 'expo-router';

const TAB_ROUTES = [
    { key: 'projects', title: 'Projects' },
    { key: 'studios', title: 'Studios' },
    { key: 'trash', title: 'Trash' },
];
const tabKeys = TAB_ROUTES.map(route => route.key);

const PageEnd = ({
    hasNextPage,
    isLoading,
    fetchNextPage,
}: {
    hasNextPage: boolean;
    isLoading: boolean;
    fetchNextPage: () => void;
}) => (
    <View style={[styles.pageEnd]}>
        { hasNextPage && <Button
            text="Load More"
            role="primary"
            fullWidth
            isLoading={isLoading}
            onPress={fetchNextPage}
        /> }
    </View>
);

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
        ListFooterComponent={<PageEnd
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
        ListFooterComponent={<PageEnd
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

const CustomTabBar = (props: any) => (
    <TabBar
        {...props}
        indicatorStyle={styles.tabIndicator}
        style={styles.tabBar}
    />
);

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
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 60 }]}>
            <View style={[styles.pageStart, { paddingTop: insets.top + 82 }]}>
                <Text style={styles.headingText}>My Stuff</Text>
            </View>

            <TabView
                navigationState={{ index: tabIndex, routes: TAB_ROUTES }}
                renderScene={renderScene}
                onIndexChange={setTabIndex}
                initialLayout={{ width: screen.width, height: 0 }}
                style={styles.tabContainer}
                renderTabBar={CustomTabBar}
                options={TAB_ROUTES.reduce((acc, route) => {
                    acc[route.key] = {
                        label: ({ route, labelText, focused, color }: any) => (
                            <Text
                                style={[
                                    styles.tabLabel,
                                    focused && styles.tabLabelFocused,
                                ]}
                            >
                                {labelText ?? route.name}
                            </Text>
                        ),
                    };
                    return acc;
                }, {} as any)}
                lazy
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

    tabContainer: {
        flex: 1,
    },

    tabPager: {
        height: '100%',
    },

    tabBar: {
        height: 46,
        backgroundColor: '#1d2b4d',
        alignItems: 'center',
        width: Dimensions.get('window').width,
    },
    tabIndicator: {
        backgroundColor: '#71A3FF',
        height: 5,
        borderRadius: 5,
        marginHorizontal: 8,
    },

    pageStart: {
        backgroundColor: '#1d2b4d',
        padding: 16,
        zIndex: 2,
        width: '100%',
    },
    pageEnd: {
        padding: 8,
        paddingTop: 16,
        paddingBottom: 24,
        width: '100%',
    },

    headingText: {
        fontSize: 28,
        fontWeight: 900,
        color: '#fff',
    },

    tabLabel: {
        fontSize: 18,
        fontWeight: 500,
        color: '#ffffffdf',
        minWidth: 100,
        textAlign: 'center',
        marginBottom: 10,
    },
    tabLabelFocused: {
        color: '#fff',
        fontWeight: 600,
    },
});
