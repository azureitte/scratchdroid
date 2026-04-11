import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types/comments.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type AddModernCommentOptions = {
    type: 'project' | 'studio';
    objectId: number;
    onSuccess?: (comment?: Comment) => void;
    onError?: (error: string) => void;
}

type AddCommentFormData = {
    content: string;
    parentId?: number;
    replyToId?: number;
}

export const useAddModernComment = ({
    type,
    objectId,
    onSuccess,
    onError,
}: AddModernCommentOptions) => {

    const { session } = useSession();
    const { a: { addProjectComment } } = useApi();
    
    const action = useMutation({
        mutationKey: ['add-comment', type, objectId],
        mutationFn: async (payload: AddCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            if (type !== 'project') return {
                success: false,
                error: 'Not implemented',
            }

            return addProjectComment({
                projectId: Number(objectId),
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