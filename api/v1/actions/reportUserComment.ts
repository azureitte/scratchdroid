import { apiReq } from "../request";
import { parseR2CommentMutationResponse } from "../parsers/comments";
import { Comment } from "@/util/types/app/comments.types";
import { Session } from "@/util/types/app/accounts.types";

type ReportCommentOptions = {
    username: string;
    id: number;
    parentId: number|null;
    session?: Session;
}

export const reportUserComment = async ({
    username,
    id,
    parentId,
    session,
}: ReportCommentOptions): Promise<({
    success: true;
    comment?: Comment;
}|{
    success: false;
    error: string;
})> => {
    if (!session?.user) return { 
        success: false, 
        error: 'Please log in.' 
    };

    const res = await apiReq({
        path: `/site-api/comments/user/${username}/rep/`,
        method: 'POST',
        body: { id },
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
        parentId: parentId ?? undefined,
    });
    if (parsedRes.success && parsedRes.comment) 
        parsedRes.comment.isReported = true;

    return parsedRes;
}