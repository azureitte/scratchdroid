import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";

import { apiReq } from "@/util/api";
import { getUserFromProfilePage } from "@/util/parsing/users";

import type { UserQueryData } from "@/util/types/app/users.types";
import type { ScratchUser } from "@/util/types/api/user.types";
import type { ScratchProject } from "@/util/types/api/project.types";

export const useUser = (username: string) => {

    const queryClient = useQueryClient();

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

    const fetchR2 = useCallback(async () => {
        const res = await apiReq({
            path: `/users/${username}/`,
            responseType: 'html',
        });

        if (res.success && res.status === 200)
            return getUserFromProfilePage(res.data);

        return null;
    }, [username]);

    const fetchAll = async (): Promise<UserQueryData> => {
        const [
            user,
            sharedProjects,
            r2,
        ] = await Promise.all([
            fetchUser(),
            fetchSharedProjects(),
            fetchR2(),
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
    };

    const user = useQuery<UserQueryData>({
        queryKey: ['user', username],
        queryFn: fetchAll,
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const setIsFollowingDirectly = (following: boolean) => {
        queryClient.setQueryData(['user', username], (prev: UserQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;
            draft.isFollowing = following;
        }));
    }

    return {
        user,
        setIsFollowingDirectly,
    }

}