import { useMutation } from "@tanstack/react-query";

import { apiReq } from "../../util/api";
import { useSession } from "../useSession";

export const useMarkMessagesRead = () => {
    const { isLoading: isSessionLoading, session } = useSession();

    const { mutate } = useMutation<void, Error, void>({
        mutationKey: ['messages', 'mark-read'],
        mutationFn: async () => {
            if (isSessionLoading || !session.user) return;

            const markRes = await apiReq<number>({
                path: `/site-api/messages/messages-clear/`,
                method: 'POST',
                useCrsf: true,
                responseType: 'json',
            });
            if (!markRes.success) throw new Error(markRes.error);
        },
    });

    return mutate;
};