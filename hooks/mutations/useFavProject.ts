import { useMutation } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import { useSession } from "../useSession";

type FavProjectOptions = {
    projectId: number;
    onSuccess?: (faved: boolean) => void;
    onError?: (error: Error) => void;
}

type FavProjectPayload = {
    from: boolean;
    to: boolean;
}

export const useFavProject = ({
    projectId,
    onSuccess,
    onError,
}: FavProjectOptions) => {
    const { session, reportFaultyLogin } = useSession();

    const action = useMutation({
        mutationKey: ['fav-project', projectId],
        mutationFn: async ({ from, to }: FavProjectPayload): Promise<boolean> => {
            if (!session?.user) return false;

            const method = to ? 'POST' : 'DELETE';
            const res = await apiReq<{ 
                statusChanged: boolean, 
                userFavorite: boolean 
            }>({
                host: 'https://api.scratch.mit.edu',
                path: `/proxy/projects/${projectId}/favorites/user/${session.user.username}`,
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

            return res.data.userFavorite; // confirm new state
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