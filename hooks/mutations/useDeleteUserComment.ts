import { useMutation } from "@tanstack/react-query";

import { parseR2AddCommentResponse } from "@/util/functions";
import type { Comment } from "@/util/types";
import { apiReq } from "@/util/api";

import { useSession } from "../useSession";

type DeleteUserCommentOptions = {
    username: string;
    onSuccess?: (comment?: Comment) => void;
    onError?: (error: string) => void;
}

type DeleteCommentFormData = {
    id: number;
    parentId: number|null;
}

export const useDeleteUserComment = ({
    username,
    onSuccess,
    onError,
}: DeleteUserCommentOptions) => {
    const { isLoggedIn, session } = useSession();
    
    const action = useMutation({
        mutationKey: ['delete-comment', 'user', username],
        mutationFn: async (payload: DeleteCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            if (!isLoggedIn || !session.user) return { 
                success: false, 
                error: 'Please log in.' 
            };

            const res = await apiReq({
                path: `/site-api/comments/user/${username}/del/`,
                method: 'POST',
                body: {
                    id: payload.id,
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
                isReply: !!payload.parentId,
                parentId: payload.parentId ?? undefined,
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