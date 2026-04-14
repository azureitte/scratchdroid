import { produce } from "immer";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { StudioPermissions, StudioQueryData } from "@/util/types/studios.types";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

export const useStudio = (studioId: number) => {
    const queryClient = useQueryClient();
    const { session } = useSession();
    const { q: { getStudio } } = useApi();
    
    const studio = useQuery<StudioQueryData>({
        queryKey: ['studio', studioId],
        queryFn: () => {
            return getStudio({ id: studioId, session });
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const setIsFollowingDirectly = (following: boolean) => {
        queryClient.setQueryData(['studio', studioId], (prev: StudioQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;
            draft.isFollowing = following;
        }));
    }

    const setCommentsAllowedDirectly = (commentsAllowed: boolean) => {
        queryClient.setQueryData(['studio', studioId], (prev: StudioQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;

            draft.studio.canComment = commentsAllowed;
        }));
    }

    const setPermissionsDirectly = (permissions: StudioPermissions) => {
        queryClient.setQueryData(['studio', studioId], (prev: StudioQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;

            draft.permissions = permissions;
        }));
    }

    const setPermissionDirectly = (permission: keyof StudioPermissions, value: boolean) => {
        queryClient.setQueryData(['studio', studioId], (prev: StudioQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;

            draft.permissions[permission] = value;
        }));
    }

    return {
        studio,
        setIsFollowingDirectly,
        setCommentsAllowedDirectly,
        setPermissionsDirectly,
        setPermissionDirectly,
    }

}