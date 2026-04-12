import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types/comments.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type ReportCommentOptions = {
    type: 'user' | 'project' | 'studio';
    objectId?: number;
    objectName?: string;
    onSuccess?: (comment?: Comment) => void;
    onError?: (error: string) => void;
}

type ReportCommentFormData = {
    id: number;
    parentId: number|null;
}

export const useReportComment = ({
    type,
    objectId,
    objectName,
    onSuccess,
    onError,
}: ReportCommentOptions) => {

    const { session } = useSession();
    const { a: { 
        reportProjectComment, 
        reportUserComment,
    } } = useApi();

    const action = useMutation({
        mutationKey: ['report-comment', type, objectId],
        mutationFn: async (payload: ReportCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            if (type === 'user') {
                return reportUserComment({
                    username: objectName!,
                    id: payload.id,
                    parentId: payload.parentId,
                    session,
                });
            } else if (type === 'project') {
                return reportProjectComment({
                    projectId: objectId!,
                    id: payload.id,
                    parentId: payload.parentId,
                    session,
                });
            }
            throw new Error('Not implemented');
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