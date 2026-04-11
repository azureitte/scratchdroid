import { apiReq } from "../request";
import { Session } from "@/util/types/accounts.types";

type ReportCommentOptions = {
    projectId: number;
    id: number;
    parentId: number|null;
    session?: Session;
}

export const reportProjectComment = async ({
    projectId,
    id,
    session,
}: ReportCommentOptions): Promise<({
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
        host: 'https://api.scratch.mit.edu',
        path: `/proxy/project/${projectId}/comment/${id}/report`,
        method: 'POST',
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