import { useEffect, useRef, useState } from 'react';
import {
    DeviceEventEmitter,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useIsFocused } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '../../hooks/useSession';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { useInfiniteMessages } from '../../hooks/useInfiniteMessages';
import { useMarkMessagesRead } from '../../hooks/useMarkMessagesRead';

import MessageRow from '../../components/MessageRow';
import Button from '../../components/Button';

const MessagesPage = () => {
    
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const isFocused = useIsFocused();

    const messages = useInfiniteMessages();
    const unreadCount = useUnreadMessages(true);
    const markRead = useMarkMessagesRead();

    const { session } = useSession();

    const [isRefreshing, setIsRefreshing] = useState(true);
    const listRef = useRef<FlatList<any>>(null);


    useEffect(() => {
        if (!messages.isLoading) setIsRefreshing(false);
    }, [messages.isLoading]);

    useEffect(() => {
        if (!isRefreshing && !isFocused) return;

        setTimeout(() => {
            if (isRefreshing) markRead();
            queryClient.invalidateQueries({
                queryKey: ['unread', false, false],
            });
        }, 1000);
    }, [isRefreshing, isFocused]);

    useEffect(() => {
        DeviceEventEmitter.addListener('tab-re-pressed', handleScrollToTop);
        return () => DeviceEventEmitter.removeAllListeners();
    }, []);


    const handleRefresh = () => {
        setIsRefreshing(true);
        messages.resetToFirstPage();
        queryClient.invalidateQueries({
            queryKey: ['messages', false],
        });
    };

    const handleScrollToTop = (e: string) => {
        if (e !== 'messages') return;
        listRef.current?.scrollToIndex({ animated: false, index: 0 });
    };

    
    const pageEnd = (
        <View style={[styles.pageEnd]}>
            { messages.hasNextPage && <Button
                text="Load More"
                role="primary"
                fullWidth
                isLoading={messages.isLoading}
                onPress={messages.fetchNextPage}
            /> }
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={[
                styles.messagesContainer,
                { marginBottom: insets.bottom + 60 },
            ]}>

                <View style={[styles.pageStart, { 
                    paddingTop: insets.top + 82 
                }]}>
                    <Text style={styles.headingText}>Messages</Text>
                </View>

                <FlatList
                    data={messages.messages}
                    renderItem={({ item: message, index: idx }) => (
                        <MessageRow
                            key={message.id}
                            message={message}
                            isUnread={idx < unreadCount}
                            myUsername={session?.user?.username}
                        />
                    )}
                    ref={listRef}
                    ListFooterComponent={pageEnd}
                    refreshControl={<RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                    />}
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
    codeBlockText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
    },

    pageStart: {
        backgroundColor: '#1d2b4d',
        padding: 16,
        zIndex: 2,
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
});
