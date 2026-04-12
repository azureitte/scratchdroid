import { API_LEGACY_ENDPOINT } from "../constants";
import { apiReq } from "../request";
import { Session } from "@/util/types/accounts.types";

type ToggleUserCommentsOptions = {
    username: string;
    from: boolean;
    to: boolean;
    session?: Session;
}

export const toggleUserComments = async ({
    username,
    from,
    to,
    session,
}: ToggleUserCommentsOptions): Promise<boolean> => {
    if (!session?.user) return false;

    const res = await apiReq({
        endpoint: API_LEGACY_ENDPOINT,
        path: `/comments/user/${username}/toggle-comments/`,
        method: 'POST',
        useCrsf: true,
        auth: session.user.token,
        responseType: 'text',
    });

    if (!res.success || res.status > 299) 
        return from; // used to rollback optimistic update

    return to; // confirm new state
}