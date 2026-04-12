import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type FollowUserOptions = {
    username: string;
    onSuccess?: (loved: boolean) => void;
    onError?: (error: Error) => void;
}

type FollowUserPayload = {
    from: boolean;
    to: boolean;
}

export const useFollowUser = ({
    username,
    onSuccess,
    onError,
}: FollowUserOptions) => {

    const { session } = useSession();
    const { a: { followUser } } = useApi();

    const action = useMutation({
        mutationKey: ['follow-user', username],
        mutationFn: async ({ from, to }: FollowUserPayload): Promise<boolean> => {
            return followUser({
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