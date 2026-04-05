import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiReq } from "../util/api";
import { useSession } from "./useSession";

export const useDeleteMessage = () => {
    const { isLoading: isSessionLoading, session } = useSession();
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationKey: ['messages', 'delete'],
        mutationFn: async (id: number) => {
            if (isSessionLoading || !session.user) return;

            const deleteRes = await apiReq<{ success: boolean }>({
                path: `/site-api/messages/messages-delete/`,
                method: 'POST',
                body: {
                    alertId: id,
                    alertType: "notification",
                },
                useCrsf: true,
                responseType: 'json',
            });
            if (!deleteRes.success) throw new Error(deleteRes.error);
            if (!deleteRes.data.success) throw new Error('Something went wrong');

            queryClient.setQueriesData({
                queryKey: ['unread'],
            }, (oldData: number) => {
                if (!oldData) return oldData;
                return Math.max(0, oldData - 1);
            });
            
            queryClient.invalidateQueries({ 
                queryKey: ['unread'] 
            });

            return;
        },
    });

    return mutate;
};