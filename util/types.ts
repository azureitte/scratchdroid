export type ScratchSession = {
    flags: {
        accepted_terms_of_service?: boolean;
        confirm_email_banner?: boolean;
        gallery_comments_enabled?: boolean;
        has_active_membership?: boolean;
        has_outstanding_email_confirmation?: boolean;
        must_complete_registration?: boolean;
        must_reset_password?: boolean;
        parental_consent_required?: boolean;
        project_comments_enabled?: boolean;
        show_welcome?: boolean;
        under_consent_age?: boolean;
        unsupported_browser_banner?: boolean;
        userprofile_comments_enabled?: boolean;
        with_parent_email?: boolean;
        everything_is_totally_normal: false;
    };

    permissions?: {
        admin: boolean;
        educator: boolean;
        educator_invitee: boolean;
        invited_scratcher: boolean;
        mute_status?: any;
        new_scratcher: boolean;
        scratcher: boolean;
        social: boolean;
        student: boolean;
    };

    user?: {
        id: number;
        banned: boolean;
        should_vpn: boolean;
        username: string;
        token: string;
        thumbnailUrl: string;
        dateJoined: string;
        email: string;
        birthYear: number;
        birthMonth: number;
        gender: string;
        country: string;
        state?: any;
        membership_avatar_badge?: any;
        membership_label?: any;
    };
};



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


export type MessageBase = {
    id: number;
    datetime_created: string;
    actor_username: string;
    actor_membership_label: MembershipLabel,
    actor_id: number;
}
export type MessageFollowUser = MessageBase & {
    type: "followuser";
}
export type MessageLoveProject = MessageBase & {
    type: "loveproject";
    project_id: number;
    title: string;
}
export type MessageFavoriteProject = MessageBase & {
    type: "favoriteproject";
    project_id: number;
    title: string;
}
export type MessageAddComment = MessageBase & {
    type: "addcomment";
    comment_id: number;
    comment_fragment: string;
    comment_type: CommentType;
    commentee_username?: string;
    comment_obj_title: string;
    comment_obj_id: number;
}
export type MessageCuratorInvite = MessageBase & {
    type: "curatorinvite";
    gallery_id: number;
    title: string;
}
export type MessageRemixProject = MessageBase & {
    type: "remixproject";
    project_id: number;
    title: string;
    parent_id: number;
    parent_title: string;
}
export type MessageStudioActivity = MessageBase & {
    type: "studioactivity";
    gallery_id: number;
    title: string;
}
export type MessageForumPost = MessageBase & {
    type: "forumpost";
    topic_id: number;
    topic_title: string;
}
export type MessageBecomeManagerStudio = MessageBase & {
    type: "becomeownerstudio";
    gallery_id: number;
    gallery_title: string;
}
export type MessageBecomeHostStudio = MessageBase & {
    type: "becomehoststudio";
    admin_actor?: boolean;
    gallery_id: number;
    gallery_title: string;
}
export type MessageUserJoin = MessageBase & {
    type: "userjoin";
}


export type ScratchProject = {
    id: number;
    title: string;
    author: {
        id: number;
        username: string;
        scratchteam: boolean;
        history: {
            joined: string;
        };
        profile: {
            id: number|null;
            images: {
                "32x32": string;
                "50x50": string;
                "55x55": string;
                "60x60": string;
                "90x90": string;
            };
        }
    },
    instructions: string;
    description: string;
    image: string;
    images: {
        "100x80": string;
        "135x102": string;
        "144x108": string;
        "200x200": string;
        "216x163": string;
        "282x218": string;
    },
    visibility: "visible";
    history: {
        created: string;
        modified: string;
        shared: string;
    };
    public: boolean;
    is_published: boolean;
    remix: {
        parent: number|null;
        root: number|null;
    };
    stats: {
        loves: number;
        favorites: number;
        views: number;
        remixes: number;
    }
}

export type ScratchUser = {
    id: number;
    username: string;
    scratchteam: boolean;
    history: {
        joined: string;
    };
    profile: {
        id: number;
        images: {
            "32x32": string;
            "50x50": string;
            "55x55": string;
            "60x60": string;
            "90x90": string;
        };
        status: string;
        bio: string;
        country: string;
    };
}


export type FeaturedProject = {
    type: 'project';
    id: number;
    title: string;
    creator: string;
    creator_id: number;
    thumbnail_url: string;
    love_count: number;
}
export type SdsProject = FeaturedProject & {
    gallery_id: number;
    gallery_title: string;
}
export type FeaturedStudio = {
    type: 'gallery';
    id: number;
    thumbnail_url: string;
    title: string;
}

export type FeaturedTab = {
    community_featured_projects: FeaturedProject[];
    community_featured_studios: FeaturedStudio[];
    community_most_loved_projects: FeaturedProject[];
    community_most_remixed_projects: FeaturedProject[];
    community_newest_projects: FeaturedProject[];
    curator_top_projects: FeaturedProject[];
    scratch_design_studio: SdsProject[];
}

export type BannerProject = {
    id: number;
    title: string;
    thumbnail_url: string;
    label: string;
}


export type ScratchMystuffItem =
    | ScratchMystuffProjectItem
    | ScratchMystuffStudioItem;
export type ScratchMystuffProjectItem = {
    fields: {
        title: string;
        view_count: number;
        favorite_count: number;
        love_count: number;
        remixers_count: number;
        commenters_count: number;
        datetime_created: string;
        datetime_modified: string;
        datetime_shared: string|null;
        visibility: "visible";
        isPublished: boolean;
        thumbnail: string;
        thumbnail_url: string;
        uncached_thumbnail_url: string;
        creator: {
            username: string;
            pk: number;
            thumbnail_url: string;
            admin: boolean;
        };
    };
    model: 'projects.project';
    pk: number;
}
export type ScratchMystuffStudioItem = {
    fields: {
        title: string;
        curators_count: number;
        projecters_count: number;
        commenters_count: number;
        datetime_created: string;
        datetime_modified: string;
        thumbnail_url: string;
        owner: {
            username: string;
            pk: number;
            thumbnail_url: string;
            admin: boolean;
        };
    };
    model: 'galleries.gallery';
    pk: number;
}


export type ScratchComment = {
    id: number;
    content: string;
    author: {
        id: number;
        username: string;
        scratchteam: boolean;
        image: string;
    };
    commentee_id: number|null;
    parent_id: number|null;
    datetime_created: string;
    datetime_modified: string;
    reply_count: number;
    visibility: "visible";
}

export type FlattenedComment = {
    id: number;
    content: string;
    author: {
        id: number|string;
        username: string;
        scratchteam: boolean;
        image: string;
    };
    createdAt: Date;
    modifiedAt: Date;
    isLastInBlock: boolean;  // is the comment the last one in the reply chain
} & ({
    isReply: false;
    parent: null;
    replyTo: null
}|{
    isReply: true;
    parent: number;         // parent comment id
    replyTo: string;        // username to which the reply is targeted
    hasMoreToLoad: boolean; // whether to show the "load more" button
});