import { useQuery, useQueryClient } from "@tanstack/react-query";

import { addAccount, clearAccounts, getAccountCredentials, getAccounts, getActiveAccount } from "@/util/accountStorage";
import type { RemoteAccount } from "@/util/types/app/accounts.types";
import { apiReq } from "@/util/api";


export const useAccountStorage = () => {

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const accounts = await getAccounts();
            const activeAccount = await getActiveAccount();

            const fetchUnreadFor = async (username: string) => {
                if (username === activeAccount) return 0;

                const messageCountRes = await apiReq<{ count: number }>({
                    host: 'https://api.scratch.mit.edu',
                    path: `/users/${username}/messages/count?a=${Math.random()}`,
                });
                if (!messageCountRes.success) throw new Error(messageCountRes.error);
    
                return messageCountRes.data.count;
            }

            const unreadCounts = await Promise.all(accounts.map(a => fetchUnreadFor(a.username)));

            const remoteAccounts: RemoteAccount[] = accounts.map((a, idx) => ({
                ...a,
                unread: unreadCounts[idx],
            }));

            return remoteAccounts;
        },
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const queryClient = useQueryClient();

    const refresh = async () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
    };

    return {
        accounts: data ?? [],
        isLoading,
        isSuccess,
        refresh,
        getAccountCredentials,
        addAccount,
        clearAccounts,
    }

};