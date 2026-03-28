import { memo, forwardRef, useState, useEffect, JSX, ForwardedRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import ListLoading from './ListLoading';
import ListLoadMore from './ListLoadMore';
import { Route } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Tabs from '../general/Tabs';

const LIST_GAP = 16;

const SingleTab = memo(forwardRef(({ 
    items,
    render,
    children,
    hasNextPage,
    isLoading,
    isFirstLoading,
    fetchNextPage,
    isActive,
    onActive,
    onRefresh,
    headerHeight = 0,
    scrollStick = 50,
    scrollMax = 0,
    globalScrollY,
}: {
    items: any[];
    render: (item: any) => JSX.Element;

    children?: JSX.Element;

    hasNextPage: boolean;
    isLoading: boolean;
    isFirstLoading?: boolean;
    fetchNextPage: () => void;
    onRefresh?: () => void;

    isActive: boolean;
    onActive?: (scrollY: number) => void;

    headerHeight?: number;
    scrollStick?: number;
    scrollMax?: number;
    globalScrollY?: SharedValue<number>;
}, ref: ForwardedRef<FlatList<any>>) => {

    const [ isRefreshing, setIsRefreshing ] = useState(true);

    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler({ onScroll: (e) => {
        scrollY.value = e.contentOffset.y;
        if (isActive && globalScrollY) globalScrollY.value = e.contentOffset.y;
    }});

    useEffect(() => {
        if (!isLoading) setIsRefreshing(false);
    }, [isLoading]);

    useEffect(() => {
        if (isActive) onActive?.(scrollY.value);
    }, [isActive]);

    const childHolderStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY?.value ?? 0, 
            [0, scrollStick], 
            [scrollMax, scrollMax - scrollStick],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }],
        };
    });
    
    return (<>
        <Animated.View style={[
            children ? styles.childHolder : styles.divider,
            childHolderStyle,
        ]}>
            { children }
        </Animated.View>
        
        <Animated.FlatList
            data={items}
            renderItem={({ item }) => render(item)}
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
                onRefresh={() => {
                    setIsRefreshing(true);
                    onRefresh?.();
                }}
            />}
            contentContainerStyle={{ 
                paddingTop: headerHeight - scrollStick + LIST_GAP,
            }}
            onScroll={handleScroll}
        />
    </>);

}));

export type TabListRenderScene = {
    items: any[];
    render: (item: any) => JSX.Element;
    hasNextPage: boolean;
    isLoading: boolean;
    isFirstLoading?: boolean;
    onRefresh?: () => void;
    fetchNextPage: () => void;
    header?: JSX.Element;
}

type TabListProps = {
    routes: Route[];
    currentTab: number;
    onTabChange: (index: number) => void;
    onTabBecomeActive?: (newScrollY: number) => void;
    renderScene: (route: Route) => TabListRenderScene,
    globalScrollY?: SharedValue<number>;
    headerHeight?: number;
    scrollStick?: number;
}

const TabList = ({
    routes,
    currentTab,
    onTabChange,
    onTabBecomeActive,
    renderScene,
    globalScrollY,
    headerHeight = 0,
    scrollStick = 50,
}: TabListProps) => {
    const insets = useSafeAreaInsets();

    const trueRenderScene = ({ route }: { route: Route }) => {
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].key === route.key) {
                const data = renderScene(route);
                return <SingleTab
                    items={data.items}
                    render={data.render}
                    hasNextPage={data.hasNextPage}
                    isLoading={data.isLoading}
                    isFirstLoading={data.isFirstLoading}
                    fetchNextPage={data.fetchNextPage}
                    isActive={currentTab === i}
                    onRefresh={data.onRefresh}
                    onActive={onTabBecomeActive}
                    globalScrollY={globalScrollY}
                    headerHeight={headerHeight}
                    scrollStick={scrollStick}
                    scrollMax={scrollStick}
                    key={route.key}
                > 
                    { data.header }
                </SingleTab>
            }
        }
        return <View />;
    };

    return <Tabs 
        routes={routes}
        currentTab={currentTab}
        onTabChange={onTabChange}
        renderScene={trueRenderScene}
        style={{ paddingTop: insets.top + headerHeight - scrollStick }}
        scrollY={globalScrollY}
        scrollStick={scrollStick}
        scrollMax={scrollStick}
    />;
};

export default TabList;

const styles = StyleSheet.create({
    divider: {
        height: 24,
    },
    childHolder: {
        width: '100%',
        zIndex: 1,
    },
});
