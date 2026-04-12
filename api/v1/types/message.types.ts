export enum ScratchCommentType {
    PROJECT = 0,
    USER = 1,
    STUDIO = 2,
}

export enum MembershipLabel {
    NONE = 0,
    MEMBER = 1,
}


export type ScratchMessage =
    | ScratchMessageFollowUser
    | ScratchMessageLoveProject
    | ScratchMessageFavoriteProject
    | ScratchMessageAddComment
    | ScratchMessageCuratorInvite
    | ScratchMessageRemixProject
    | ScratchMessageStudioActivity
    | ScratchMessageForumPost
    | ScratchMessageBecomeManagerStudio
    | ScratchMessageBecomeHostStudio
    | ScratchMessageUserJoin;

export type ScratchAdminAlert = {
    id: number;
    recipient_id: number;
    message: string;
    datetime_created: string;
    datetime_read: string|null;
}


type ScratchMessageBase = {
    id: number;
    datetime_created: string;
    actor_username: string;
    actor_membership_label: MembershipLabel,
    actor_id: number;
}
type ScratchMessageFollowUser = ScratchMessageBase & {
    type: "followuser";
}
type ScratchMessageLoveProject = ScratchMessageBase & {
    type: "loveproject";
    project_id: number;
    title: string;
}
type ScratchMessageFavoriteProject = ScratchMessageBase & {
    type: "favoriteproject";
    project_id: number;
    project_title: string;
}
type ScratchMessageAddComment = ScratchMessageBase & {
    type: "addcomment";
    comment_id: number;
    comment_fragment: string;
    comment_type: ScratchCommentType;
    commentee_username?: string;
    comment_obj_title: string;
    comment_obj_id: number;
}
type ScratchMessageCuratorInvite = ScratchMessageBase & {
    type: "curatorinvite";
    gallery_id: number;
    title: string;
}
type ScratchMessageRemixProject = ScratchMessageBase & {
    type: "remixproject";
    project_id: number;
    title: string;
    parent_id: number;
    parent_title: string;
}
type ScratchMessageStudioActivity = ScratchMessageBase & {
    type: "studioactivity";
    gallery_id: number;
    title: string;
}
type ScratchMessageForumPost = ScratchMessageBase & {
    type: "forumpost";
    topic_id: number;
    topic_title: string;
}
type ScratchMessageBecomeManagerStudio = ScratchMessageBase & {
    type: "becomeownerstudio";
    gallery_id: number;
    gallery_title: string;
}
type ScratchMessageBecomeHostStudio = ScratchMessageBase & {
    type: "becomehoststudio";
    admin_actor?: boolean;
    gallery_id: number;
    gallery_title: string;
}
type ScratchMessageUserJoin = ScratchMessageBase & {
    type: "userjoin";
}