export enum CommentType {
    PROJECT = 0,
    USER = 1,
    STUDIO = 2,
}

export enum MembershipLabel {
    NONE = 0,
    MEMBER = 1,
}


export type ScratchMessage =
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

export type ScratchAdminAlert = {
    id: number;
    recipient_id: number;
    message: string;
    datetime_created: string;
    datetime_read: string|null;
}


type MessageBase = {
    id: number;
    datetime_created: string;
    actor_username: string;
    actor_membership_label: MembershipLabel,
    actor_id: number;
}
type MessageFollowUser = MessageBase & {
    type: "followuser";
}
type MessageLoveProject = MessageBase & {
    type: "loveproject";
    project_id: number;
    title: string;
}
type MessageFavoriteProject = MessageBase & {
    type: "favoriteproject";
    project_id: number;
    title: string;
}
type MessageAddComment = MessageBase & {
    type: "addcomment";
    comment_id: number;
    comment_fragment: string;
    comment_type: CommentType;
    commentee_username?: string;
    comment_obj_title: string;
    comment_obj_id: number;
}
type MessageCuratorInvite = MessageBase & {
    type: "curatorinvite";
    gallery_id: number;
    title: string;
}
type MessageRemixProject = MessageBase & {
    type: "remixproject";
    project_id: number;
    title: string;
    parent_id: number;
    parent_title: string;
}
type MessageStudioActivity = MessageBase & {
    type: "studioactivity";
    gallery_id: number;
    title: string;
}
type MessageForumPost = MessageBase & {
    type: "forumpost";
    topic_id: number;
    topic_title: string;
}
type MessageBecomeManagerStudio = MessageBase & {
    type: "becomeownerstudio";
    gallery_id: number;
    gallery_title: string;
}
type MessageBecomeHostStudio = MessageBase & {
    type: "becomehoststudio";
    admin_actor?: boolean;
    gallery_id: number;
    gallery_title: string;
}
type MessageUserJoin = MessageBase & {
    type: "userjoin";
}