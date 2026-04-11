import { apiReq } from "../request";

export const deleteMessage = async (id: number) => {
    const deleteRes = await apiReq<{ success: boolean }>({
        path: `/site-api/messages/messages-delete/`,
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