import { Dimensions, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useLayoutEffect, useState } from 'react';
import { Route, TabBar, TabView } from 'react-native-tab-view';

export type TabsProps = {
    routes: Route[];
    currentTab: number;
    onTabChange: (index: number) => void;
    renderScene: ({ route }: { route: Route }) => React.JSX.Element,

    style?: StyleSheet.NamedStyles<any>;
};

const CustomTabBar = (props: any) => (
    <TabBar
        {...props}
        indicatorStyle={styles.tabIndicator}
        style={styles.tabBar}
    />
);

const Tabs = ({
    routes,
    currentTab,
    onTabChange,
    renderScene,

    style,
}: TabsProps) => {
    const screen = useWindowDimensions();
    const [flickerFix, setFlickerFix] = useState(false);
    
    useLayoutEffect(() => {
        setTimeout(() => setFlickerFix(!flickerFix), 0);
    }, [currentTab]);
    
    return (
        <TabView
            navigationState={{ index: currentTab, routes }}
            renderScene={renderScene}
            onIndexChange={onTabChange}
            initialLayout={{ width: screen.width, height: 0 }}
            style={[styles.tabContainer, style]}
            renderTabBar={CustomTabBar}
            options={routes.reduce((acc, route) => {
                acc[route.key] = {
                    label: ({ route, labelText, focused }: any) => (
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
    );
};

export default Tabs;

const styles = StyleSheet.create({
    tabContainer: {
        flex: 1,
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
