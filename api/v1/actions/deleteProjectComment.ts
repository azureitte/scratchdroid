import { API_MODERN_ENDPOINT } from "../constants";
import { apiReq } from "../request";
import { Session } from "@/util/types/accounts.types";

type DeleteCommentOptions = {
    projectId: number;
    id: number;
    parentId: number|null;
    session?: Session;
}

export const deleteProjectComment = async ({
    projectId,
    id,
    session,
}: DeleteCommentOptions): Promise<({
    success: true;
}|{
    success: false;
    error: string;
})> => {
    if (!session?.user) return { 
        success: false, 
        error: 'Please log in.' 
    };

    const res = await apiReq({
        endpoint: API_MODERN_ENDPOINT,
        path: `/proxy/comments/project/${projectId}/comment/${id}`,
        method: 'DELETE',
        useCrsf: true,
        auth: session.user.token,
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
}