import { useMutation } from "@tanstack/react-query";

import { apiReq } from "@/util/api";
import { useSession } from "../useSession";

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

    const action = useMutation({
        mutationKey: ['follow-user', username],
        mutationFn: async ({ from, to }: FollowUserPayload): Promise<boolean> => {
            if (!session?.user) return false;

            const actionType = to ? 'add' : 'remove';
            const res = await apiReq({
                path: `/site-api/users/followers/${username}/${actionType}/`,
                params: { usernames: session.user.username },
                method: 'PUT',
                responseType: 'json',
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