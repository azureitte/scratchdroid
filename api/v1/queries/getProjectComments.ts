import { ReplyComment, RootComment } from "@/util/types/comments.types";
import { apiReq } from "../request";
import { getCommentFromWww3 } from "../parsers/comments";
import { ScratchComment } from "../types/comment.types";
import { Session } from "@/util/types/accounts.types";
import { REPLY_INCREMENT_COUNT } from "@/util/constants";
import { API_MODERN_ENDPOINT } from "../constants";

type GetProjectRootCommentsOptions = {
    id: number;
    author: string;
    page?: number;
    
    session?: Session;
    userMap?: Map<number, string>;
    updateUserMap?: (id: number, username: string) => void;
}

type GetProjectRepliesOptions = {
    id: number;
    author: string;
    parentId: number;
    from?: number;
    limit?: number;

    session?: Session;
    userMap?: Map<number, string>;
    updateUserMap?: (id: number, username: string) => void;
}

type GetProjectCommentHighlightOptions = {
    id: number;
    author: string;
    commentId: number;
    session?: Session;
    userMap?: Map<number, string>;
    updateUserMap?: (id: number, username: string) => void;
}

const COMMENTS_PER_PAGE = 20;

export const getProjectRootComments = async ({
    id,
    author,
    page = 0,
    session,
    userMap,
    updateUserMap,
}: GetProjectRootCommentsOptions): Promise<RootComment[]> => {
    const commentsRes = await apiReq<ScratchComment[]>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${author}/projects/${id}/comments`,
        params: { 
            limit: COMMENTS_PER_PAGE,
            offset: page * COMMENTS_PER_PAGE,
        },
        auth: session?.user?.token,
        responseType: 'json',
    });

    if (!commentsRes.success) throw new Error(commentsRes.error);
    if (commentsRes.status === 404) return [];

    return commentsRes.data.map(comment => {
        updateUserMap?.(comment.author.id, comment.author.username);
        return getCommentFromWww3(comment, {
            replies: [],
            userMap,
        }) as RootComment;
    });
}

export const getProjectReplies = async ({
    id,
    author,
    parentId,
    from = 0,
    limit = REPLY_INCREMENT_COUNT,
    session,
    userMap,
    updateUserMap,
}: GetProjectRepliesOptions): Promise<ReplyComment[]> => {

    const repliesRes = await apiReq<ScratchComment[]>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${author}/projects/${id}/comments/${parentId}/replies`,
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
        updateUserMap?.(comment.author.id, comment.author.username);
        return getCommentFromWww3(comment, {
            userMap: userMap,
        }) as ReplyComment;
    });

}

export const getProjectCommentHighlight = async ({
    id,
    author,
    commentId,
    session,
    userMap,
    updateUserMap,
}: GetProjectCommentHighlightOptions): Promise<RootComment|null> => {
    // fetch the highlighted comment individually
    const targetCommentRes = await apiReq<ScratchComment>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${author}/projects/${id}/comments/${commentId}`,
        auth: session?.user?.token,
        responseType: 'json',
    });
    if (!targetCommentRes.success) throw new Error(targetCommentRes.error);
    if (targetCommentRes.status === 404 || !targetCommentRes.data) {
        return null;
    }

    // if it's a root comment, set the highlight to be just this comment
    const targetComment = targetCommentRes.data;
    if (targetComment.parent_id === null) {
        return getCommentFromWww3(targetComment) as RootComment;
    }

    // otherwise, also fetch the parent comment
    const parentCommentRes = await apiReq<ScratchComment>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${author}/projects/${id}/comments/${targetComment.parent_id}`,
        auth: session?.user?.token,
        responseType: 'json',
    });
    if (!parentCommentRes.success) throw new Error(parentCommentRes.error);
    if (parentCommentRes.status === 404) {
        // this should never happen, but just in case
        return getCommentFromWww3(targetComment) as RootComment;
    };

    const parentComment = parentCommentRes.data;
    updateUserMap?.(parentComment.author.id, parentComment.author.username);

    // set the highlight's root comment to be the parent,
    // followed by the highlighted reply
    return getCommentFromWww3(parentComment, { replies: [
        getCommentFromWww3(targetComment, { userMap }) as ReplyComment,
    ] }) as RootComment;
}

export const getProjectCommentFlags = () => ({
    highlightsComments: true,
    fetchesReplies: true,
    usesUserMap: true,
    isOptimistic: false,
    minItemsOnPage: 20,
});