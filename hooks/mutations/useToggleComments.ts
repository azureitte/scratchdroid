import { useMutation } from "@tanstack/react-query";

import { useSession } from "../useSession";
import { useApi } from "../useApi";

type ToggleCommentsOptions = {
    type: 'user'|'project'|'studio';
    objectId?: number;
    objectName?: string;
    onSuccess?: (loved: boolean) => void;
    onError?: (error: Error) => void;
}

type ToggleCommentsPayload = {
    from: boolean;
    to: boolean;
}

export const useToggleComments = ({
    type,
    objectId,
    objectName,
    onSuccess,
    onError,
}: ToggleCommentsOptions) => {
    
    const { session } = useSession();
    const { a: { 
        toggleUserComments, 
        toggleProjectComments,
    } } = useApi();

    const action = useMutation({
        mutationKey: ['toggle-comments', type, objectName ?? objectId],
        mutationFn: async ({ from, to }: ToggleCommentsPayload): Promise<boolean> => {
            if (type === 'user') {
                return toggleUserComments({
                    username: objectName!,
                    from,
                    to,
                    session,
                });
            } else if (type === 'project') {
                return toggleProjectComments({
                    projectId: objectId!,
                    from,
                    to,
                    session,
                });
            }
            throw new Error('Not implemented');
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