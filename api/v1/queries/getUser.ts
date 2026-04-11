import { UserQueryData } from "@/util/types/app/users.types";
import { apiReq } from "../request";
import { ScratchUser } from "../types/user.types";
import { ScratchProject } from "../types/project.types";
import { getUserFromProfilePage } from "../parsers/users";
import { Session } from "@/util/types/app/accounts.types";

const fetchUser = async (username: string) => {
    const userRes = await apiReq<ScratchUser>({
        host: 'https://api.scratch.mit.edu',
        path: `/users/${username}/`,
        responseType: 'json',
    });
    if (!userRes.success) throw new Error(userRes.error);

    return userRes.data;
};

const fetchSharedProjects = async (username: string) => {
    const sharedProjectsRes = await apiReq<ScratchProject[]>({
        host: 'https://api.scratch.mit.edu',
        path: `/users/${username}/projects/`,
        params: { limit: 20 },
        responseType: 'json',
    });
    if (sharedProjectsRes.success)
        return sharedProjectsRes.data;

    return [];
};

const fetchR2 = async (username: string) => {
    const res = await apiReq({
        path: `/users/${username}/`,
        responseType: 'html',
    });

    if (res.success && res.status === 200)
        return getUserFromProfilePage(res.data);

    return null;
};

type GetUserProps = {
    username: string;
    session?: Session;
}

export const getUser = async ({
    username,
}: GetUserProps): Promise<UserQueryData> => {
    const [
        user,
        sharedProjects,
        r2,
    ] = await Promise.all([
        fetchUser(username),
        fetchSharedProjects(username),
        fetchR2(username),
    ]);

    return {
        user,
        role: r2?.role ?? 'Scratcher',
        roleLink: r2?.roleLink ?? null,
        bannerProject: r2?.bannerProject ?? null,
        sharedProjects,
        favoriteProjects: r2?.favoriteProjects ?? [],
        studiosFollowing: r2?.studiosFollowing ?? [],
        studiosCurating: r2?.studiosCurating ?? [],
        followers: r2?.followers ?? [],
        following: r2?.following ?? [],
        classrooms: r2?.classrooms ?? [],
        sharedProjectsCount: r2?.sharedProjectsCount,
        classroomsCount: r2?.classroomsCount,

        canComment: r2?.canComment ?? true,
        canFollow: r2?.canFollow ?? false,
        isFollowing: r2?.isFollowing ?? false,
    }
}