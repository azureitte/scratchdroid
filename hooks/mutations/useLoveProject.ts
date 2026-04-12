import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

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

    const { session } = useSession();
    const { a: { rateProject } } = useApi();

    const action = useMutation({
        mutationKey: ['love-project', projectId],
        mutationFn: async ({ from, to }: LoveProjectPayload): Promise<boolean> => {
            return rateProject({
                projectId,
                type: 'love',
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