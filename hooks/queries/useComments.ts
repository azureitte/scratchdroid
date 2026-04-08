import { useMemo } from "react";
import { produce } from "immer";
import { 
    useInfiniteQuery, 
    useQueryClient, 
    type InfiniteData 
} from "@tanstack/react-query";

import { DEFAULT_REPLY_COUNT } from "@/util/constants";
import { addOrReplace } from "@/util/functions";
import { flattenComments } from "@/util/parsing/comments";
import type { 
    Comment, 
    FlattenedComment, 
    ReplyComment, 
    RootComment 
} from "@/util/types/app/comments.types";

type UseCommentsProps = {
    queryKey: readonly any[];
    highlightedId?: number;
    firstPage?: number;
    minItemsOnPage?: number;
    optimistic?: boolean;
    enabled?: boolean;

    fetchRootComments: (page: number) => Promise<RootComment[]>;
    fetchRepliesFor?: (
        parentId: number,
        from: number,
        limit: number,
        ignorePrev?: boolean
    ) => Promise<ReplyComment[]>;
}

export const useComments = ({
    queryKey,
    highlightedId,
    firstPage = 0,
    minItemsOnPage = 1,
    optimistic = true,
    enabled = true,
    fetchRootComments,
    fetchRepliesFor,
}: UseCommentsProps) => {

    const queryClient = useQueryClient();

    const commentsQuery = useInfiniteQuery<
        RootComment[], Error, 
        InfiniteData<RootComment[]>, 
        typeof queryKey,
        number
    >({
        queryKey,
        queryFn: async ({ pageParam }) => {
            const comments = await fetchRootComments(pageParam);
            
            for (const comment of comments) {
                if (comment.totalReplies > 0)
                    fetchRepliesForAndUpdate?.(comment.id, 0, DEFAULT_REPLY_COUNT, true);
            }

            return comments;
        },

        getNextPageParam: (currentPage, allPages) => currentPage.length < minItemsOnPage 
            ? undefined 
            : allPages.indexOf(currentPage) + 1 + firstPage,
        getPreviousPageParam: (currentPage, allPages) => 
            allPages.indexOf(currentPage) - 1 + firstPage,
        initialPageParam: firstPage,

        staleTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        enabled,
    });

    const fetchRepliesForAndUpdate = async (
        parentId: number, 
        from: number = 0, 
        limit: number = DEFAULT_REPLY_COUNT, 
        ignorePrev: boolean = false
    ) => {
        if (!fetchRepliesFor) return;
        if (from < 0 || limit <= 0) return;

        const oldReplies = queryClient.getQueryData<InfiniteData<RootComment[]>>(queryKey)
            ?.pages.flat()
            .find(c => c.id === parentId)
            ?.replies ?? [];

        // if already have those replies in the list, don't fetch them again
        if (from < oldReplies.length && (from + limit) <= oldReplies.length) return;

        const newReplies = await fetchRepliesFor(parentId, from, limit, ignorePrev);

        queryClient.setQueryData(queryKey, (oldData: InfiniteData<RootComment[]>) => produce(oldData, draft => {
            const parentComment = draft.pages.flat().find(c => c.id === parentId);
            if (!parentComment) return;
            if (ignorePrev) {
                parentComment.replies = [...newReplies];
                return;
            }

            let i = from;
            for (const reply of newReplies) {
                addOrReplace(parentComment.replies, reply, i);
                i++;
            }
        }));
    }

    const resetToFirstPage = () => {
        queryClient.setQueryData(queryKey, (data: InfiniteData<RootComment[]>) => {
            if (!data) return undefined;
            return {
                pages: [data.pages[0]], // Keep only the first page
                pageParams: [data.pageParams[0]], // Keep only the first page param
            };
        });
    };

    const resetToNoPages = () => {
        queryClient.setQueryData(queryKey, (data: InfiniteData<RootComment[]>) => {
            if (!data) return undefined;
            return {
                pages: [],
                pageParams: [],
            };
        });
    };

    const refresh = () => {
        resetToNoPages();
        queryClient.resetQueries({ queryKey });
    };

    const addCommentDirectly = (comment?: Comment) => {
        if (!comment) return [];
        let newData: InfiniteData<RootComment[]> = {
            pages: [[]],
            pageParams: [firstPage],
        };

        queryClient.setQueryData(queryKey, (oldData: InfiniteData<RootComment[]>) => {
            newData = produce(oldData, draft => {
                if (comment.isReply) {
                    const parentComment = draft.pages.flat().find(c => c.id === comment.parent);
                    if (!parentComment) return;
                    parentComment.replies.push(comment);
                } else {
                    if (optimistic) draft.pages[0].unshift(comment);
                    else refresh();
                }
            });
            return newData;
        });

        return flattenComments(newData.pages.flat(), { highlightedId: comment.id });
    }

    const deleteCommentDirectly = (comment?: Comment|FlattenedComment) => {
        if (!comment) return;
        queryClient.setQueryData(queryKey, (oldData: InfiniteData<RootComment[]>) => produce(oldData, draft => {
            if (comment.isReply) {
                const parentComment = draft.pages.flat().find(c => c.id === comment.parent);
                if (!parentComment) return;
                parentComment.replies = parentComment.replies.filter(r => r.id !== comment.id);
            } else {
                const targetPageIdx = draft.pages.findIndex(p => !!p.find(c => c.id === comment.id));
                if (targetPageIdx === -1) return;
                draft.pages[targetPageIdx] = draft.pages[targetPageIdx].filter(c => c.id !== comment.id);
            }
        }));
    };

    const replaceCommentDirectly = (comment?: Comment) => {
        if (!comment) return;
        queryClient.setQueryData(queryKey, (oldData: InfiniteData<RootComment[]>) => produce(oldData, draft => {
            if (comment.isReply) {
                const parentComment = draft.pages.flat().find(c => c.id === comment.parent);
                if (!parentComment) return;
                const targetReplyIdx = parentComment.replies.findIndex(r => r.id === comment.id);
                if (targetReplyIdx === -1) return;
                parentComment.replies[targetReplyIdx] = comment;
            } else {
                const targetPageIdx = draft.pages.findIndex(p => !!p.find(c => c.id === comment.id));
                if (targetPageIdx === -1) return;
                const targetCommentIdx = draft.pages[targetPageIdx].findIndex(c => c.id === comment.id);
                const prevComment = draft.pages[targetPageIdx][targetCommentIdx];

                draft.pages[targetPageIdx][targetCommentIdx] = { 
                    ...comment, 
                    replies: prevComment.replies,
                    totalReplies: prevComment.totalReplies,
                };
            }
        }));
    };

    const data = useMemo(() => commentsQuery.data?.pages.flat() ?? [], [commentsQuery.data]);
    const flatData = useMemo(() => flattenComments(data, { highlightedId }), [commentsQuery.data, highlightedId]);

    return { 
        data,
        flatData,

        isLoading: commentsQuery.isRefetching || commentsQuery.isFetchingNextPage, 
        isFirstLoading: commentsQuery.isLoading,
        isSuccess: commentsQuery.isSuccess,
        isFetchingNextPage: commentsQuery.isFetchingNextPage,
        hasNextPage: commentsQuery.hasNextPage,
        fetchNextPage: commentsQuery.fetchNextPage,

        fetchRepliesFor: fetchRepliesForAndUpdate,
        resetToFirstPage,
        refresh,
        
        addCommentDirectly,
        deleteCommentDirectly,
        replaceCommentDirectly,
    };

}