import { apiReq } from "../request";

export const markMessagesRead = async () => {
    const markRes = await apiReq<number>({
        path: `/site-api/messages/messages-clear/`,
        method: 'POST',
        useCrsf: true,
        responseType: 'json',
    });
    if (!markRes.success) throw new Error(markRes.error);
}