import { useMutation } from "@tanstack/react-query";

import { apiReq } from "@/util/api";

import { useSession } from "../useSession";

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
    const { isLoggedIn, session } = useSession();
    
    const action = useMutation({
        mutationKey: ['report-comment', type, objectId],
        mutationFn: async (payload: ReportCommentFormData): Promise<({
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
                path: `/proxy/${type}/${objectId}/comment/${payload.id}/report`,
                method: 'POST',
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
            if (res.status >= 400) return {
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