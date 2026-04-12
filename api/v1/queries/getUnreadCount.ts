import { API_MODERN_ENDPOINT } from "../constants";
import { apiReq } from "../request";

export const getUnreadCount = async (username: string): Promise<number> => {
    const messageCountRes = await apiReq<{ count: number }>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${username}/messages/count?meow=${Math.random()}`,
    });
    if (!messageCountRes.success) throw new Error(messageCountRes.error);

    return messageCountRes.data.count;
}