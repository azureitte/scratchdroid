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

export type MuteStatus = {
    currentMessageType: string;
    muteExpiresAt: number;
    offenses: {
        messageType: string;
        createdAt: number;
        expiresAt: number;
    }[];
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