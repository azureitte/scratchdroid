import { useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";

import type { UserQueryData } from "@/util/types/app/users.types";

import { useApi } from "../useApi";

export const useUser = (username: string) => {

    const queryClient = useQueryClient();
    const { q: { getUser } } = useApi();

    const user = useQuery<UserQueryData>({
        queryKey: ['user', username],
        queryFn: () => {
            return getUser({ username });
        },
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

    const setCommentsAllowedDirectly = (commentsAllowed: boolean) => {
        queryClient.setQueryData(['user', username], (prev: UserQueryData|null) => produce(prev, (draft) => {
            if (!draft || !prev) return;
            draft.canComment = commentsAllowed;
        }));
    }

    return {
        user,
        setIsFollowingDirectly,
        setCommentsAllowedDirectly,
    }

}