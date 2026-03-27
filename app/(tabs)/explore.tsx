import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Route } from 'react-native-tab-view';

import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import Tabs from '@/components/general/Tabs';

const TAB_ROUTES = [
    { key: 'projects', title: 'Projects' },
    { key: 'studios', title: 'Studios' },
];

const ExplorePage = () => {

    const insets = useSafeAreaInsets();

    const [tabIndex, setTabIndex] = useState(0);

    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: true,
        primaryColor: 'explore',
    });

    const renderScene = ({ route }: { route: Route }) => <Text>{route.key}</Text>;

    return (
        <View style={styles.container}>
            <View style={[styles.pageStart, { paddingTop: insets.top + 82 }]}>
                <Text style={styles.headingText}>Explore</Text>
            </View>
            <Tabs 
                routes={TAB_ROUTES}
                currentTab={tabIndex}
                onTabChange={setTabIndex}
                renderScene={renderScene}
                variation='explore'
            />
        </View>
    );
};

export default ExplorePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: '#121212',
    },

    pageStart: {
        backgroundColor: '#183729',
        padding: 16,
        zIndex: 2,
        width: '100%',
    },

    headingText: {
        fontSize: 28,
        fontWeight: 900,
        color: '#fff',
        textAlign: 'center',
    },
});
