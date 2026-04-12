import { Dimensions, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { RefObject, useLayoutEffect, useState } from 'react';
import { Route, TabBar, TabView } from 'react-native-tab-view';
import Animated from 'react-native-reanimated';

const TAB_BAR_HEIGHT = 32;
const TAB_INDICATOR_SIZE = 8;
const TAB_INDICATOR_GAP = 10;

export type SwiperProps = {
    routes: Route[];
    renderScene: ({ route }: { route: Route }) => React.JSX.Element,
    childRef: RefObject<View|null>;
};

const CustomTabBar = (props: any) => {
    const tabsCount = props.navigationState.routes.length;

    return (
        <Animated.View>
        <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={[styles.tabBar, {
                width: (TAB_INDICATOR_SIZE * tabsCount) + (TAB_INDICATOR_GAP * (tabsCount + 1)),
            }]}
        />
        </Animated.View>
    )
};

const Swiper = ({
    routes,
    renderScene,
    childRef,
}: SwiperProps) => {
    const screen = useWindowDimensions();
    const [flickerFix, setFlickerFix] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    
    useLayoutEffect(() => {
        setTimeout(() => setFlickerFix(!flickerFix), 0);
    }, [currentTab]);

    const childHeight = childRef.current?.getBoundingClientRect().height ?? 0;
    
    return (
        <TabView
            navigationState={{ index: currentTab, routes }}
            renderScene={renderScene}
            tabBarPosition="bottom"
            onIndexChange={setCurrentTab}
            initialLayout={{ width: screen.width, height: childHeight + TAB_BAR_HEIGHT }}
            style={[styles.tabContainer, {
                height: childHeight + TAB_BAR_HEIGHT,
            }]}
            renderTabBar={props => <CustomTabBar {...props} />}
            options={routes.reduce((acc, route) => {
                acc[route.key] = {
                    label: ({ focused }: any) => (
                        <View
                            style={[
                                styles.tabLabel,
                                focused && styles.tabLabelFocused,
                            ]}
                        />
                    ),
                };
                return acc;
            }, {} as any)}
            lazy
        />
    );
};

export default Swiper;

const styles = StyleSheet.create({
    tabContainer: {
        flex: 1,
        minHeight: 200,
    },
    tabBar: {
        height: TAB_BAR_HEIGHT,
        backgroundColor: '#0000',
        alignItems: 'center',
        marginHorizontal: 'auto',
    },
    tabIndicator: {
        backgroundColor: '#93C0FF',
        height: TAB_INDICATOR_SIZE,
        width: TAB_INDICATOR_SIZE,
        borderRadius: TAB_INDICATOR_SIZE,
        margin: 'auto',
        marginBottom: TAB_INDICATOR_SIZE,
        zIndex: 2,
    },

    tabBarExplore: {
        backgroundColor: '#183729',
    },
    tabIndicatorExplore: {
        backgroundColor: '#43BA85',
    },

    tabLabel: {
        backgroundColor: '#414141',
        height: TAB_INDICATOR_SIZE,
        width: TAB_INDICATOR_SIZE,
        borderRadius: TAB_INDICATOR_SIZE,
        marginBottom: TAB_INDICATOR_SIZE,
    },
    tabLabelFocused: {
        backgroundColor: '#93C0FF',
    },
});
