import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "../../util/api";
import { useSession } from "../useSession";
import type { MessageQueryItem, ScratchAdminAlert, ScratchMessage } from "../../util/types";
import { useCallback } from "react";

const MESSAGES_PER_PAGE = 40;

export const useInfiniteMessages = () => {
    const { isLoading: isSessionLoading, session, isLoggedIn } = useSession();
    const queryClient = useQueryClient();

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
                const messagesRes = await apiReq<ScratchMessage[]>({
                    host: 'https://api.scratch.mit.edu',
                    path: `/users/${session.user.username}/messages`,
                    params: { limit: MESSAGES_PER_PAGE, offset: pageParam * MESSAGES_PER_PAGE },
                    auth: session.user.token,
                    responseType: 'json',
                });
                if (!messagesRes.success) throw new Error(messagesRes.error);
                return messagesRes.data.map(m => ({ type: 'message', message: m }));
            }

            const fetchAdminAlerts = async (): Promise<MessageQueryItem[]> => {
                if (!session.user) return [];
                if (pageParam !== 0) return [];
                
                const adminAlertsRes = await apiReq<ScratchAdminAlert[]>({
                    host: 'https://api.scratch.mit.edu',
                    path: `/users/${session.user.username}/messages/admin`,
                    auth: session.user.token,
                    responseType: 'json',
                });
                if (!adminAlertsRes.success) throw new Error(adminAlertsRes.error);
                return adminAlertsRes.data.map(m => ({ type: 'adminAlert', message: m }));
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