import type { Cookies } from "@preeternal/react-native-cookie-manager";

export type Session = {
    success: true;

    user?: {
        id: number;
        token: string;
        username: string;
        email: string;
        thumbnailUrl: string;
        joined: Date;
        birthYear: number;
        birthMonth: number;
        gender: string;
        country: string;
        state?: string;
        membership?: {
            avatarBadge: any;
            label: string;
        };

        permissions?: {
            admin: boolean;
            educator: boolean;
            educatorInvitee: boolean;
            invitedScratcher: boolean;
            newScratcher: boolean;
            scratcher: boolean;
            social: boolean;
            student: boolean;
        };
        muteStatus?: {
            currentMessageType: string;
            muteExpiresAt: number;
            offenses: {
                messageType: string;
                createdAt: number;
                expiresAt: number;
            }[];
        };
    };

    flags: {
        acceptedTermsOfService: boolean;
        confirmEmailBanner: boolean;
        hasActiveMembership: boolean;
        hasOutstandingEmailConfirmation: boolean;
        mustCompleteRegistration: boolean;
        mustResetPassword: boolean;
        parentalConsentRequired: boolean;
        projectCommentsEnabled: boolean;
        studioCommentsEnabled: boolean;
        showWelcome: boolean;
        underConsentAge: boolean;
        unsupportedBrowserBanner: boolean;
        userprofileCommentsEnabled: boolean;
        withParentEmail: boolean;
        everythingIsTotallyNormal: false;
    }
}

export type ErrorSession = {
    success: false;
    reason: string;
}

export type StoredAccount = {
    username: string;
    id: number;
    password: string;
    cookies?: Cookies;
}

export type StoredPublicAccount = {
    username: string;
    id: number;
    cookies?: Cookies;
}

export type RemoteAccount = {
    username: string;
    id: number;
    unread: number;
}