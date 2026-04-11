import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

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
    const { a: { toggleUserComments } } = useApi();

    const action = useMutation({
        mutationKey: ['toggle-comments', 'user', username],
        mutationFn: async ({ from, to }: ToggleUserCommentsPayload): Promise<boolean> => {
            return toggleUserComments({
                username,
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