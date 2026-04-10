import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import type { ProjectQueryData } from "@/util/types/app/query.types";
import type { ScratchProject, ScratchProjectFile } from "@/util/types/api/project.types";

import { useSession } from "../useSession";
import { produce } from "immer";

export const useProject = (projectId: number) => {
    const { session } = useSession();
    const queryClient = useQueryClient();

    const fetchProject = useCallback(async () => {
        const projectRes = await apiReq<ScratchProject>({
            host: 'https://api.scratch.mit.edu',
            path: `/projects/${projectId}/`,
            auth: session?.user?.token,
            responseType: 'json',
        });
        if (!projectRes.success) throw new Error(projectRes.error);

        return projectRes.data;
    }, [projectId, session]);

    const fetchLovedByMe = useCallback(async () => {
        if (!session?.user?.username) return false;

        const lovedByMeRes = await apiReq<{ userLove: boolean }>({
            host: 'https://api.scratch.mit.edu',
            path: `/projects/${projectId}/loves/user/${session?.user?.username}`,
            responseType: 'json',
        });
        if (lovedByMeRes.success)
            return !!lovedByMeRes.data.userLove;

        return false;
    }, [projectId, session]);

    const fetchFavedByMe = useCallback(async () => {
        if (!session?.user?.username) return false;

        const favedByMeRes = await apiReq<{ userFavorite: boolean }>({
            host: 'https://api.scratch.mit.edu',
            path: `/projects/${projectId}/favorites/user/${session?.user?.username}`,
            responseType: 'json',
        });
        if (favedByMeRes.success)
            return !!favedByMeRes.data.userFavorite;

        return false;
    }, [projectId, session]);

    const fetchRemixes = useCallback(async () => {
        const remixesRes = await apiReq<ScratchProject[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/projects/${projectId}/remixes`,
            params: { limit: 6 },
            responseType: 'json',
        });
        if (remixesRes.success)
            return remixesRes.data;
        return [];
    }, [projectId]);

    const fetchStudios = useCallback(async (author: string) => {
        const studiosRes = await apiReq<any>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${projectId}/studios`,
            params: { limit: 6 },
            responseType: 'json',
        });
        if (studiosRes.success)
            return studiosRes.data;
        return [];
    }, [projectId]);

    const fetchProjectFile = useCallback(async (token: string) => {
        const projectFileRes = await apiReq<ScratchProjectFile>({
            host: 'https://projects.scratch.mit.edu',
            path: `/${projectId}`,
            params: { token },
            responseType: 'json',
        });
        if (projectFileRes.success)
            return projectFileRes.data;
        return null;
    }, [projectId]);

    const fetchAll = async (): Promise<ProjectQueryData> => {
        const [ project, lovedByMe, favedByMe, remixes ] = await Promise.all([
            fetchProject(),
            fetchLovedByMe(),
            fetchFavedByMe(),
            fetchRemixes(),
        ]);
        const [ studios, file ] = await Promise.all([
            fetchStudios(project?.author?.username),
            fetchProjectFile(project?.project_token),
        ]);
        return {
            project,
            lovedByMe,
            favedByMe,
            remixes,
            studios,
            file,
        }
    };

    const setLovedByMeDirectly = (loved: boolean) => {
        queryClient.setQueryData(['project', projectId], (prev: ProjectQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;

            const prevLoved = prev.lovedByMe;
            const change = +loved - +prevLoved;

            draft.lovedByMe = loved;
            draft.project.stats.loves += change;
        }));
    }

    const setFavedByMeDirectly = (faved: boolean) => {
        queryClient.setQueryData(['project', projectId], (prev: ProjectQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;

            const prevFaved = prev.favedByMe;
            const change = +faved - +prevFaved;

            draft.favedByMe = faved;
            draft.project.stats.favorites += change;
        }));
    }
    
    const project = useQuery<ProjectQueryData>({
        queryKey: ['project', projectId],
        queryFn: fetchAll,
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    return {
        project,
        setLovedByMeDirectly,
        setFavedByMeDirectly,
    }

}