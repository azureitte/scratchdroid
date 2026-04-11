import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    RootComment 
} from "@/util/types/comments.types";
import { useApi } from "../useApi";
import { useSession } from "../useSession";

type UseCommentsProps = {
    type: 'project'|'user';
    objectId?: number;
    objectName?: string;
    author?: string;
    highlightedComment?: number;
    enabled?: boolean;
}

export const useComments = ({
    type,
    objectId,
    objectName,
    author,
    highlightedComment,
    enabled = true,
}: UseCommentsProps) => {

    const queryClient = useQueryClient();
    const { session } = useSession();

    const { q: {
        getUserRootComments,
        getUserReplies,
        getUserCommentHighlight,
        getUserCommentFlags,

        getProjectRootComments,
        getProjectReplies,
        getProjectCommentHighlight,
        getProjectCommentFlags,
    } } = useApi();


    // highlight: 
    // - if null, no highlight section will be rednered
    // - if RootComment, this comment will be rendered instead of the real comment section
    const [ highlight, setHighlight ] = useState<RootComment|null>(null);
    const [ highlightLoaded, setHighlightLoaded ] = useState(!highlightedComment);

    // A map between user id and username
    const userMap = useRef<Map<number, string>>(new Map());
    const updateUserMap = (id: number, username: string) => userMap.current.set(id, username);

    const queryKey = ['comments', type, objectName ?? objectId] as const;

    // get behavior flags for this comment section type
    // flags include:
    // - highlightsComments: whether a highlight section should be rendered
    // - fetchesReplies: whether the underlying API fetches replies with separate queries
    // - usesUserMap: whether the underlying API needs to reply on the userMap
    // - isOptimistic: whether the underlying API skips re-fetching the root comments when a new one is added directly
    // - minItemsOnPage: the minimum number of comments before the page is marked as last
    const flags = type === 'project' 
        ? getProjectCommentFlags() 
        : getUserCommentFlags();



    // query functions

    const fetchRootComments = (page: number) => type === 'project' 
        ? getProjectRootComments({
            id: objectId!, 
            author: author!,
            page,
            session,
            userMap: userMap.current,
            updateUserMap,
        }) 
        : getUserRootComments({ 
            username: objectName!, 
            page,
            session,
            userMap: userMap.current,
            updateUserMap,
        });

    const fetchRepliesFor = (
        parentId: number,
        from: number,
        limit: number,
        ignorePrev?: boolean
    ) => {
        if (!flags.fetchesReplies) return [];

        if (type === 'project') 
            return getProjectReplies({
                id: objectId!,
                author: author!,
                parentId,
                from,
                limit,
                session,
                userMap: userMap.current,
                updateUserMap,
            });

        if (type === 'user')
            return getUserReplies({
                username: objectName!,
                parentId,
                from,
                limit,
                session: ignorePrev ? undefined : session,
            });

        return [];
    }

    const fetchHighlight = useCallback(async (commentId: number) => {
        if (!flags.highlightsComments) {
            clearHighlight();
            return;
        }
        
        setHighlightLoaded(false);

        const newHighlight = type === 'project' 
            ? await getProjectCommentHighlight({
                id: objectId!,
                author: author!,
                commentId,
                session,
                userMap: userMap.current,
                updateUserMap,
            })
            : await getUserCommentHighlight({
                username: objectName!,
                commentId,
                session,
                userMap: userMap.current,
                updateUserMap,
            });

        setHighlight(newHighlight);
        setHighlightLoaded(true);
    }, [type, objectId, objectName, author, session]);

    const clearHighlight = () => {
        setHighlight(null);
    };


    // add myself to the user map
    useEffect(() => {
        if (!session?.user) return;
        userMap.current.set(session.user.id, session.user.username);
    }, [session]);

    // fetch highlight, if a highlighted comment id is provided
    useEffect(() => {
        if (author && highlightedComment) {
            fetchHighlight(highlightedComment).catch(() => setHighlight(null));
        }
    }, [author, highlightedComment]);
    

    // the query
    const commentsQuery = useInfiniteQuery<
        RootComment[], Error, 
        InfiniteData<RootComment[]>, 
        typeof queryKey,
        number
    >({
        queryKey,
        queryFn: async ({ pageParam }) => {
            const comments = await fetchRootComments(pageParam);
            
            // auto-fetch first few replies
            for (const comment of comments) {
                if (comment.totalReplies > 0)
                    fetchRepliesForAndUpdate?.(comment.id, 0, DEFAULT_REPLY_COUNT, true);
            }

            return comments;
        },

        getNextPageParam: (currentPage, allPages) => currentPage.length < flags.minItemsOnPage 
            ? undefined 
            : allPages.indexOf(currentPage) + 1,
        getPreviousPageParam: (currentPage, allPages) => 
            allPages.indexOf(currentPage) - 1,
        initialPageParam: 0,

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
            if (!draft) return;

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
        clearHighlight();
        resetToNoPages();
        queryClient.resetQueries({ queryKey });
    };

    const clearAndFetchNextPage = () => {
        if (highlight !== null) clearHighlight();
        else return commentsQuery.fetchNextPage();
    };


    
    // functions for direct manipulation
    // that skip the querying process

    const addCommentDirectly = (comment?: Comment) => {
        if (!comment) return [];
        let newData: InfiniteData<RootComment[]> = {
            pages: [[]],
            pageParams: [0],
        };

        queryClient.setQueryData(queryKey, (oldData: InfiniteData<RootComment[]>) => {
            newData = produce(oldData, draft => {
                if (comment.isReply) {
                    const parentComment = draft.pages.flat().find(c => c.id === comment.parent);
                    if (!parentComment) return;
                    parentComment.replies.push(comment);
                } else {
                    if (flags.isOptimistic) draft.pages[0].unshift(comment);
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

    const addCommentDirectlyWithHighlight = (comment?: Comment) => {
        if (!comment) return [];

        // if a highlight section is currently showing
        if (highlight != null) {
            // if the new comment is a reply
            if (comment.isReply) {
                // append it to the highlight's root comment
                // and invalidate the real comments query
                let newData: RootComment|null = null;
                setHighlight(prev => {
                    newData = produce(prev, draft => {
                        draft?.replies.push(comment);
                    });
                    return newData;
                });
                refresh();

                return newData 
                    ? flattenComments([newData], { highlightedId: highlightedComment }) 
                    : [];
            } else {
                // if not a reply, clear the highlight and add to the real comment section
                setHighlight(null);
                return addCommentDirectly(comment);
            }
        } else {
            // if no highlight section is currently showing
            // add to the real comment section
            return addCommentDirectly(comment);
        }
    }

    const deleteCommentDirectlyHightlight = (comment?: Comment|FlattenedComment) => {
        if (!comment) return;
        deleteCommentDirectly(comment);
        setHighlight(null);
    }

    const replaceCommentDirectlyHightlight = (comment?: Comment) => {
        if (!comment) return;
        if (highlight !== null) {
            setHighlight(prev => produce(prev, draft => {
                if (!draft) return;
                if (comment.isReply) {
                    const targetCommentIdx = draft.replies.findIndex(c => c.id === comment.parent);
                    if (targetCommentIdx === -1) return;
                    draft.replies[targetCommentIdx] = comment;
                } else {
                    if (draft.id === comment.id) {
                        return comment;
                    }
                }
            }));
        } else {
            replaceCommentDirectly(comment);
        }
    }

    const data = useMemo((): RootComment[] => {
        if (highlight) return [highlight];
        return commentsQuery.data?.pages.flat() ?? [];
    }, [commentsQuery.data, highlight]);

    const flatData = useMemo(() => 
        flattenComments(data, { 
            highlightedId: highlight ? highlightedComment : undefined 
        }), [commentsQuery.data, highlight, highlightedComment]);
        

    return { 
        data: flatData,

        isLoading: 
            commentsQuery.isRefetching || 
            commentsQuery.isFetchingNextPage ||
            !highlightLoaded, 
        highlightLoaded,
        isFirstLoading: commentsQuery.isLoading,
        isSuccess: commentsQuery.isSuccess,
        isFetchingNextPage: commentsQuery.isFetchingNextPage,
        hasNextPage: commentsQuery.hasNextPage || !!highlight,
        fetchNextPage: clearAndFetchNextPage,

        fetchRepliesFor: fetchRepliesForAndUpdate,
        resetToFirstPage,
        refresh,
        
        addCommentDirectly: addCommentDirectlyWithHighlight,
        deleteCommentDirectly: deleteCommentDirectlyHightlight,
        replaceCommentDirectly: replaceCommentDirectlyHightlight,
    };

}