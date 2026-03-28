import { Dimensions, StyleSheet, Text, useWindowDimensions, ViewStyle } from 'react-native';
import { useLayoutEffect, useState } from 'react';
import { Route, TabBar, TabView } from 'react-native-tab-view';
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

export type TabsProps = {
    routes: Route[];
    currentTab: number;
    onTabChange: (index: number) => void;
    renderScene: ({ route }: { route: Route }) => React.JSX.Element,

    style?: ViewStyle;
    variation?: 'regular' | 'explore';

    scrollY?: SharedValue<number>;
    scrollStick?: number;
    scrollMax?: number;
};

type TabBarProps = {
    variation: 'regular' | 'explore';
    scrollY?: SharedValue<number>;
    scrollStick?: number;
    scrollMax?: number;
    [key: string]: any;
};

const CustomTabBar = (props: TabBarProps) => {

    const scrollMax = props.scrollMax ?? 0;
    const scrollStick = props.scrollStick ?? 50;

    const tabBarStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            props.scrollY?.value ?? 0, 
            [0, scrollStick], 
            [scrollMax, scrollMax - scrollStick],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }],
        };
    });

    
    const otherProps = Object.keys(props).reduce((acc, key) => {
        if (key === 'variation') return acc;
        if (key === 'scrollY') return acc;
        if (key === 'scrollStick') return acc;
        if (key === 'scrollMax') return acc;
        acc[key] = props[key];
        return acc;
    }, {} as any);

    return (
        <Animated.View style={[{ zIndex: 2 }, tabBarStyle]}>
        <TabBar
            {...otherProps}
            indicatorStyle={[
                styles.tabIndicator, 
                props.variation === 'explore' && styles.tabIndicatorExplore
            ]}
            style={[
                styles.tabBar, 
                props.variation === 'explore' && styles.tabBarExplore
            ]}
        />
        </Animated.View>
    )
};

const Tabs = ({
    routes,
    currentTab,
    onTabChange,
    renderScene,

    style,
    variation = 'regular',
    scrollY,
    scrollStick,
    scrollMax,
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
            renderTabBar={props => <CustomTabBar
                {...props} 
                variation={variation} 
                scrollY={scrollY}
                scrollStick={scrollStick}
                scrollMax={scrollMax}
            />}
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

    tabBarExplore: {
        backgroundColor: '#183729',
    },
    tabIndicatorExplore: {
        backgroundColor: '#43BA85',
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
