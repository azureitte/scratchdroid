import { apiReq } from "../request";

export const getUnreadCount = async (username: string): Promise<number> => {
    const messageCountRes = await apiReq<{ count: number }>({
        host: 'https://api.scratch.mit.edu',
        path: `/users/${username}/messages/count?meow=${Math.random()}`,
    });
    if (!messageCountRes.success) throw new Error(messageCountRes.error);

    return messageCountRes.data.count;
}