import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types/comments.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type DeleteCommentOptions = {
    type: 'user' | 'project' | 'studio';
    objectId?: number;
    objectName?: string;
    onSuccess?: (comment?: Comment) => void;
    onError?: (error: string) => void;
}

type DeleteCommentFormData = {
    id: number;
    parentId: number|null;
}

export const useDeleteComment = ({
    type,
    objectId,
    objectName,
    onSuccess,
    onError,
}: DeleteCommentOptions) => {

    const { session } = useSession();
    const { a: { 
        deleteProjectComment, 
        deleteUserComment,
    } } = useApi();

    const action = useMutation({
        mutationKey: ['delete-comment', type, objectId],
        mutationFn: async (payload: DeleteCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            if (type === 'user') {
                return deleteUserComment({
                    username: objectName!,
                    parentId: payload.parentId,
                    id: payload.id,
                    session,
                });
            } else if (type === 'project') {
                return deleteProjectComment({
                    projectId: objectId!,
                    parentId: payload.parentId,
                    id: payload.id,
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