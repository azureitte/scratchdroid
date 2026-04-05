import { useMutation } from "@tanstack/react-query";

import { parseR2AddCommentResponse } from "@/util/functions";
import type { FlattenedComment } from "@/util/types";
import { apiReq } from "@/util/api";

import { useSession } from "./useSession";

type AddUserCommentOptions = {
    username: string;
    onSuccess?: (comment?: FlattenedComment) => void;
    onError?: (error: string) => void;
}

type AddCommentFormData = {
    content: string;
    parentId?: number;
    replyToId?: number;
}

export const useAddUserComment = ({
    username,
    onSuccess,
    onError,
}: AddUserCommentOptions) => {
    const { isLoggedIn, session } = useSession();
    
    const action = useMutation({
        mutationKey: ['add-comment', 'user', username],
        mutationFn: async (comment: AddCommentFormData): Promise<({
            success: true;
            comment?: FlattenedComment;
        }|{
            success: false;
            error: string;
        })> => {
            if (!isLoggedIn || !session.user) return { 
                success: false, 
                error: 'Please log in to comment.' 
            };

            const res = await apiReq({
                path: `/site-api/comments/user/${username}/add/`,
                method: 'POST',
                body: {
                    content: comment.content,
                    parent_id: comment.parentId ?? null,
                    commentee_id: comment.replyToId ?? null,
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

            const parsedRes = parseR2AddCommentResponse(res.data, {
                isReply: !!comment.parentId,
                parentId: comment.parentId,
            });
            return parsedRes;
        },
        onSettled: (data) => {
            if (data?.success) {
                onSuccess?.(data.comment);
            } else {
                onError?.(data?.error ?? 'Something went wrong');
            }
        },
    });

    return {
        mutate: action.mutate,
        isPending: action.isPending,
    }
};