import { apiReq } from "../request";
import { ModernAddCommentResponse, ModernAddCommentResponseRejected, ScratchComment } from "../types/comment.types";
import { Session } from "@/util/types/app/accounts.types";
import { FAIL_REASON_MESSAGES } from "../constants";
import { getCommentFromWww3 } from "../parsers/comments";
import { Comment } from "@/util/types/app/comments.types";

type AddCommentOptions = {
    projectId: number;
    content: string;
    parentId?: number;
    replyToId?: number;
    session?: Session;
}

export const addProjectComment = async ({
    projectId,
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

    const res = await apiReq<ModernAddCommentResponse>({
        host: 'https://api.scratch.mit.edu',
        path: `/proxy/comments/project/${projectId}`,
        method: 'POST',
        body: {
            content: content,
            parent_id: parentId ?? '',
            commentee_id: replyToId ?? '',
        },
        useCrsf: true,
        auth: session.user.token,
        responseType: 'json',
    });
    if (!res.success) return {
        success: false,
        error: res.error
    }
    if (res.status >= 500) return {
        success: false,
        error: 'A server-side error occurred. Please try again later.'
    }
    if (res.status === 403) {
        return {
            success: false,
            error: 'Your session has expired. Please restart the app to fix the issue.',
        }
    }

    const rejected = res.data as ModernAddCommentResponseRejected;
    if (rejected.rejected) {
        return {
            success: false,
            error: FAIL_REASON_MESSAGES[rejected.rejected](rejected.status.mute_status),
        };
    }

    const comment = getCommentFromWww3({
        ...res.data,
        parent_id: parentId,
        commentee_id: replyToId,
    } as ScratchComment);

    return {
        success: true,
        comment,
    }
}