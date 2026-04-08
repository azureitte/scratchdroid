import { useMutation } from "@tanstack/react-query";

import type { Comment } from "@/util/types";
import { apiReq } from "@/util/api";

import { useSession } from "../useSession";

type DeleteModernCommentOptions = {
    type: 'project' | 'studio';
    objectId: number;
    onSuccess?: (comment?: Comment) => void;
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
    const { isLoggedIn, session } = useSession();
    
    const action = useMutation({
        mutationKey: ['delete-comment', type, objectId],
        mutationFn: async (payload: DeleteCommentFormData): Promise<({
            success: true;
        }|{
            success: false;
            error: string;
        })> => {
            if (!isLoggedIn || !session.user) return { 
                success: false, 
                error: 'Please log in.' 
            };

            const res = await apiReq({
                host: 'https://api.scratch.mit.edu',
                path: `/proxy/comments/${type}/${objectId}/comment/${payload.id}`,
                method: 'DELETE',
                useCrsf: true,
                auth: session?.user?.token,
                responseType: 'json',
            });
            if (!res.success) return {
                success: false,
                error: res.error
            }
            if (res.status >= 500) return {
                success: false,
                error: 'A server-side error occurred. Please try again later.'
            }
            if (res.data.status >= 400) return {
                success: false,
                error: res.data?.rejected ?? res.data?.error ?? 'Something went wrong'
            }

            return { success: true };
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