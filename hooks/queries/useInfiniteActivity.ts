import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { ActivityUnit } from "@/util/types/activity.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

const ITEMS_PER_PAGE = 20;

type InfiniteActivityOptions = {
    type?: 'following'|'user';
    username?: string;
}

export const useInfiniteActivity = ({
    type = 'following',
    username,
}: InfiniteActivityOptions) => {
    const queryClient = useQueryClient();
    const { session } = useSession();
    const { q: { 
        getFollowingActivity,
        getUserActivity,
    } } = useApi();

    const queryKey = ['activity', type, username] as const;

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
        typeof queryKey, 
        number
    >({
        queryKey,
        queryFn: async ({ pageParam }) => {
            if (type === 'user')
                return getUserActivity({
                    username: username!,
                    from: pageParam * ITEMS_PER_PAGE,
                    limit: ITEMS_PER_PAGE,
                });

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
        queryClient.setQueryData(queryKey, (data: InfiniteData<ActivityUnit[]>) => {
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
            queryKey,
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