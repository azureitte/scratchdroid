import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types/app/comments.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

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

    const { session } = useSession();
    const { a: { deleteUserComment } } = useApi();
    
    const action = useMutation({
        mutationKey: ['delete-comment', 'user', username],
        mutationFn: async (payload: DeleteCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            return deleteUserComment({
                username,
                parentId: payload.parentId,
                id: payload.id,
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