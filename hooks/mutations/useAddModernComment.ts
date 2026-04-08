import { useMutation } from "@tanstack/react-query";

import { getCommentFromWww3 } from "@/util/parsing/comments";
import { apiReq } from "@/util/api";
import type { Comment } from "@/util/types/app/comments.types";
import type { 
    ModernAddCommentResponse, 
    ModernAddCommentResponseRejected, 
    ScratchComment 
} from "@/util/types/api/comment.types";

import { useSession } from "../useSession";
import { FAIL_REASON_MESSAGES } from "@/util/constants";

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
    const { isLoggedIn, session } = useSession();
    
    const action = useMutation({
        mutationKey: ['add-comment', type, objectId],
        mutationFn: async (payload: AddCommentFormData): Promise<({
            success: true;
            comment?: Comment;
        }|{
            success: false;
            error: string;
        })> => {
            if (!isLoggedIn || !session.user) return { 
                success: false, 
                error: 'Please log in to comment.' 
            };

            if (!payload.content) return { 
                success: false, 
                error: 'You can\'t post an empty comment!'
            };

            const res = await apiReq<ModernAddCommentResponse>({
                host: 'https://api.scratch.mit.edu',
                path: `/proxy/comments/${type}/${objectId}`,
                method: 'POST',
                body: {
                    content: payload.content,
                    parent_id: payload.parentId ?? '',
                    commentee_id: payload.replyToId ?? '',
                },
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

            const rejected = res.data as ModernAddCommentResponseRejected;
            if (rejected.rejected) {
                return {
                    success: false,
                    error: FAIL_REASON_MESSAGES[rejected.rejected](rejected.status.mute_status),
                };
            }

            const comment = getCommentFromWww3({
                ...res.data,
                parent_id: payload.parentId,
                commentee_id: payload.replyToId,
            } as ScratchComment);
            return {
                success: true,
                comment,
            }
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