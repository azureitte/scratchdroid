import { API_MODERN_ENDPOINT } from "../constants";
import { apiReq } from "../request";
import { Session } from "@/util/types/accounts.types";

type ToggleProjectCommentsOptions = {
    projectId: number;
    from: boolean;
    to: boolean;
    session?: Session;
}

export const toggleProjectComments = async ({
    projectId,
    from,
    to,
    session,
}: ToggleProjectCommentsOptions): Promise<boolean> => {
    if (!session?.user) return false;

    const res = await apiReq({
        endpoint: API_MODERN_ENDPOINT,
        path: `/projects/${projectId}`,
        method: 'PUT',
        body: {
            comments_allowed: to,
        },
        useCrsf: true,
        auth: session.user.token,
        responseType: 'json',
    });

    if (!res.success || res.status > 299) 
        return from; // used to rollback optimistic update

    return res.data.comments_allowed ?? to; // confirm new state
}