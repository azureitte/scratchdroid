import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();
    const { isLoading: isSessionLoading, session } = useSession();
    const { a: { deleteMessage } } = useApi();

    const { mutate } = useMutation({
        mutationKey: ['messages', 'delete'],
        mutationFn: async (id: number) => {
            if (isSessionLoading || !session.user) return;

            await deleteMessage(id);

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