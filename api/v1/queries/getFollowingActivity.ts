import { Session } from "@/util/types/accounts.types";
import { apiReq } from "../request";

export const getFollowingActivity = async (session: Session) => {
    if (!session.user) return [];

    const res = await apiReq({
        host: 'https://api.scratch.mit.edu',
        path: '/users/' + session.user.username + '/following/users/activity',
        params: { limit: 3 },
        auth: session.user.token,
        responseType: 'json',
    });
    if (!res.success) throw new Error(res.error);
    return res.data;
}