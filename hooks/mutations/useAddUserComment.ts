import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types/comments.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type AddUserCommentOptions = {
    username: string;
    onSuccess?: (comment?: Comment) => void;
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

    const { session } = useSession();
    const { a: { addUserComment } } = useApi();
    
    const action = useMutation({
        mutationKey: ['add-comment', 'user', username],
        mutationFn: async (payload: AddCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            return addUserComment({
                username,
                content: payload.content,
                parentId: payload.parentId,
                replyToId: payload.replyToId,
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