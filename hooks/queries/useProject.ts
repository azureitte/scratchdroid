import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import type { ProjectQueryData } from "@/util/types/app/query.types";
import type { ScratchProject, ScratchProjectFile } from "@/util/types/api/project.types";

import { useSession } from "../useSession";

export const useProject = (projectId: number) => {
    const { session } = useSession();

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
        const [ project, remixes ] = await Promise.all([
            fetchProject(),
            fetchRemixes(),
        ]);
        const [ studios, file ] = await Promise.all([
            fetchStudios(project?.author?.username),
            fetchProjectFile(project?.project_token),
        ]);
        return {
            project,
            remixes,
            studios,
            file,
        }
    };
    
    const project = useQuery<ProjectQueryData>({
        queryKey: ['project', projectId],
        queryFn: fetchAll,
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    return project;

}