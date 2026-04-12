import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { ActivityUnit } from "@/util/types/activity.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

const ITEMS_PER_PAGE = 20;

export const useInfiniteActivity = () => {
    const queryClient = useQueryClient();
    const { session } = useSession();
    const { q: { getFollowingActivity } } = useApi();

    const { 
        data, 
        isFetchingNextPage, 
        isRefetching, 
        fetchNextPage, 
        hasNextPage, 
        isSuccess, 
        isLoading 
    } = useInfiniteQuery<
        ActivityUnit[], Error, 
        InfiniteData<ActivityUnit[]>, 
        ['activity'], 
        number
    >({
        queryKey: ['activity'],
        queryFn: async ({ pageParam }) => {
            if (!session?.user) return [];

            return getFollowingActivity(session, pageParam * ITEMS_PER_PAGE, ITEMS_PER_PAGE);
        },
        getNextPageParam: (currentPage, allPages) => currentPage.length < ITEMS_PER_PAGE 
            ? undefined 
            : allPages.indexOf(currentPage) + 1,
        getPreviousPageParam: (currentPage, allPages) => allPages.indexOf(currentPage) - 1,
        initialPageParam: 0,

        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        enabled: !!session?.user,
    });

    const resetToFirstPage = () => {
        queryClient.setQueryData(['activity'], (data: InfiniteData<ActivityUnit[]>) => {
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
            queryKey: ['activity'],
        });
    }

    return { 
        activity: data 
            ? data.pages.flat() 
            : [], 
        isLoading: isRefetching || isFetchingNextPage, 
        isFirstLoading: isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        resetToFirstPage,
        refresh,
        isSuccess,
    };
};