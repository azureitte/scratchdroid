import type { CommentContentNode } from "./comments.types";

export enum MessageType {
    FOLLOW_USER = 'followuser',
    LOVE_PROJECT = 'loveproject',
    FAVORITE_PROJECT = 'favoriteproject',
    ADD_COMMENT = 'addcomment',
    CURATOR_INVITE = 'curatorinvite',
    REMIX_PROJECT = 'remixproject',
    STUDIO_ACTIVITY = 'studioactivity',
    FORUM_POST = 'forumpost',
    BECOME_MANAGER_STUDIO = 'becomeownerstudio',
    BECOME_HOST_STUDIO = 'becomehoststudio',
    USER_JOIN = 'userjoin',
}

export type MessageQueryItem = ({
    type: 'message';
    message: Message;
} | {
    type: 'adminAlert';
    message: AdminAlert;
});

export type Message =
    | MessageFollowUser
    | MessageLoveProject
    | MessageFavoriteProject
    | MessageAddComment
    | MessageCuratorInvite
    | MessageRemixProject
    | MessageStudioActivity
    | MessageForumPost
    | MessageBecomeManagerStudio
    | MessageBecomeHostStudio
    | MessageUserJoin;

export type AdminAlert = {
    id: number;
    message: string;
    date: Date;
}


export type MessageBase = {
    id: number;
    date: Date;
    actor: {
        id: number;
        username: string;
        member: boolean;
    };
}
type MessageFollowUser = MessageBase & {
    type: MessageType.FOLLOW_USER;
}
type MessageLoveProject = MessageBase & {
    type: MessageType.LOVE_PROJECT;
    project: {
        id: number;
        title: string;
    };
}
type MessageFavoriteProject = MessageBase & {
    type: MessageType.FAVORITE_PROJECT;
    project: {
        id: number;
        title: string;
    };
}
type MessageAddComment = MessageBase & {
    type: MessageType.ADD_COMMENT;
    comment: {
        id: number;
        content: CommentContentNode[];
        type: 'project'|'user'|'studio';
    };
    commentee?: {
        username: string;
    };
    object: {
        id: number;
        title: string;
    };
}
type MessageCuratorInvite = MessageBase & {
    type: MessageType.CURATOR_INVITE;
    studio: {
        id: number;
        title: string;
    };
}
type MessageRemixProject = MessageBase & {
    type: MessageType.REMIX_PROJECT;
    project: {
        id: number;
        title: string;
    };
    parent: {
        id: number;
        title: string;
    };
}
type MessageStudioActivity = MessageBase & {
    type: MessageType.STUDIO_ACTIVITY;
    studio: {
        id: number;
        title: string;
    };
}
type MessageForumPost = MessageBase & {
    type: MessageType.FORUM_POST;
    topic: {
        id: number;
        title: string;
    };
}
type MessageBecomeManagerStudio = MessageBase & {
    type: MessageType.BECOME_MANAGER_STUDIO;
    studio: {
        id: number;
        title: string;
    };
}
type MessageBecomeHostStudio = MessageBase & {
    type: MessageType.BECOME_HOST_STUDIO;
    actorIsAdmin?: boolean;
    studio: {
        id: number;
        title: string;
    };
}
type MessageUserJoin = MessageBase & {
    type: MessageType.USER_JOIN;
}