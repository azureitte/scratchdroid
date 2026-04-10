import { useMutation } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import { useSession } from "../useSession";

type LoveProjectOptions = {
    projectId: number;
    onSuccess?: (loved: boolean) => void;
    onError?: (error: Error) => void;
}

type LoveProjectPayload = {
    from: boolean;
    to: boolean;
}

export const useLoveProject = ({
    projectId,
    onSuccess,
    onError,
}: LoveProjectOptions) => {
    const { session, reportFaultyLogin } = useSession();

    const action = useMutation({
        mutationKey: ['love-project', projectId],
        mutationFn: async ({ from, to }: LoveProjectPayload): Promise<boolean> => {
            if (!session?.user) return false;

            const method = to ? 'POST' : 'DELETE';
            const res = await apiReq<{ 
                statusChanged: boolean, 
                userLove: boolean 
            }>({
                host: 'https://api.scratch.mit.edu',
                path: `/proxy/projects/${projectId}/loves/user/${session.user.username}`,
                method,
                responseType: 'json',
                auth: session.user.token,
                useCrsf: true,
            });

            if (res.status === 403) {
                reportFaultyLogin();
            }

            if (!res.success || res.status > 299 || !res.data.statusChanged) 
                return from; // used to rollback optimistic update

            return res.data.userLove; // confirm new state
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