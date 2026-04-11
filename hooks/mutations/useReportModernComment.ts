import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type ReportModernCommentOptions = {
    type: 'project' | 'studio';
    objectId: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

type ReportCommentFormData = {
    id: number;
    parentId: number|null;
}

export const useReportModernComment = ({
    type,
    objectId,
    onSuccess,
    onError,
}: ReportModernCommentOptions) => {

    const { session } = useSession();
    const { a: { reportProjectComment } } = useApi();
    
    const action = useMutation({
        mutationKey: ['report-comment', type, objectId],
        mutationFn: async (payload: ReportCommentFormData): Promise<({
            success: true;
        }|{
            success: false;
            error: string;
        })> => {
            return reportProjectComment({
                projectId: Number(objectId),
                id: payload.id,
                parentId: payload.parentId,
                session
            });
        },
        onSettled: (data) => {
            if (data?.success) {
                onSuccess?.();
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