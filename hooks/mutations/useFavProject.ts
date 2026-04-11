import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

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

    const { session } = useSession();
    const { a: { rateProject } } = useApi();

    const action = useMutation({
        mutationKey: ['fav-project', projectId],
        mutationFn: async ({ from, to }: FavProjectPayload): Promise<boolean> => {
            return rateProject({
                projectId,
                type: 'favorite',
                from,
                to,
                session,
            });
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