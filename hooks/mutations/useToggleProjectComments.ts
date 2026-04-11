import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

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

    const { session } = useSession();
    const { a: { toggleProjectComments } } = useApi();

    const action = useMutation({
        mutationKey: ['toggle-comments', 'project', projectId],
        mutationFn: async ({ from, to }: ToggleProjectCommentsPayload): Promise<boolean> => {
            return toggleProjectComments({
                projectId,
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