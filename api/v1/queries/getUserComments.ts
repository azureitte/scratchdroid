import { RootComment } from "@/util/types/comments.types";
import { apiReq } from "../request";
import { getCommentsFromR2 } from "../parsers/comments";

type GetUserCommentsOptions = {
    username: string;
    page?: number;
}

export const getUserRootComments = async ({
    username,
    page = 0,
}: GetUserCommentsOptions): Promise<RootComment[]> => {
    const commentsRes = await apiReq({
        path: `/site-api/comments/user/${username}/`,
        params: { page: page + 1 },
        useCrsf: true,
        responseType: 'html',
    });

    if (!commentsRes.success) throw new Error(commentsRes.error);
    if (commentsRes.status === 404) return [];

    return getCommentsFromR2(commentsRes.data);
}

// stubs
export const getUserReplies = async (_: any): Promise<any[]> => [];
export const getUserCommentHighlight = async (_: any): Promise<any> => null;

export const doUsersFetchReplies = () => false;
export const doUsersHighlightComments = () => false;