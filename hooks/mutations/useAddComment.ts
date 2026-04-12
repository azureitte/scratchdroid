import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types/comments.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type AddCommentOptions = {
    type: 'user' | 'project' | 'studio';
    objectId?: number;
    objectName?: string;
    onSuccess?: (comment?: Comment) => void;
    onError?: (error: string) => void;
}

type AddCommentFormData = {
    content: string;
    parentId?: number;
    replyToId?: number;
}

export const useAddComment = ({
    type,
    objectId,
    objectName,
    onSuccess,
    onError,
}: AddCommentOptions) => {

    const { session } = useSession();
    const { a: { 
        addProjectComment, 
        addUserComment,
    } } = useApi();

    const action = useMutation({
        mutationKey: ['add-comment', type, objectId],
        mutationFn: async (payload: AddCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            if (type === 'user') {
                return addUserComment({
                    username: objectName!,
                    content: payload.content,
                    parentId: payload.parentId,
                    replyToId: payload.replyToId,
                    session,
                });
            } else if (type === 'project') {
                return addProjectComment({
                    projectId: objectId!,
                    content: payload.content,
                    parentId: payload.parentId,
                    replyToId: payload.replyToId,
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