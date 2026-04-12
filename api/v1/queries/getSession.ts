import { ErrorSession, Session } from "@/util/types/accounts.types";
import { apiReq } from "../request";
import { MuteStatus, ScratchSession } from "../types/account.types";

const isMuteStatus = (muteStatus: any) => {
    return muteStatus && typeof muteStatus === 'object' && !!muteStatus.currentMessageType && !!muteStatus.muteExpiresAt;
}

export const getSession = async (): Promise<Session|ErrorSession> => {
    const res = await apiReq<ScratchSession>({
        path: '/session',
    });

    if (res.status >= 500) {
        return {
            success: false,
            reason: '503',
        };
    }

    if (res.success) {
        const data = res.data;

        let session: Session = {
            success: true,
            flags: {
                acceptedTermsOfService: data.flags.accepted_terms_of_service ?? false,
                confirmEmailBanner: data.flags.confirm_email_banner ?? false,
                hasActiveMembership: data.flags.has_active_membership ?? false,
                hasOutstandingEmailConfirmation: data.flags.has_outstanding_email_confirmation ?? false,
                mustCompleteRegistration: data.flags.must_complete_registration ?? false,
                mustResetPassword: data.flags.must_reset_password ?? false,
                parentalConsentRequired: data.flags.parental_consent_required ?? false,
                projectCommentsEnabled: data.flags.project_comments_enabled ?? false,
                studioCommentsEnabled: data.flags.gallery_comments_enabled ?? false,
                showWelcome: data.flags.show_welcome ?? false,
                underConsentAge: data.flags.under_consent_age ?? false,
                unsupportedBrowserBanner: data.flags.unsupported_browser_banner ?? false,
                userprofileCommentsEnabled: data.flags.userprofile_comments_enabled ?? false,
                withParentEmail: data.flags.with_parent_email ?? false,
                everythingIsTotallyNormal: data.flags.everything_is_totally_normal ?? false,
            },
        }

        if (data.user) {
            session.user = {
                id: data.user.id,
                token: data.user.token,
                username: data.user.username,
                email: data.user.email,
                thumbnailUrl: data.user.thumbnailUrl,
                joined: new Date(data.user.dateJoined),
                birthYear: data.user.birthYear,
                birthMonth: data.user.birthMonth,
                gender: data.user.gender,
                country: data.user.country,
                state: data.user.state,
                membership: data.user.membership_avatar_badge,

                permissions: data.permissions && {
                    admin: data.permissions.admin,
                    educator: data.permissions.educator,
                    educatorInvitee: data.permissions.educator_invitee,
                    invitedScratcher: data.permissions.invited_scratcher,
                    newScratcher: data.permissions.new_scratcher,
                    scratcher: data.permissions.scratcher,
                    social: data.permissions.social,
                    student: data.permissions.student,
                },
                muteStatus: isMuteStatus(data.permissions?.mute_status) 
                    ? data.permissions!.mute_status as MuteStatus
                    : undefined,
            };
        }

        return session;
    }

    return {
        success: false,
        reason: res.error,
    };
}