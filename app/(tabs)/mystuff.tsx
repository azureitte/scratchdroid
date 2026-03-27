import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '../../hooks/useSession';
import { apiReq } from '../../util/api';

const TAB_ROUTES = [
    { key: 'projects', title: 'Projects' },
    { key: 'studios', title: 'Studios' },
    { key: 'trash', title: 'Trash' },
];

const renderScene = SceneMap({
    projects: () => <Text>Projects</Text>,
    studios: () => <Text>Studios</Text>,
    trash: () => <Text>Trash</Text>,
});

const MyStuffPage = () => {
    const screen = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [tabIndex, setTabIndex] = useState(0);

    const { isLoading, session } = useSession();

    // useEffect(() => {
    //     if (isLoading || !session) return;
    //     (async () => {
    //         const { user } = session;
    //         if (!user) return;

    //         const projectsRes = await apiReq({
    //             path: "/site-api/projects/all/",
    //             params: { limit: 10, offset: 0 },
    //             responseType: "json",
    //         });
    //         if (!projectsRes.success) return;

    //         const projects = projectsRes.data;
    //         setDebugTextProjects(JSON.stringify(projects, null, 2));
    //     })();
    // }, [isLoading, session]);

    const tabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
        />
    );

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 60 }]}>
            <View style={[styles.pageStart, { paddingTop: insets.top + 82 }]}>
                <Text style={styles.headingText}>My Stuff</Text>
            </View>

            <TabView
                navigationState={{ index: tabIndex, routes: TAB_ROUTES }}
                renderScene={renderScene}
                onIndexChange={setTabIndex}
                initialLayout={{ width: screen.width }}
                style={styles.tabContainer}
                renderTabBar={tabBar}
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
