import { useMutation } from "@tanstack/react-query";

import { parseR2CommentMutationResponse } from "@/util/parsing/comments";
import { apiReq } from "@/util/api";
import type { Comment } from "@/util/types/app/comments.types";

import { useSession } from "../useSession";

type ReportUserCommentOptions = {
    username: string;
    onSuccess?: (comment?: Comment) => void;
    onError?: (error: string) => void;
}

type ReportCommentFormData = {
    id: number;
    parentId: number|null;
}

export const useReportUserComment = ({
    username,
    onSuccess,
    onError,
}: ReportUserCommentOptions) => {
    const { isLoggedIn, session } = useSession();
    
    const action = useMutation({
        mutationKey: ['report-comment', 'user', username],
        mutationFn: async (payload: ReportCommentFormData): Promise<({
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
                path: `/site-api/comments/user/${username}/rep/`,
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

            const parsedRes = parseR2CommentMutationResponse(res.data, {
                isReply: !!payload.parentId,
                parentId: payload.parentId ?? undefined,
            });
            if (parsedRes.success && parsedRes.comment) 
                parsedRes.comment.isReported = true;

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