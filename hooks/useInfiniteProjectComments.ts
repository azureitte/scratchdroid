import { useCallback, useEffect, useRef, useState } from "react";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import { FlattenedComment, ScratchComment } from "@/util/types";
import { addOrReplace, decodeWww3Comment } from "@/util/functions";
import { DEFAULT_REPLY_COUNT, REPLY_INCREMENT_COUNT } from "@/util/constants";

import { useSession } from "./useSession";

const COMMENTS_PER_PAGE = 20;

type InfiniteProjectCommentsProps = {
    project: number;
    author: string;
    highlightedComment?: number;
    enabled?: boolean;
}
export const useInfiniteProjectComments = ({
    project,
    author,
    highlightedComment,
    enabled = true,
}: InfiniteProjectCommentsProps) => {
    const queryClient = useQueryClient();
    const { isLoading: isSessionLoading, session, isLoggedIn } = useSession();

    const queryKey = ['comments', 'project', project] as const;

    const [ replies, setReplies ] = useState<Record<string, FlattenedComment[]>>({});
    const [ highlight, setHighlight ] = useState<FlattenedComment[]|null>(null);
    const [ highlightLoaded, setHighlightLoaded ] = useState(!highlightedComment);

    // map between user id and username
    const userMap = useRef<Map<number, string>>(new Map());

    const toFlattenedComment = (comment: ScratchComment, opts?: {
        isReply: boolean;
        parentId: number;
        replyIdx: number;
        replyTo: number;
        isHighlighted?: boolean;
    }): FlattenedComment => {
        if (opts?.isReply) { return {
            id: comment.id,
            content: decodeWww3Comment(comment.content),
            author: {
                id: comment.author.id,
                username: comment.author.username,
                scratchteam: comment.author.scratchteam,
                image: comment.author.image,
            },
            createdAt: new Date(comment.datetime_created),
            modifiedAt: new Date(comment.datetime_modified),
            isLastInBlock: true, // true by default
            isHighlighted: opts.isHighlighted ?? false,
            isReply: true,
            replyIdx: opts.replyIdx,
            parent: opts.parentId,
            replyTo: userMap.current.get(opts.replyTo) ?? opts.replyTo?.toString() ?? '',
        } }
        return {
            id: comment.id,
            content: decodeWww3Comment(comment.content),
            author: {
                id: comment.author.id,
                username: comment.author.username,
                scratchteam: comment.author.scratchteam,
                image: comment.author.image,
            },
            createdAt: new Date(comment.datetime_created),
            modifiedAt: new Date(comment.datetime_modified),
            isLastInBlock: comment.reply_count === 0,
            isHighlighted: opts?.isHighlighted ?? false,
            isReply: false,
            parent: null,
            replyTo: null,
        }
    }


    const fetchComments = useCallback(async (
        from: number = 0, 
        limit: number = COMMENTS_PER_PAGE
    ): Promise<[
        FlattenedComment[], 
        number[],
    ]> => {
        const comments: FlattenedComment[] = [];
        const replyComments: number[] = [];

        // first, fetch all the parent comments for the page
        const commentsRes = await apiReq<ScratchComment[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${project}/comments`,
            params: { 
                limit,
                offset: from,
            },
            auth: session?.user?.token,
            responseType: 'json',
        });

        if (!commentsRes.success) throw new Error(commentsRes.error);
        if (commentsRes.status === 404) return [[], []];

        // add them to the list as FlattenedComments
        for (const commentObj of commentsRes.data) {
            const comment = toFlattenedComment(commentObj);
            comments.push(comment);
            if (commentObj.reply_count > 0) replyComments.push(commentObj.id);
            userMap.current.set(commentObj.author.id, commentObj.author.username);
        }

        return [comments, replyComments];
    }, [replies, author, project, session]);

    const fetchRepliesFor = useCallback(async (
        parentId: number, 
        from: number = 0, 
        limit: number = REPLY_INCREMENT_COUNT, 
        ignorePrev: boolean = false
    ) => {
        const newReplies = (!ignorePrev && replies[parentId]) ? [...replies[parentId]] : [];
        // if already have those replies in the list, don't fetch them again
        if (from < newReplies.length && (from + limit) <= newReplies.length) return;
        if (from < 0 || limit <= 0) return;

        // fetch replies
        const repliesRes = await apiReq<ScratchComment[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${project}/comments/${parentId}/replies`,
            params: { 
                limit,
                offset: from,
            },
            auth: session?.user?.token,
            responseType: 'json',
        });

        if (!repliesRes.success) return;

        // merge them with the existing replies for the target parent commnet
        let i = from;
        for (const replyObj of repliesRes.data) {
            const prevReply = newReplies[i-1];
            if (prevReply) {
                prevReply.isLastInBlock = false;
            }

            const reply: FlattenedComment = toFlattenedComment(replyObj, {
                isReply: true,
                parentId: parentId,
                replyIdx: i,
                replyTo: replyObj.commentee_id!,
            });

            addOrReplace(newReplies, reply, i);
            i++;

            // update user map
            userMap.current.set(replyObj.author.id, replyObj.author.username);
        }

        setReplies(prev => ({
            ...prev,
            [parentId]: newReplies,
        }));
    }, [replies, author, project, session]);

    const fetchHighlight = useCallback(async (commentId: number) => {
        setHighlightLoaded(false);

        const targetCommentRes = await apiReq<ScratchComment>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${project}/comments/${commentId}`,
            auth: session?.user?.token,
            responseType: 'json',
        });
        if (!targetCommentRes.success) throw new Error(targetCommentRes.error);
        if (targetCommentRes.status === 404) return;
    
        const targetComment = targetCommentRes.data;
        if (targetComment.parent_id === null) {
            setHighlight([toFlattenedComment(targetComment, {
                isReply: false,
                parentId: 0,
                replyIdx: 0,
                replyTo: 0,
                isHighlighted: true,
            })]);
            setHighlightLoaded(true);
            return;
        }

        const parentCommentRes = await apiReq<ScratchComment>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${project}/comments/${targetComment.parent_id}`,
            auth: session?.user?.token,
            responseType: 'json',
        });
        if (!parentCommentRes.success) throw new Error(parentCommentRes.error);
        if (parentCommentRes.status === 404) {
            setHighlight([toFlattenedComment(targetComment)]);
            setHighlightLoaded(true);
            return;
        };

        const parentComment = parentCommentRes.data;
        const parentCommentFlat = toFlattenedComment(parentComment);
        const replyCommentFlat = toFlattenedComment(targetComment, {
            isReply: true,
            parentId: targetComment.parent_id,
            replyIdx: 0,
            replyTo: targetComment.commentee_id!,
            isHighlighted: true,
        });

        setHighlight([parentCommentFlat, replyCommentFlat]);
        setHighlightLoaded(true);
    }, [author, project, session]);

    const clearHighlight = () => {
        setHighlight(null);
    };

    useEffect(() => {
        if (author && highlightedComment) {
            fetchHighlight(highlightedComment);
        }
    }, [author, highlightedComment]);


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

            const [ comments, replyComments ] = await fetchComments(pageParam * COMMENTS_PER_PAGE);

            // if some of the comments have replies, fetch the replies separately
            if (replyComments.length > 0) {
                for (const commentId of replyComments) {
                    fetchRepliesFor(commentId, 0, DEFAULT_REPLY_COUNT, true);
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
        clearHighlight();
        setReplies({});
        queryClient.invalidateQueries({ queryKey });
    };

    const clearAndFetchNextPage = () => {
        if (highlight !== null) clearHighlight();
        else return fetchNextPage();
    };


    // construct merged data based on the top-level comments and the fetched reply map

    let mergedData = data 
        ? data.pages.flat() 
        : [];

    for (const parentIdStr in replies) {
        const parentId = Number(parentIdStr);
        if (!mergedData.some(c => c.id === parentId)) continue;

        const repliesForParent = replies[parentId];
        if (repliesForParent && repliesForParent.length > 0) {
            // insert them after either the last reply to the parent, or the parent itself
            for (const reply of repliesForParent) {
                // the insert target is the (if present) last reply to the parent or the parent itself
                const insertAfter = mergedData.findLastIndex(c => c.parent === parentId || c.id === parentId);
                if (insertAfter >= 0) {
                    mergedData.splice(insertAfter + 1, 0, reply);
                }
            }
        }
    }

    if (highlight) {
        mergedData = highlight;
    }

    return { 
        data: mergedData, 
        isLoading: isRefetching || isFetchingNextPage || !highlightLoaded,
        highlightLoaded,
        isFirstLoading: isLoading || !highlightLoaded,
        isFetchingNextPage,
        fetchNextPage: clearAndFetchNextPage,
        hasNextPage: hasNextPage || !!highlight,
        resetToFirstPage,
        refresh,
        fetchRepliesFor,
        isSuccess,
    };
};