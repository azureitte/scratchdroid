import { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useIsFocused } from 'expo-router';

import { off, on } from '@/util/eventBus';
import type { MessageQueryItem } from '@/util/types/messages.types';

import { useSession } from '@/hooks/useSession';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useUnreadCount } from '@/hooks/queries/useUnreadCount';
import { useInfiniteMessages } from '@/hooks/queries/useInfiniteMessages';
import { useMarkMessagesRead } from '@/hooks/mutations/useMarkMessagesRead';
import { useDeleteMessage } from '@/hooks/mutations/useDeleteMessage';

import MessageRow from '@/components/panels/MessageRow';
import ListLoadMore from '@/components/panels/ListLoadMore';
import ScrollablePageHeader from '@/components/panels/ScrollablePageHeader';
import ListLoading from '@/components/panels/ListLoading';
import AdminAlertRow from '@/components/panels/AdminAlertRow';

const HEADER_HEIGHT = 131;
const HEADER_STICK = 105;

const MessagesPage = () => {
    
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const messages = useInfiniteMessages();
    const unreadCount = useUnreadCount(true);
    const markRead = useMarkMessagesRead();
    const deleteMessage = useDeleteMessage();

    const { session } = useSession();

    const [isRefreshing, setIsRefreshing] = useState(true);
    const listRef = useRef<FlatList<any>>(null);


    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollY.value = e.contentOffset.y;
        },
    });


    useEffect(() => {
        if (!messages.isLoading) setIsRefreshing(false);
    }, [messages.isLoading]);

    useEffect(() => {
        if (!isRefreshing && !isFocused) return;

        setTimeout(() => {
            if (isRefreshing) markRead();
            messages.refreshUnreadCount();
        }, 1000);
    }, [isRefreshing, isFocused]);

    useEffect(() => {
        on('messages-tab-re-pressed', handleScrollToTop);
        return () => off('messages-tab-re-pressed', handleScrollToTop);
    }, []);

    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: true,
        primaryColor: 'regular',
    });


    const handleRefresh = () => {
        setIsRefreshing(true);
        messages.refresh();
    };

    const handleScrollToTop = () => {
        listRef.current?.scrollToOffset({ animated: false, offset: 0 });
    };

    const handleDeleteMessage = useCallback((id: number) => {
        deleteMessage(id);
        messages.deleteMessageDirectly(id);
    }, [deleteMessage, messages]);

    const renderItem = useCallback(({ item, index: idx }: {
        item: MessageQueryItem;
        index: number;
    }) => (
        item.type === 'adminAlert' 
            ? <AdminAlertRow
                message={item.message}
                onClose={() => handleDeleteMessage(item.message.id)}
            />
            : <MessageRow
                message={item.message}
                isUnread={idx < unreadCount}
                myUsername={session?.user?.username}
            />
    ), [unreadCount, session]);

    return (
        <View style={styles.container}>
            <View style={[
                styles.messagesContainer,
                { marginBottom: insets.bottom + 60 },
            ]}>
                <ScrollablePageHeader
                    scrollY={scrollY}
                    headerStick={HEADER_STICK}
                    title="Messages"
                />

                <Animated.FlatList
                    data={messages.messages}
                    renderItem={renderItem}
                    keyExtractor={(item): any => item.message.id}
                    ref={listRef}
                    ListFooterComponent={messages.isFirstLoading
                        ? <ListLoading />
                        : <ListLoadMore
                            hasNextPage={messages.hasNextPage}
                            isLoading={messages.isLoading}
                            fetchNextPage={messages.fetchNextPage}
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

export default MessagesPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#121212',
    },
    messagesContainer: {
        width: '100%',
        overflow: 'scroll',
        marginBottom: 16,
    },
});
