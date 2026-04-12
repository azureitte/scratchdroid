import { RootComment } from "@/util/types/comments.types";
import { apiReq } from "../request";
import { getCommentsFromR2 } from "../parsers/comments";
import { Session } from "@/util/types/accounts.types";
import { API_LEGACY_ENDPOINT } from "../constants";

type GetUserCommentsOptions = {
    username: string;
    page?: number;

    session?: Session;
    userMap?: Map<number, string>;
    updateUserMap?: (id: number, username: string) => void;
}

export const getUserRootComments = async ({
    username,
    page = 0,
    session,
    userMap,
    updateUserMap,
}: GetUserCommentsOptions): Promise<RootComment[]> => {
    const commentsRes = await apiReq({
        endpoint: API_LEGACY_ENDPOINT,
        path: `/comments/user/${username}/`,
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

export const getUserCommentFlags = () => ({
    highlightsComments: false,
    fetchesReplies: false,
    usesUserMap: false,
    isOptimistic: true,
    minItemsOnPage: 1,
});