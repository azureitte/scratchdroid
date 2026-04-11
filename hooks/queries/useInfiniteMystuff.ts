import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

const PROJECTS_PER_PAGE = 40;
const STUDIOS_PER_PAGE = 40;

type InfiniteMystuffProps = {
    enabled?: boolean;
}&({
    type: 'projects';
    subtype: 'all'|'public'|'private'|'trash';
    ascsort?: 'title';
    descsort?: 'title'|'views'|'remixes'|'loves';
}|{
    type: 'studios';
    subtype: 'all'|'owned'|'curated';
    ascsort?: 'title';
    descsort?: 'title'|'projects';
})

export const useInfiniteMystuff = ({
    type,
    subtype,
    ascsort,
    descsort,
    enabled = true,
}: InfiniteMystuffProps) => {
    const queryClient = useQueryClient();
    const { isLoading: isSessionLoading, session, isLoggedIn } = useSession();
    const { q: { getMystuff } } = useApi();

    const ITEMS_PER_PAGE = type === 'projects' ? PROJECTS_PER_PAGE : STUDIOS_PER_PAGE;

    const queryKey = ['mystuff', type, subtype, ascsort, descsort] as const;

    const { 
        data, 
        isFetchingNextPage, 
        isRefetching, 
        fetchNextPage, 
        hasNextPage, 
        isSuccess, 
        isLoading 
    } = useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam }) => {
            if (isSessionLoading || !session.user) return [];

            return getMystuff({
                type,
                subtype,
                ascsort,
                descsort,
                page: pageParam,
            } as any);
        },
        getNextPageParam: (currentPage, allPages) => currentPage.length < ITEMS_PER_PAGE 
            ? undefined 
            : allPages.indexOf(currentPage) + 1,
        getPreviousPageParam: (currentPage, allPages) => allPages.indexOf(currentPage) - 1,
        initialPageParam: 0,

        staleTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

        enabled: enabled && !isSessionLoading && isLoggedIn,
    });

    const resetToFirstPage = () => {
        queryClient.setQueryData(queryKey, (data: InfiniteData<any[]>) => {
            if (!data) return undefined;
            return {
                pages: [data.pages[0]], // Keep only the first page
                pageParams: [data.pageParams[0]], // Keep only the first page param
            };
        });
    };

    const refresh = () => {
        resetToFirstPage();
        queryClient.invalidateQueries({ queryKey });
    };

    return { 
        data: data 
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