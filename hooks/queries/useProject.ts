import { produce } from "immer";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ProjectQueryData } from "@/util/types/projects.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

export const useProject = (projectId: number) => {
    const queryClient = useQueryClient();
    const { session } = useSession();
    const { q: { getProject } } = useApi();
    
    const project = useQuery<ProjectQueryData>({
        queryKey: ['project', projectId],
        queryFn: () => {
            return getProject({ id: projectId, session });
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

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

    const setCommentsAllowedDirectly = (commentsAllowed: boolean) => {
        queryClient.setQueryData(['project', projectId], (prev: ProjectQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;

            draft.project.canComment = commentsAllowed;
        }));
    }

    return {
        project,
        setLovedByMeDirectly,
        setFavedByMeDirectly,
        setCommentsAllowedDirectly,
    }

}