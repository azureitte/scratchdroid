export type StoredAccount = {
    username: string;
    id: number;
    password: string;
    cookies?: string[];
}

export type StoredPublicAccount = {
    username: string;
    id: number;
    cookies?: string[];
}