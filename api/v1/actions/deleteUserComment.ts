import { apiReq } from "../request";
import { parseR2CommentMutationResponse } from "../parsers/comments";
import { Comment } from "@/util/types/comments.types";
import { Session } from "@/util/types/accounts.types";
import { API_LEGACY_ENDPOINT } from "../constants";

type DeleteCommentOptions = {
    username: string;
    id: number;
    parentId: number|null;
    session?: Session;
}

export const deleteUserComment = async ({
    username,
    id,
    parentId,
    session,
}: DeleteCommentOptions): Promise<({
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
        endpoint: API_LEGACY_ENDPOINT,
        path: `/comments/user/${username}/del/`,
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
    return parsedRes;
}