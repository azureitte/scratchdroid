import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

export const useMarkMessagesRead = () => {
    const { session } = useSession();
    const { a: { markMessagesRead } } = useApi();

    const { mutate } = useMutation<void, Error, void>({
        mutationKey: ['messages', 'mark-read'],
        mutationFn: async () => {
            if (!session?.user) return;
            await markMessagesRead();
        },
    });

    return mutate;
};