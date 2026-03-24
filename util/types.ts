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
