import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "../util/api";
import { useSession } from "./useSession";
import { ScratchMessage } from "../util/types";

const MESSAGES_PER_PAGE = 40;

export const useInfiniteMessages = () => {
    const { isLoading: isSessionLoading, session } = useSession();
    const queryClient = useQueryClient();

    const { data, isFetchingNextPage, isRefetching, fetchNextPage, isSuccess, hasNextPage } = useInfiniteQuery<
        ScratchMessage[], Error, 
        InfiniteData<ScratchMessage[]>, 
        ['messages', boolean], 
        number
    >({
        queryKey: ['messages', isSessionLoading],
        queryFn: async ({ pageParam }) => {
            if (isSessionLoading || !session.user) return [];

            queryClient.invalidateQueries({ 
                queryKey: ['unread', false] 
            });

            const messagesRes = await apiReq<ScratchMessage[]>({
                host: 'https://api.scratch.mit.edu',
                path: `/users/${session.user.username}/messages`,
                params: { limit: MESSAGES_PER_PAGE, offset: pageParam * MESSAGES_PER_PAGE },
                auth: session.user.token,
                responseType: 'json',
            });
            if (!messagesRes.success) throw new Error(messagesRes.error);

            return messagesRes.data;
        },
        getNextPageParam: (currentPage, allPages) => currentPage.length < MESSAGES_PER_PAGE 
            ? undefined 
            : allPages.indexOf(currentPage) + 1,
        getPreviousPageParam: (currentPage, allPages) => allPages.indexOf(currentPage) - 1,
        initialPageParam: 0,

        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const resetToFirstPage = () => {
        queryClient.setQueryData(['messages', isSessionLoading], (data: InfiniteData<ScratchMessage[]>) => {
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
            queryKey: ['messages', false],
        });
    }

    return { 
        messages: data 
            ? data.pages.flat() 
            : [], 
        isLoading: isRefetching || isFetchingNextPage, 
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        resetToFirstPage,
        refresh,
        isSuccess,
    };
};