import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type DeleteModernCommentOptions = {
    type: 'project' | 'studio';
    objectId: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

type DeleteCommentFormData = {
    id: number;
    parentId: number|null;
}

export const useDeleteModernComment = ({
    type,
    objectId,
    onSuccess,
    onError,
}: DeleteModernCommentOptions) => {
    const { session } = useSession();
    const { a: { deleteProjectComment } } = useApi();
    
    const action = useMutation({
        mutationKey: ['delete-comment', type, objectId],
        mutationFn: async (payload: DeleteCommentFormData): Promise<({
            success: true;
        }|{
            success: false;
            error: string;
        })> => {
            if (type !== 'project') return {
                success: false,
                error: 'Not implemented',
            }

            return deleteProjectComment({
                projectId: Number(objectId),
                parentId: payload.parentId,
                id: payload.id,
                session,
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