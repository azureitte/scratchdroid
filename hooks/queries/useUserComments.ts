import { useComments } from "./useComments";
import { useApi } from "../useApi";

type InfiniteUserCommentsProps = {
    user: string;
    enabled?: boolean;
}
export const useUserComments = ({
    user,
    enabled = true,
}: InfiniteUserCommentsProps) => {

    const queryKey = ['comments', 'user', user] as const;
    
    const { q: { getUserRootComments } } = useApi();

    const {
        flatData,
        isLoading,
        isFirstLoading,
        isSuccess,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        resetToFirstPage,
        refresh,
        addCommentDirectly,
        deleteCommentDirectly,
        replaceCommentDirectly,
    } = useComments({
        queryKey,
        firstPage: 0,
        enabled,
        fetchRootComments: async (page) =>
            getUserRootComments({ username: user, page }),
    });

    return { 
        data: flatData, 

        isLoading,
        isFirstLoading,
        isSuccess,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        
        resetToFirstPage,
        refresh,
        addCommentDirectly,
        deleteCommentDirectly,
        replaceCommentDirectly,
    };
};