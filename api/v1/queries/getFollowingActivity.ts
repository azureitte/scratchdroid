import { Session } from "@/util/types/accounts.types";
import { apiReq } from "../request";
import { API_MODERN_ENDPOINT } from "../constants";

export const getFollowingActivity = async (session: Session) => {
    if (!session.user) return [];

    const res = await apiReq({
        endpoint: API_MODERN_ENDPOINT,
        path: '/users/' + session.user.username + '/following/users/activity',
        params: { limit: 3 },
        auth: session.user.token,
        responseType: 'json',
    });
    if (!res.success) throw new Error(res.error);
    return res.data;
}