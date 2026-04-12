import { API_LEGACY_ENDPOINT } from "../constants";
import { apiReq } from "../request";

export const markMessagesRead = async () => {
    const markRes = await apiReq<number>({
        endpoint: API_LEGACY_ENDPOINT,
        path: `/messages/messages-clear/`,
        method: 'POST',
        useCrsf: true,
        responseType: 'json',
    });
    if (!markRes.success) throw new Error(markRes.error);
}