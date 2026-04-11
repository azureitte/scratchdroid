import { apiReq } from "../request";
import { Session } from "@/util/types/app/accounts.types";

type LoginOptions = {
    username: string;
    password: string;
}

export const login = async ({
    username,
    password,
}: LoginOptions): Promise<any> => {
    const res = await apiReq({
        path: '/accounts/login/',
        method: 'POST',
        body: {
            username: username,
            password: password,
            useMessages: true,
        },
        responseType: 'json',
        useCrsf: true,
    });

    if (res.success) {
        const message = res.data?.[0];
        
        if (res.status >= 500) {
            throw new Error('503');
        } else if (message?.success === 1) {
            return message;
        } else if (message?.redirect) {  
            throw new Error('Too many login attempts. Please try again later.');
        } else {
            throw new Error(message?.msg);
        }
    }

    throw new Error('An unknown error occurred.');
}