import { apiReq } from "../request";
import { Session } from "@/util/types/accounts.types";
import { parseR2CommentMutationResponse } from "../parsers/comments";
import { Comment } from "@/util/types/comments.types";

type AddCommentOptions = {
    username: string;
    content: string;
    parentId?: number;
    replyToId?: number;
    session?: Session;
}

export const addUserComment = async ({
    username,
    content,
    parentId,
    replyToId,
    session,
}: AddCommentOptions): Promise<({
    success: true;
    comment?: Comment;
}|{
    success: false;
    error: string;
})> => {
    if (!session?.user) return { 
        success: false, 
        error: 'Please log in to comment.' 
    };

    if (!content) return { 
        success: false, 
        error: 'You can\'t post an empty comment!'
    };

    const res = await apiReq({
        path: `/site-api/comments/user/${username}/add/`,
        method: 'POST',
        body: {
            content: content,
            parent_id: parentId ?? null,
            commentee_id: replyToId ?? null,
        },
        useCrsf: true,
        responseType: 'html',
    });
    if (!res.success) return {
        success: false,
        error: res.error
    }
    if (res.status >= 500) return {
        success: false,
        error: 'A server-side error occurred. Please try again later.'
    }

    const parsedRes = parseR2CommentMutationResponse(res.data, {
        isReply: !!parentId,
        parentId: parentId,
    });
    return parsedRes;
}