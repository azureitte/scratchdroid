import { useCallback, useEffect, useRef, useState } from "react";

import { apiReq } from "@/util/api";
import { flattenComments, getCommentFromWww3 } from "@/util/parsing/comments";
import { REPLY_INCREMENT_COUNT } from "@/util/constants";
import type { 
    Comment, 
    FlattenedComment, 
    ReplyComment, 
    RootComment, 
} from "@/util/types/app/comments.types";
import { ScratchComment } from "@/util/types/api/comment.types";

import { useSession } from "../useSession";
import { useComments } from "./useComments";
import { produce } from "immer";

const COMMENTS_PER_PAGE = 20;

type InfiniteProjectCommentsProps = {
    project: number;
    author: string;
    highlightedComment?: number;
    enabled?: boolean;
}
export const useProjectComments = ({
    project,
    author,
    highlightedComment,
    enabled = true,
}: InfiniteProjectCommentsProps) => {

    const { session, isLoggedIn } = useSession();

    const queryKey = ['comments', 'project', project] as const;


    const [ highlight, setHighlight ] = useState<RootComment|null>(null);
    const [ highlightLoaded, setHighlightLoaded ] = useState(!highlightedComment);

    // map between user id and username
    const userMap = useRef<Map<number, string>>(new Map());

    useEffect(() => {
        if (!session?.user) return;
        userMap.current.set(session.user.id, session.user.username);
    }, [session]);


    const fetchRootComments = useCallback(async (
        from: number = 0, 
        limit: number = COMMENTS_PER_PAGE
    ): Promise<RootComment[]> => {
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
        if (commentsRes.status === 404) return [];

        return commentsRes.data.map(comment => {
            userMap.current.set(comment.author.id, comment.author.username);
            return getCommentFromWww3(comment, {
                replies: [],
                userMap: userMap.current,
            }) as RootComment;
        });
    }, [author, project, session]);

    const fetchReplies = useCallback(async (
        parentId: number, 
        from: number = 0, 
        limit: number = REPLY_INCREMENT_COUNT,
    ): Promise<ReplyComment[]> => {
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

        if (!repliesRes.success) throw new Error(repliesRes.error);
        if (repliesRes.status === 404) return [];
        
        return repliesRes.data.map(comment => {
            userMap.current.set(comment.author.id, comment.author.username);
            return getCommentFromWww3(comment, {
                userMap: userMap.current,
            }) as ReplyComment;
        });
    }, [author, project, session]);

    const {
        flatData,
        isLoading,
        isFirstLoading,
        isSuccess,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        resetToFirstPage,
        refresh,
        fetchRepliesFor,
        addCommentDirectly,
        deleteCommentDirectly,
        replaceCommentDirectly,
    } = useComments({
        queryKey,
        firstPage: 0,
        minItemsOnPage: COMMENTS_PER_PAGE,
        optimistic: false,
        fetchRootComments: page => fetchRootComments(page * COMMENTS_PER_PAGE),
        fetchRepliesFor: fetchReplies,
        enabled: isLoggedIn && !!author && enabled,
    });

    const fetchHighlight = useCallback(async (commentId: number) => {
        setHighlightLoaded(false);

        // fetch the highlighted comment individually
        const targetCommentRes = await apiReq<ScratchComment>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${project}/comments/${commentId}`,
            auth: session?.user?.token,
            responseType: 'json',
        });
        if (!targetCommentRes.success) throw new Error(targetCommentRes.error);
        if (targetCommentRes.status === 404) return;
    
        // if it's a root comment, set the highlight to be just this comment
        const targetComment = targetCommentRes.data;
        if (targetComment.parent_id === null) {
            setHighlight(getCommentFromWww3(targetComment) as RootComment);
            setHighlightLoaded(true);
            return;
        }

        // otherwise, also fetch the parent comment
        const parentCommentRes = await apiReq<ScratchComment>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${project}/comments/${targetComment.parent_id}`,
            auth: session?.user?.token,
            responseType: 'json',
        });
        if (!parentCommentRes.success) throw new Error(parentCommentRes.error);
        if (parentCommentRes.status === 404) {
            // this should never happen, but just in case
            setHighlight(getCommentFromWww3(targetComment) as RootComment);
            setHighlightLoaded(true);
            return;
        };

        const parentComment = parentCommentRes.data;
        userMap.current.set(parentComment.author.id, parentComment.author.username);

        // set the highlight's root comment to be the parent,
        // followed by the highlighted reply
        setHighlight(
            getCommentFromWww3(parentComment, { replies: [
                getCommentFromWww3(targetComment, { 
                    userMap: userMap.current 
                }) as ReplyComment,
            ] }) as RootComment
        );
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

    const clearAndRefresh = () => {
        clearHighlight();
        refresh();
    };

    const clearAndFetchNextPage = () => {
        if (highlight !== null) clearHighlight();
        else return fetchNextPage();
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

    return { 
        data: highlight 
            ? flattenComments([highlight], { highlightedId: highlightedComment })
            : flatData, 
        isLoading: isLoading || !highlightLoaded,
        highlightLoaded,
        isFirstLoading,
        isFetchingNextPage,
        fetchNextPage: clearAndFetchNextPage,
        hasNextPage: hasNextPage || !!highlight,
        resetToFirstPage,
        refresh: clearAndRefresh,
        fetchRepliesFor,
        addCommentDirectly: addCommentDirectlyWithHighlight,
        deleteCommentDirectly: deleteCommentDirectlyHightlight,
        replaceCommentDirectly: replaceCommentDirectlyHightlight,
        isSuccess,
    };
};