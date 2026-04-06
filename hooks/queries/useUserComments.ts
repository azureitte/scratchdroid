import { apiReq } from "@/util/api";
import { getCommentsFromR2 } from "@/util/functions";
import { useComments } from "./useComments";

type InfiniteUserCommentsProps = {
    user: string;
    enabled?: boolean;
}
export const useUserComments = ({
    user,
    enabled = true,
}: InfiniteUserCommentsProps) => {

    const queryKey = ['comments', 'user', user] as const;

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
    } = useComments({
        queryKey,
        firstPage: 1,
        enabled,
        fetchRootComments: async (page) => {
            const path = '/site-api/comments/user/'
                + user + '/'

            const commentsRes = await apiReq({
                path: path,
                params: { page },
                useCrsf: true,
                responseType: 'html',
            });

            if (!commentsRes.success) throw new Error(commentsRes.error);
            if (commentsRes.status === 404) return [];

            return getCommentsFromR2(commentsRes.data);
        },
    })

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
    };
};