import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import { FlattenedComment } from "@/util/types";
import { commentsR2htmlToFlattened, findLastIndexInfinite, insertItemAtInfinite } from "@/util/functions";
import { useEffect } from "react";

type InfiniteUserCommentsProps = {
    user: string;
    enabled?: boolean;
}
export const useInfiniteUserComments = ({
    user,
    enabled = true,
}: InfiniteUserCommentsProps) => {

    const queryClient = useQueryClient();
    const queryKey = ['comments', 'user', user] as const;

    const { 
        data, 
        isFetchingNextPage, 
        isRefetching, 
        fetchNextPage, 
        hasNextPage, 
        isSuccess, 
        isLoading 
    } = useInfiniteQuery<
        FlattenedComment[], Error, 
        InfiniteData<FlattenedComment[]>, 
        typeof queryKey,
        number
    >({
        queryKey,
        queryFn: async ({ pageParam }) => {
            const path = '/site-api/comments/user/'
                + user + '/'

            const commentsRes = await apiReq({
                path: path,
                params: { 
                    page: pageParam,
                },
                useCrsf: true,
                responseType: 'html',
            });

            if (!commentsRes.success) throw new Error(commentsRes.error);
            if (commentsRes.status === 404) return [];

            return commentsR2htmlToFlattened(commentsRes.data);
        },
        getNextPageParam: (currentPage, allPages) => currentPage.length < 1 
            ? undefined 
            : allPages.indexOf(currentPage) + 2,
        getPreviousPageParam: (currentPage, allPages) => allPages.indexOf(currentPage),
        initialPageParam: 1,

        staleTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

        enabled,
    });

    const resetToFirstPage = () => {
        queryClient.setQueryData(queryKey, (data: InfiniteData<FlattenedComment[]>) => {
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

    const addCommentDirectly = (comment?: FlattenedComment): FlattenedComment[] => {
        let newComments: FlattenedComment[] = [];

        if (!comment) return newComments;
        if (comment.isReply) {
            queryClient.setQueryData(queryKey, (oldData: InfiniteData<FlattenedComment[]>) => {
                const { pageIndex, itemIndex } = findLastIndexInfinite(
                    oldData, 
                    c => c.parent === comment.parent || c.id === comment.parent,
                );

                const newData = insertItemAtInfinite(comment, oldData, pageIndex, itemIndex + 1);
                newComments = newData.pages.flat();
                return newData;
            });
        } else {
            queryClient.setQueryData(queryKey, (oldData: InfiniteData<FlattenedComment[]>) => {
                const newData = insertItemAtInfinite(comment, oldData, 0, 0);
                newComments = newData.pages.flat();
                return newData;
            });
        }

        return newComments;
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
        addCommentDirectly,
        isSuccess,
    };
};