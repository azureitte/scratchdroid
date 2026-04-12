import { API_MODERN_ENDPOINT } from "../constants";
import { apiReq } from "../request";
import { Session } from "@/util/types/accounts.types";

type RateProjectOptions = {
    projectId: number;
    type: 'love'|'favorite';
    from: boolean;
    to: boolean;
    session?: Session;
}

export const rateProject = async ({
    projectId,
    type,
    from,
    to,
    session,
}: RateProjectOptions): Promise<boolean> => {
    if (!session?.user) return false;

    const ratingPath = type === 'love' ? 'loves' : 'favorites';
    const method = to ? 'POST' : 'DELETE';

    const res = await apiReq({
        endpoint: API_MODERN_ENDPOINT,
        path: `/proxy/projects/${projectId}/${ratingPath}/user/${session.user.username}`,
        method,
        responseType: 'json',
        auth: session.user.token,
        useCrsf: true,
    });

    if (!res.success || res.status > 299 || !res.data.statusChanged) 
        return from; // used to rollback optimistic update

    // confirm new state
    if (type === 'love') return res.data.userLove;
    return res.data.userFavorite;
}