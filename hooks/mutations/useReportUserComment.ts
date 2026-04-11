import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types/app/comments.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

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

    const { session } = useSession();
    const { a: { reportUserComment } } = useApi();
    
    const action = useMutation({
        mutationKey: ['report-comment', 'user', username],
        mutationFn: async (payload: ReportCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            return reportUserComment({
                username,
                id: payload.id,
                parentId: payload.parentId,
                session,
            });
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