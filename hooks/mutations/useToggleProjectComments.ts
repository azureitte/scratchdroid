import { useMutation } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import type { ScratchProject } from "@/util/types/api/project.types";

import { useSession } from "../useSession";

type ToggleProjectCommentsOptions = {
    projectId: number;
    onSuccess?: (loved: boolean) => void;
    onError?: (error: Error) => void;
}

type ToggleProjectCommentsPayload = {
    from: boolean;
    to: boolean;
}

export const useToggleProjectComments = ({
    projectId,
    onSuccess,
    onError,
}: ToggleProjectCommentsOptions) => {
    const { session, reportFaultyLogin } = useSession();

    const action = useMutation({
        mutationKey: ['toggle-comments', 'project', projectId],
        mutationFn: async ({ from, to }: ToggleProjectCommentsPayload): Promise<boolean> => {
            if (!session?.user) return false;

            const res = await apiReq<ScratchProject>({
                host: 'https://api.scratch.mit.edu',
                path: `/projects/${projectId}`,
                method: 'PUT',
                body: {
                    comments_allowed: to,
                },
                responseType: 'json',
                auth: session.user.token,
                useCrsf: true,
            });

            if (res.status === 403) {
                reportFaultyLogin();
            }

            if (!res.success || res.status > 299) 
                return from; // used to rollback optimistic update

            return res.data.comments_allowed ?? to; // confirm new state
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