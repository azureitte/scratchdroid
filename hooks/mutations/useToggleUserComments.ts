import { useMutation } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import type { ScratchProject } from "@/util/types/api/project.types";

import { useSession } from "../useSession";

type ToggleUserCommentsOptions = {
    username: string;
    onSuccess?: (loved: boolean) => void;
    onError?: (error: Error) => void;
}

type ToggleUserCommentsPayload = {
    from: boolean;
    to: boolean;
}

export const useToggleUserComments = ({
    username,
    onSuccess,
    onError,
}: ToggleUserCommentsOptions) => {
    const { session } = useSession();

    const action = useMutation({
        mutationKey: ['toggle-comments', 'user', username],
        mutationFn: async ({ from, to }: ToggleUserCommentsPayload): Promise<boolean> => {
            if (!session?.user) return false;

            const res = await apiReq<ScratchProject>({
                path: `/site-api/comments/user/${username}/toggle-comments/`,
                method: 'POST',
                responseType: 'json',
                auth: session.user.token,
                useCrsf: true,
            });

            if (!res.success || res.status > 299) 
                return from; // used to rollback optimistic update

            return to; // confirm new state
        },
        onSuccess: (data) => {
            onSuccess?.(data);
        },
        onError: (error) => {
            onError?.(error);
        },
    });

    return {
        mutate: action.mutate,
        isPending: action.isPending,
    }
}