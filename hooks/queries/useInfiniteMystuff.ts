import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "../../util/api";
import { useSession } from "../useSession";
import { ScratchMystuffItem } from "../../util/types";

const PROJECTS_PER_PAGE = 40;
const STUDIOS_PER_PAGE = 40;

type InfiniteMystuffProps = {
    enabled?: boolean;
}&({
    type: 'projects';
    subtype: 'all'|'shared'|'notshared'|'trashed';
    ascsort?: 'title';
    descsort?: 'title'|'view_count'|'remixers_count'|'love_count';
}|{
    type: 'studios';
    subtype: 'all'|'owned'|'curated';
    ascsort?: 'title';
    descsort?: 'title'|'projecters_count';
})

export const useInfiniteMystuff = ({
    type,
    subtype,
    ascsort,
    descsort,
    enabled = true,
}: InfiniteMystuffProps) => {
    const { isLoading: isSessionLoading, session, isLoggedIn } = useSession();
    const queryClient = useQueryClient();

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
    } = useInfiniteQuery<
        ScratchMystuffItem[], Error, 
        InfiniteData<ScratchMystuffItem[]>, 
        typeof queryKey,
        number
    >({
        queryKey,
        queryFn: async ({ pageParam }) => {
            if (isSessionLoading || !session.user) return [];

            const path = '/site-api/'
                + (type === 'projects' ? 'projects' : 'galleries') + '/'
                + subtype + '/';

            const mystuffRes = await apiReq<ScratchMystuffItem[]>({
                path: path,
                params: { 
                    page: pageParam,
                    ascsort: ascsort ?? '',
                    descsort: descsort ?? '',
                },
                useCrsf: true,
                responseType: 'json',
            });

            if (!mystuffRes.success) throw new Error(mystuffRes.error);
            if (mystuffRes.status === 404) return [];

            return mystuffRes.data;
        },
        getNextPageParam: (currentPage, allPages) => currentPage.length < ITEMS_PER_PAGE 
            ? undefined 
            : allPages.indexOf(currentPage) + 2,
        getPreviousPageParam: (currentPage, allPages) => allPages.indexOf(currentPage),
        initialPageParam: 1,

        staleTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

        enabled: enabled && !isSessionLoading && isLoggedIn,
    });

    const resetToFirstPage = () => {
        queryClient.setQueryData(queryKey, (data: InfiniteData<ScratchMystuffItem[]>) => {
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