import { useQuery } from "@tanstack/react-query";

import { apiReq } from "../util/api";
import { useSession } from "./useSession";

export const useUnreadMessages = (persist: boolean = false) => {
    const { isLoading: isSessionLoading, session } = useSession();

    const { data } = useQuery<number>({
        queryKey: ['unread', isSessionLoading, persist],
        queryFn: async () => {
            if (isSessionLoading || !session.user) return 0;

            const messageCountRes = await apiReq<{ count: number }>({
                host: 'https://api.scratch.mit.edu',
                path: `/users/${session.user.username}/messages/count?a=${Math.random()}`,
            });
            if (!messageCountRes.success) throw new Error(messageCountRes.error);

            return messageCountRes.data.count;
        },
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    return data ?? 0;
};