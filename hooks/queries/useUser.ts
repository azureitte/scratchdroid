import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiReq } from "@/util/api";

import type { UserQueryData, BannerProject } from "@/util/types/app/query.types";
import type { ScratchUser } from "@/util/types/api/user.types";
import type { ScratchProject } from "@/util/types/api/project.types";

export const useUser = (username: string) => {

    const fetchUser = useCallback(async () => {
        const userRes = await apiReq<ScratchUser>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/`,
            responseType: 'json',
        });
        if (!userRes.success) throw new Error(userRes.error);

        return userRes.data;
    }, [username]);

    const fetchSharedProjects = useCallback(async () => {
        const sharedProjectsRes = await apiReq<ScratchProject[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/projects/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (sharedProjectsRes.success)
            return sharedProjectsRes.data;

        return [];
    }, [username]);

    const fetchFavoriteProjects = useCallback(async () => {
        const favoriteProjectsRes = await apiReq<ScratchProject[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/favorites/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (favoriteProjectsRes.success)
            return favoriteProjectsRes.data;

        return [];
    }, [username]);

    const fetchBannerProject = useCallback(async (fallback?: ScratchProject): Promise<BannerProject|null> => {
        const bannerProjectRes = await apiReq<any>({
            path: `/site-api/users/all/${username}/`,
            responseType: 'json',
        });
        if (!bannerProjectRes.success) return null;

        const data = bannerProjectRes.data;
        if (!data.featured_project_data) {
            if (fallback)
                return {
                    id: fallback.id,
                    title: fallback.title,
                    thumbnail_url: fallback.image,
                    label: data.featured_project_label_name ?? 'Featured Project',
                };
        } else {
            return {
                ...data.featured_project_data,
                label: data.featured_project_label_name ?? 'Featured Project',
            };
        }

        return null;
    }, [username]);

    const fetchSharedThenBanner = async () => {
        const sharedProjects = await fetchSharedProjects();
        const bannerProject = await fetchBannerProject(sharedProjects[0]);
        return { sharedProjects, bannerProject };
    };

    const fetchFollowers = useCallback(async () => {
        const followersRes = await apiReq<ScratchUser[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/followers/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (followersRes.success)
            return followersRes.data;
        return [];
    }, [username]);

    const fetchFollowing = useCallback(async () => {
        const followingRes = await apiReq<ScratchUser[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${username}/following/`,
            params: { limit: 20 },
            responseType: 'json',
        });
        if (followingRes.success)
            return followingRes.data;
        return [];
    }, [username]);

    const fetchAll = async (): Promise<UserQueryData> => {
        const [
            user,
            { sharedProjects, bannerProject },
            favoriteProjects,
            followers,
            following,
        ] = await Promise.all([
            fetchUser(),
            fetchSharedThenBanner(),
            fetchFavoriteProjects(),
            fetchFollowers(),
            fetchFollowing(),
        ]);

        return {
            user,
            bannerProject,
            sharedProjects,
            favoriteProjects,
            followers,
            following,
        }
    };

    const user = useQuery<UserQueryData>({
        queryKey: ['user', username],
        queryFn: fetchAll,
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return user;

}