import { apiReq } from "../request";
import { ScratchMessage } from "../types/message.types";
import { MessageQueryItem } from "@/util/types/app/query.types";
import { Session } from "@/util/types/app/accounts.types";

const MESSAGES_PER_PAGE = 40;

export const getMessages = async (session: Session, page: number = 0): Promise<MessageQueryItem[]> => {
    if (!session.user) return [];
    const messagesRes = await apiReq<ScratchMessage[]>({
        host: 'https://api.scratch.mit.edu',
        path: `/users/${session.user.username}/messages`,
        params: { 
            limit: MESSAGES_PER_PAGE, 
            offset: page * MESSAGES_PER_PAGE 
        },
        auth: session.user.token,
        responseType: 'json',
    });
    if (!messagesRes.success) throw new Error(messagesRes.error);
    return messagesRes.data.map(m => ({ type: 'message', message: m }));
}

export const getMessagesPerPage = () => MESSAGES_PER_PAGE;