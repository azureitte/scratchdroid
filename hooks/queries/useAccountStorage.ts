import { useQuery, useQueryClient } from "@tanstack/react-query";

import { addAccount, clearAccounts, getAccountCredentials, getAccounts } from "@/util/accountStorage";

export const useAccountStorage = () => {

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const accounts = await getAccounts();
            return accounts;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: false,
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