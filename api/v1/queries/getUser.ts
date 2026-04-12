import { CarouselProject, User } from "@/util/types/users.types";
import { apiReq } from "../request";
import { ScratchUser } from "../types/user.types";
import { ScratchProject } from "../types/project.types";
import { getUserFromProfilePage } from "../parsers/users";
import { Session } from "@/util/types/accounts.types";
import { API_MODERN_ENDPOINT } from "../constants";

const fetchUser = async (username: string) => {
    const userRes = await apiReq<ScratchUser>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${username}/`,
        responseType: 'json',
    });
    if (!userRes.success) throw new Error(userRes.error);

    return userRes.data;
};

const fetchSharedProjects = async (username: string) => {
    const sharedProjectsRes = await apiReq<ScratchProject[]>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${username}/projects/`,
        params: { limit: 20 },
        responseType: 'json',
    });
    if (sharedProjectsRes.success)
        return sharedProjectsRes.data.map(p => ({
            id: p.id,
            title: p.title,
            author: p.author.username,
            views: p.stats.views,
        } as CarouselProject));

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
}: GetUserProps): Promise<User> => {
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
        id: user.id,
        username: user.username,
        joined: new Date(user.history.joined),
        images: {
            tiny: user.profile.images['32x32'],
            small: user.profile.images['50x50'],
            medium: user.profile.images['55x55'],
            large: user.profile.images['60x60'],
            huge: user.profile.images['90x90'],
        },

        country: user.profile.country,
        bio: user.profile.bio,
        status: user.profile.status,
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