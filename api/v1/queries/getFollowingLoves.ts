import { Session } from "@/util/types/app/accounts.types";
import { apiReq } from "../request";
import { ScratchProject } from "../types/project.types";

export const getFollowingLoves = async (session: Session) => {
    if (!session.user) return [];

    const res = await apiReq<ScratchProject[]>({
        host: 'https://api.scratch.mit.edu',
        path: '/users/' + session.user.username + '/following/users/loves',
        auth: session.user.token,
        responseType: 'json',
    });
    if (!res.success) throw new Error(res.error);
    return res.data;
}