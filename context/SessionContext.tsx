import React, { createContext, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import CookieManager from '@preeternal/react-native-cookie-manager';

import { apiReq } from '../util/api';
import type { ScratchSession } from '../util/types/api/account.types';
import { addAccount, clearAccounts, getAccountCredentials, updateAccountCookies } from '@/util/accountStorage';
import { WEBSITE_URL } from '@/util/constants';
import { cookieObjToHeaders, cookieObjToStr } from '@/util/functions';
import { useAccountStorage } from '@/hooks/queries/useAccountStorage';

type SessionContextType = 
({
    session: null;
    isLoggedIn: false;
    isLoading: true;
}|{
    session: ScratchSession;
    isLoggedIn: boolean;
    isLoading: false;
})
& {
    login: (username: string, password: string) => Promise<void>;
    switchAccount: (username: string) => Promise<void>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextType>({
    session: null,
    isLoggedIn: false,
    isLoading: true,

    login: async () => {},
    switchAccount: async () => {},
    logout: async () => {},
    logoutAll: async () => {},
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const { refresh } = useAccountStorage();

    const [ session, setSession ] = useState<ScratchSession|null>(null);
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);
    const [ errorPage, setErrorPage ] = useState<number|null>(null);
    const [ isLoading, setIsLoading ] = useState(true);

    const getCookies = useCallback(async () => {
        const cookiesObj = await CookieManager.get(WEBSITE_URL);
        const cookies = cookieObjToHeaders(cookiesObj);
        return cookies;
    }, []);

    useEffect(() => {
        getSession().then(([session, status]) => {
            setIsLoading(false);
            setErrorPage(null);
            
            if (status == '503') {
                setErrorPage(503);
                return;
            }

            if (session) {
                setSession(session);
                setIsLoggedIn(!!session.user);
                return;
            }

            console.log('error!', session, status);
        });
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoading) return;

        if (errorPage === 503) {
            if (pathname !== '/503') router.replace('/503');
        } else if (isLoggedIn) {
            if (pathname !== '/home') router.replace('/home');

            // update cookies
            getCookies().then(async (cookies) => {
                if (session?.user) {
                    updateAccountCookies(session.user.username, cookies);
                    console.log('updated cookies for stored account', session.user.username);
                }
            });
        } else {
            if (pathname !== '/account/login' && pathname !== '/account/switching') {
                router.replace('/account/login');
                setTimeout(() => queryClient.clear(), 100);
            }
        }
    }, [isLoading, isLoggedIn, errorPage]);

    const getSession = useCallback(async (): Promise<[ScratchSession, null]|[null, string]> => {
        const res = await apiReq<ScratchSession>({
            path: '/session',
        });

        if (res.status >= 500) {
            return [null, '503'];
        }
        if (res.success) {
            return [res.data, null];
        }
        return [null, res.error];
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        const response = await apiReq({
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

        const err = (message: string) => {
            setIsLoading(false);
            throw new Error(message);
        }

        if (response.success) {
            const message = response.data?.[0];
            
            if (response.status >= 500) {
                return err('Scratch is currently down for maintenance or unavailable. Please try again later.');
            } else if (message?.success === 1) {
                setIsLoggedIn(true);
                const cookies = await getCookies();
                addAccount({
                    username: message.username,
                    password: password,
                    id: message.id,
                    cookies,
                }).then(() => refresh());
            } else if (message?.redirect) {  
                err('Too many login attempts. Please try again later.');
            } else {
                err(message?.msg);
            }
        } else {
            err('An unknown error occurred.');
        }
    };

    const logoutAll = async () => {
        setIsLoading(true);
        await CookieManager.clearAll();
        clearAccounts().then(() => refresh());
        setIsLoggedIn(false);
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        await CookieManager.clearAll();
        setIsLoggedIn(false);
        setIsLoading(false);
    };

    const switchAccount = async (username: string) => {
        router.replace('/account/switching');

        setIsLoading(true);
        setIsLoggedIn(false);
        const account = await getAccountCredentials(username);
        if (!account) {
            setIsLoading(false);
            return;
        }

        // first, attempt to replace the cookies 
        // with the new csrf token
        // and fetch the session

        let directLoginSuccess = false;
        let newSession: ScratchSession|null = null;

        if (account.cookies) {
            try {
                await CookieManager.clearAll();
                
                for (const cookie of account.cookies) {
                    await CookieManager.setFromResponse(WEBSITE_URL, cookie);
            }
            } catch (e) {
                console.error(e);
            }

            [newSession] = await getSession();
            if (!!newSession?.user && newSession.user.username === username) 
                directLoginSuccess = true;
        }

        if (directLoginSuccess && newSession) {
            setSession(newSession);
            setIsLoggedIn(!!newSession.user);
            setIsLoading(false);
            return;
        }


        // if failed, login manually with username and password
        await login(account.username, account.password);
    }

    return (
        <SessionContext.Provider value={{
            session,
            isLoggedIn,
            isLoading,

            login,
            switchAccount,
            logout,
            logoutAll,
        } as SessionContextType}>
            {children}
        </SessionContext.Provider>
    );
};