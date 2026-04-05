import { useCallback, useEffect, useRef, useState } from "react";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import { FlattenedComment, ScratchComment } from "@/util/types";
import { addOrReplace, decodeWww3Comment, www3ToFlattenedComment } from "@/util/functions";
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
            const comment = www3ToFlattenedComment(commentObj);
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

            const reply: FlattenedComment = www3ToFlattenedComment(replyObj, {
                isReply: true,
                parentId: parentId,
                replyIdx: i,
                replyTo: replyObj.commentee_id!,
                userMap: userMap.current,
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
            setHighlight([www3ToFlattenedComment(targetComment, {
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
            setHighlight([www3ToFlattenedComment(targetComment)]);
            setHighlightLoaded(true);
            return;
        };

        const parentComment = parentCommentRes.data;
        const parentCommentFlat = www3ToFlattenedComment(parentComment);
        userMap.current.set(parentComment.author.id, parentComment.author.username);

        const replyCommentFlat = www3ToFlattenedComment(targetComment, {
            isReply: true,
            parentId: targetComment.parent_id,
            replyIdx: 0,
            replyTo: targetComment.commentee_id!,
            isHighlighted: true,
            userMap: userMap.current,
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

    const addCommentDirectly = (comment?: FlattenedComment) => {
        if (!comment) return;
        if (comment.isReply) {
            comment.replyTo = userMap.current.get(Number(comment.replyTo)) ?? comment.replyTo;
            setReplies(prev => {
                const prevReplies = prev[comment.parent] ? [...prev[comment.parent]] : [];
                const prevLastReply = prevReplies[prevReplies.length - 1];
                if (prevLastReply) {
                    prevLastReply.isLastInBlock = false;
                }
                const replyIdx = prevLastReply?.isReply ? prevLastReply.replyIdx + 1 : 0;

                const newReplies = [...prevReplies, { ...comment, replyIdx }];

                return {
                    ...prev,
                    [comment.parent]: newReplies,
                }
            });
        } else {
            refresh();
        }
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
            const targetParent = mergedData.find(c => c.id === parentId)
            if (targetParent) targetParent.isLastInBlock = false;

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
        addCommentDirectly,
        isSuccess,
    };
};