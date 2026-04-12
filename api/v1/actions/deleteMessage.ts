import { API_LEGACY_ENDPOINT } from "../constants";
import { apiReq } from "../request";

export const deleteMessage = async (id: number) => {
    const deleteRes = await apiReq<{ success: boolean }>({
        endpoint: API_LEGACY_ENDPOINT,
        path: `/messages/messages-delete/`,
        method: 'POST',
        body: {
            alertId: id,
            alertType: "notification",
        },
        useCrsf: true,
        responseType: 'json',
    });
    if (!deleteRes.success) throw new Error(deleteRes.error);
    if (!deleteRes.data.success) throw new Error('Something went wrong');
}