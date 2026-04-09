import type { Cookies } from "@preeternal/react-native-cookie-manager";

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