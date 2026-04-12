import { useQuery } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

export const useUnreadCount = (persist: boolean = false) => {
    const { isLoading: isSessionLoading, session, isLoggedIn } = useSession();
    const { q: { getUnreadCount } } = useApi();

    const { data } = useQuery<
        number, 
        Error, 
        number, 
        ['unread', { persist: boolean }]
    >({
        queryKey: ['unread', { persist }],
        queryFn: async () => {
            if (isSessionLoading || !session.user) return 0;
            return getUnreadCount(session.user.username);
        },
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        enabled: !isSessionLoading && isLoggedIn,
    });

    return data ?? 0;
};