import { apiReq } from "../request";
import { ScratchAdminAlert } from "../types/message.types";
import { AdminAlert, MessageQueryItem } from "@/util/types/messages.types";
import { Session } from "@/util/types/accounts.types";
import { API_MODERN_ENDPOINT } from "../constants";

export const getAdminAlerts = async (session: Session): Promise<MessageQueryItem[]> => {
    if (!session.user) return [];
    const messagesRes = await apiReq<ScratchAdminAlert[]>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/users/${session.user.username}/messages/admin`,
        auth: session.user.token,
        responseType: 'json',
    });
    if (!messagesRes.success) throw new Error(messagesRes.error);
    return messagesRes.data.map(m => {
        const message: AdminAlert = {
            id: m.id,
            message: m.message,
            date: new Date(m.datetime_created),
        }
        return { 
            type: 'adminAlert', 
            message, 
        };
    });
}