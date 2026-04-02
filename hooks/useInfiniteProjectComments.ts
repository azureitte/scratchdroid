import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import { FlattenedComment, ScratchComment } from "@/util/types";
import { useSession } from "./useSession";
import { decodeWww3Comment } from "@/util/functions";

const COMMENTS_PER_PAGE = 20;

type InfiniteProjectCommentsProps = {
    project: number;
    author: string;
    enabled?: boolean;
}
export const useInfiniteProjectComments = ({
    project,
    author,
    enabled = true,
}: InfiniteProjectCommentsProps) => {
    const queryClient = useQueryClient();
    const { isLoading: isSessionLoading, session, isLoggedIn } = useSession();

    const queryKey = ['comments', 'project', project] as const;

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
            if (isSessionLoading || !session.user) return [];

            const comments: FlattenedComment[] = [];
            const replyComments: number[] = [];

            // map between user id and username
            const userMap: Map<number, string> = new Map();

            // first, fetch all the parent comments for the page
            const commentsRes = await apiReq<ScratchComment[]>({
                host: 'https://api.scratch.mit.edu',
                path: `/users/${author}/projects/${project}/comments`,
                params: { 
                    limit: COMMENTS_PER_PAGE,
                    offset: pageParam * COMMENTS_PER_PAGE,
                },
                auth: session.user.token,
                responseType: 'json',
            });

            if (!commentsRes.success) throw new Error(commentsRes.error);
            if (commentsRes.status === 404) return [];

            // add them to the list as FlattenedComments
            for (const commentObj of commentsRes.data) {
                comments.push({
                    id: commentObj.id,
                    content: decodeWww3Comment(commentObj.content),
                    author: {
                        id: commentObj.author.id,
                        username: commentObj.author.username,
                        scratchteam: commentObj.author.scratchteam,
                        image: commentObj.author.image,
                    },
                    createdAt: new Date(commentObj.datetime_created),
                    modifiedAt: new Date(commentObj.datetime_modified),
                    isLastInBlock: true, // true by default
                    isReply: false,
                    parent: null,
                    replyTo: null,
                });
                if (commentObj.reply_count > 0) replyComments.push(commentObj.id);
                userMap.set(commentObj.author.id, commentObj.author.username);
            }

            if (replyComments.length === 0) return comments;

            // if some of the comments have replies, fetch the replies separately
            for (const commentId of replyComments) {
                const repliesRes = await apiReq<ScratchComment[]>({
                    host: 'https://api.scratch.mit.edu',
                    path: `/users/${author}/projects/${project}/comments/${commentId}/replies`,
                    params: { 
                        limit: 25,
                        offset: 0,
                    },
                    auth: session.user.token,
                    responseType: 'json',
                });

                if (!repliesRes.success) continue;
                if (repliesRes.status === 404) continue;

                // add them as FlattenedComments
                // inserted after either the last reply to the parent, or the parent itself
                let replyIdx = 0;
                for (const replyObj of repliesRes.data) {
                    const reply: FlattenedComment = {
                        id: replyObj.id,
                        content: decodeWww3Comment(replyObj.content),
                        author: {
                            id: replyObj.author.id,
                            username: replyObj.author.username,
                            scratchteam: replyObj.author.scratchteam,
                            image: replyObj.author.image,
                        },
                        createdAt: new Date(replyObj.datetime_created),
                        modifiedAt: new Date(replyObj.datetime_modified),
                        isLastInBlock: true, // true by default
                        isReply: true,
                        replyIdx,
                        parent: commentId,
                        replyTo: userMap.get(replyObj.commentee_id!) ?? replyObj.commentee_id?.toString() ?? '',
                    };

                    // the insert target is the (if present) last reply to the parent or the parent itself
                    const insertAfter = comments.findLast(c => c.parent === commentId || c.id === commentId);
                    if (insertAfter) {
                        insertAfter.isLastInBlock = false; // mark the insert target as not last in block
                        comments.splice(comments.indexOf(insertAfter) + 1, 0, reply);
                    }
                    replyIdx++;

                    userMap.set(replyObj.author.id, replyObj.author.username);
                }
            }

            return comments;
        },
        getNextPageParam: (currentPage, allPages) => currentPage.length < COMMENTS_PER_PAGE 
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