import { useCallback, useEffect, useRef, useState } from "react";
import { produce } from "immer";

import { flattenComments } from "@/util/parsing/comments";
import type { 
    Comment, 
    FlattenedComment, 
    RootComment, 
} from "@/util/types/comments.types";

import { useSession } from "../useSession";
import { useComments } from "./useComments";
import { useApi } from "../useApi";

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

    const { q: { 
        getProjectRootComments,
        getProjectReplies,
        getProjectCommentHighlight,
    } } = useApi();


    const [ highlight, setHighlight ] = useState<RootComment|null>(null);
    const [ highlightLoaded, setHighlightLoaded ] = useState(!highlightedComment);

    // map between user id and username
    const userMap = useRef<Map<number, string>>(new Map());

    useEffect(() => {
        if (!session?.user) return;
        userMap.current.set(session.user.id, session.user.username);
    }, [session]);

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
        fetchRootComments: page => getProjectRootComments({
            id: project,
            author: author,
            page: page,
            session,
            userMap: userMap.current,
            updateUserMap: (id, username) => userMap.current.set(id, username),
        }),
        fetchRepliesFor: (parentId, from, limit) => getProjectReplies({
            id: project,
            author: author,
            parentId,
            from,
            limit,
            session,
            userMap: userMap.current,
            updateUserMap: (id, username) => userMap.current.set(id, username),
        }),
        enabled: isLoggedIn && !!author && enabled,
    });

    const fetchHighlight = useCallback(async (commentId: number) => {
        setHighlightLoaded(false);

        const newHighlight = await getProjectCommentHighlight({
            id: project,
            author: author,
            commentId,
            session,
            userMap: userMap.current,
            updateUserMap: (id, username) => userMap.current.set(id, username),
        });

        setHighlight(newHighlight);
        setHighlightLoaded(true);
    }, [author, project, session]);

    const clearHighlight = () => {
        setHighlight(null);
    };

    useEffect(() => {
        if (author && highlightedComment) {
            fetchHighlight(highlightedComment).catch(() => setHighlight(null));
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