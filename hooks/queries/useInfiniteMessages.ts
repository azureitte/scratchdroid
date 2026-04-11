import { useCallback } from "react";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { MessageQueryItem } from "@/util/types/app/query.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

const MESSAGES_PER_PAGE = 40;

export const useInfiniteMessages = () => {
    const queryClient = useQueryClient();
    const { isLoading: isSessionLoading, session, isLoggedIn } = useSession();
    const { q: { getMessages, getAdminAlerts } } = useApi();

    const { 
        data, 
        isFetchingNextPage, 
        isRefetching, 
        fetchNextPage, 
        hasNextPage, 
        isSuccess, 
        isLoading 
    } = useInfiniteQuery<
        MessageQueryItem[], Error, 
        InfiniteData<MessageQueryItem[]>, 
        ['messages'], 
        number
    >({
        queryKey: ['messages'],
        queryFn: async ({ pageParam }) => {
            if (isSessionLoading || !session.user) return [];

            queryClient.invalidateQueries({ 
                queryKey: ['unread'] 
            });

            const fetchMessages = async (): Promise<MessageQueryItem[]> => {
                if (!session.user) return [];
                return getMessages(session, pageParam);
            }

            const fetchAdminAlerts = async (): Promise<MessageQueryItem[]> => {
                if (!session.user) return [];
                if (pageParam !== 0) return [];
                return getAdminAlerts(session);
            }

            const [ messages, adminAlerts ] = await Promise.all([
                fetchMessages(),
                fetchAdminAlerts(),
            ]);

            return [...adminAlerts, ...messages];
        },
        getNextPageParam: (currentPage, allPages) => currentPage.length < MESSAGES_PER_PAGE 
            ? undefined 
            : allPages.indexOf(currentPage) + 1,
        getPreviousPageParam: (currentPage, allPages) => allPages.indexOf(currentPage) - 1,
        initialPageParam: 0,

        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        enabled: !isSessionLoading && isLoggedIn,
    });

    const resetToFirstPage = () => {
        queryClient.setQueryData(['messages'], (data: InfiniteData<MessageQueryItem[]>) => {
            if (!data) return undefined;
            return {
                pages: [data.pages[0]], // Keep only the first page
                pageParams: [data.pageParams[0]], // Keep only the first page param
            };
        });
    };

    const refresh = () => {
        resetToFirstPage();
        queryClient.invalidateQueries({
            queryKey: ['messages'],
        });
    }

    const refreshUnreadCount = () => {
        queryClient.invalidateQueries({ 
            queryKey: ['unread', { persist: false }] 
        });
    }

    const deleteMessageDirectly = useCallback((id: number) => {
        queryClient.setQueryData(['messages'], (oldData: InfiniteData<MessageQueryItem[]>) => {
            if (!oldData) return oldData;
            const newData = oldData.pages.map(p => p.filter(m => m.message.id !== id));
            return {
                pages: newData,
                pageParams: oldData.pageParams,
            };
        });
    }, []);

    return { 
        messages: data 
            ? data.pages.flat() 
            : [], 
        isLoading: isRefetching || isFetchingNextPage, 
        isFirstLoading: isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        resetToFirstPage,
        refresh,
        refreshUnreadCount,
        deleteMessageDirectly,
        isSuccess,
    };
};