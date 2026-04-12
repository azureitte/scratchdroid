import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';

import { ActivityUnit } from '@/util/types/activity.types';

import { useInfiniteActivity } from '@/hooks/queries/useInfiniteActivity';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';

import ListLoading from '@/components/panels/ListLoading';
import ActivityRow from '@/components/panels/ActivityRow';
import ScrollablePageHeader from '@/components/panels/ScrollablePageHeader';
import ListLoadMore from '@/components/panels/ListLoadMore';

const HEADER_HEIGHT = 131;
const HEADER_STICK = 105;


const UserActivityPage = () => {

    const { username } = useLocalSearchParams<{ 
        username: string,
    }>();
    const insets = useSafeAreaInsets();

    const activity = useInfiniteActivity({ type: 'user', username });

    const [isRefreshing, setIsRefreshing] = useState(true);
    const listRef = useRef<FlatList<any>>(null);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollY.value = e.contentOffset.y;
        },
    });

    useEffect(() => {
        if (!activity.isLoading) setIsRefreshing(false);
    }, [activity.isLoading]);

    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: false,
        primaryColor: 'regular',
    });

    const handleRefresh = () => {
        setIsRefreshing(true);
        activity.refresh();
    };

    const renderItem = useCallback(({ item }: {
        item: ActivityUnit;
        index: number;
    }) => (<ActivityRow
        unit={item}
        linkActor={false}
        variation="full"
    />), []);

    return (
        <View style={styles.container}>
            <View style={[
                styles.activityContainer,
                { marginBottom: insets.bottom },
            ]}>
                <ScrollablePageHeader
                    scrollY={scrollY}
                    headerStick={HEADER_STICK}
                    title={`@${username}'s Activity`}
                />

                <Animated.FlatList
                    data={activity.activity}
                    renderItem={renderItem}
                    keyExtractor={(item): any => item.id}
                    ref={listRef}
                    ListFooterComponent={activity.isFirstLoading
                        ? <ListLoading />
                        : <ListLoadMore
                            hasNextPage={activity.hasNextPage}
                            isLoading={activity.isLoading}
                            fetchNextPage={activity.fetchNextPage}
                        />}
                    refreshControl={<RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        progressViewOffset={insets.top + HEADER_HEIGHT}
                    />}
                    contentContainerStyle={{ paddingTop: insets.top + HEADER_HEIGHT }}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    initialNumToRender={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                />

            </View>
        </View>
    );
    
};

export default UserActivityPage;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
    },
    activityContainer: {
        width: '100%',
        overflow: 'scroll',
        marginBottom: 16,
    },
});
