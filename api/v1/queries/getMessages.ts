import { apiReq } from "../request";
import { MembershipLabel, ScratchCommentType, ScratchMessage } from "../types/message.types";
import { stringToCommentContent } from "../parsers/comments";
import { MessageQueryItem } from "@/util/types/messages.types";
import { Session } from "@/util/types/accounts.types";
import { Message, MessageBase, MessageType } from "@/util/types/messages.types";

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
    return messagesRes.data.map(m => {
        const base: MessageBase = {
            id: m.id,
            date: new Date(m.datetime_created),
            actor: {
                id: m.actor_id,
                username: m.actor_username,
                member: m.actor_membership_label === MembershipLabel.MEMBER,
            },
        }

        const message: Message =
            m.type === 'followuser' ? {
                ...base,
                type: MessageType.FOLLOW_USER,
            } :
            m.type === 'loveproject' ? {
                ...base,
                type: MessageType.LOVE_PROJECT,
                project: {
                    id: m.project_id,
                    title: m.title,
                },
            } :
            m.type === 'favoriteproject' ? {
                ...base,
                type: MessageType.FAVORITE_PROJECT,
                project: {
                    id: m.project_id,
                    title: m.project_title,
                },
            } :
            m.type === 'addcomment' ? {
                ...base,
                type: MessageType.ADD_COMMENT,
                comment: {
                    id: m.comment_id,
                    content: stringToCommentContent(m.comment_fragment),
                    type: 
                        m.comment_type === ScratchCommentType.PROJECT ? 'project' :
                        m.comment_type === ScratchCommentType.USER ? 'user' :
                        'studio',
                },
                commentee: m.commentee_username ? {
                    username: m.commentee_username,
                } : undefined,
                object: {
                    id: m.comment_obj_id,
                    title: m.comment_obj_title,
                },
            } :
            m.type === 'curatorinvite' ? {
                ...base,
                type: MessageType.CURATOR_INVITE,
                studio: {
                    id: m.gallery_id,
                    title: m.title,
                },
            } :
            m.type === 'remixproject' ? {
                ...base,
                type: MessageType.REMIX_PROJECT,
                project: {
                    id: m.project_id,
                    title: m.title,
                },
                parent: {
                    id: m.parent_id,
                    title: m.parent_title,
                },
            } :
            m.type === 'studioactivity' ? {
                ...base,
                type: MessageType.STUDIO_ACTIVITY,
                studio: {
                    id: m.gallery_id,
                    title: m.title,
                },
            } :
            m.type === 'forumpost' ? {
                ...base,
                type: MessageType.FORUM_POST,
                topic: {
                    id: m.topic_id,
                    title: m.topic_title,
                },
            } :
            m.type === 'becomeownerstudio' ? {
                ...base,
                type: MessageType.BECOME_MANAGER_STUDIO,
                studio: {
                    id: m.gallery_id,
                    title: m.gallery_title,
                },
            } :
            m.type === 'becomehoststudio' ? {
                ...base,
                type: MessageType.BECOME_HOST_STUDIO,
                actorIsAdmin: m.admin_actor,
                studio: {
                    id: m.gallery_id,
                    title: m.gallery_title,
                },
            } :
            {
                ...base,
                type: MessageType.USER_JOIN,
            };

        return { 
            type: 'message',
            message, 
        }
    });
}

export const getMessagesPerPage = () => MESSAGES_PER_PAGE;