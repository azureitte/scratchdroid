import { API_LEGACY_ENDPOINT } from "../constants";
import { apiReq } from "../request";
import { Session } from "@/util/types/accounts.types";

type FollowUserOptions = {
    username: string;
    from: boolean;
    to: boolean;
    session?: Session;
}

export const followUser = async ({
    username,
    from,
    to,
    session,
}: FollowUserOptions): Promise<boolean> => {
    if (!session?.user) return false;

    const actionType = to ? 'add' : 'remove';
    const res = await apiReq({
        endpoint: API_LEGACY_ENDPOINT,
        path: `/users/followers/${username}/${actionType}/`,
        params: { usernames: session.user.username },
        method: 'PUT',
        responseType: 'json',
        useCrsf: true,
    });

    if (!res.success || res.status > 299) 
        return from; // used to rollback optimistic update

    return to; // confirm new state
}