import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import CookieManager from '@preeternal/react-native-cookie-manager';

import { WEBSITE_URL } from '@/util/constants';
import { cookieObjToHeaders, sleep } from '@/util/functions';
import { apiReq } from '@/util/api';
import { emit } from '@/util/eventBus';
import { 
    addAccount, 
    clearAccounts, 
    getAccountCredentials, 
    getActiveAccount, 
    setActiveAccount, 
    updateAccountCookies 
} from '@/util/accountStorage';
import type { ScratchSession } from '@/util/types/api/account.types';

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
    login: (username: string, password: string, silent?: boolean) => Promise<void>;
    switchAccount: (username: string, silent?: boolean) => Promise<void>;
    logout: (silent?: boolean) => Promise<void>;
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

type TransitionState =
    | 'logged-out'
    | 'logged-in'
    | 'switching'
    | 'logging-in'
    | 'logging-out'
    | '503';

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const { refresh } = useAccountStorage();

    const [ session, setSession ] = useState<ScratchSession|null>(null);
    const [ transitionState, setTransitionState ] = useState<TransitionState>('logging-in');

    const isFirstLoad = useRef(true);

    const getCookies = useCallback(async () => {
        const cookiesObj = await CookieManager.get(WEBSITE_URL);
        const cookies = cookieObjToHeaders(cookiesObj);
        return cookies;
    }, []);

    useEffect(() => {
        (async () => {
            if (!isFirstLoad.current) {
                if (transitionState === 'logging-in') return;
                if (transitionState === 'logging-out') return;
                if (transitionState === 'switching') return;
                if (transitionState === '503') return;
            }

            if (isFirstLoad.current) {
                isFirstLoad.current = false;
                const activeAccount = await getActiveAccount();
                if (activeAccount) {
                    await switchAccount(activeAccount, true);
                }
            }

            const [session, status] = await getSession();
            
            if (status == '503') {
                setTransitionState('503');
                return;
            }

            if (session) {
                setSession(session);
                setTransitionState(session.user 
                    ? 'logged-in' 
                    : 'logged-out');
                return;
            }

            console.log('error!', session, status);
            setTransitionState('logged-out');
        })();
    }, [transitionState]);

    useEffect(() => {
        if (transitionState === '503') {
            if (pathname !== '/503') router.replace('/503');
        } else if (transitionState === 'logged-in') {
            if (pathname !== '/home') {
                router.replace('/home');
                emit('tab-navigate', 'home');
            }

            // update cookies
            getCookies().then(async (cookies) => {
                if (session?.user) {
                    updateAccountCookies(session.user.username, cookies);
                    console.log('updated cookies for stored account', session.user.username);
                }
            });
        } else if (transitionState === 'switching') {
            if (pathname !== '/account/switching') {
                router.replace('/account/switching');
                setTimeout(() => queryClient.clear(), 100);
            }
        } else if (transitionState === 'logged-out') {
            if (pathname !== '/account/login') {
                router.replace('/account/login');
                setTimeout(() => queryClient.clear(), 100);
            }
        }
    }, [transitionState]);

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

    const handleLoginSuccess = () => {
        setTransitionState('logged-in');
        queryClient.invalidateQueries({ queryKey: ['unread'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }

    const login = async (username: string, password: string, silent = false) => {
        if (!silent)
            setTransitionState('logging-in');

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

        const err = (message: string, shouldClearActiveAccount = true) => {
            if (shouldClearActiveAccount) 
                setActiveAccount(null);

            setTransitionState('logged-out')
            throw new Error(message);
        }

        if (response.success) {
            const message = response.data?.[0];
            
            if (response.status >= 500) {
                return err(
                    'Scratch is currently down for maintenance or unavailable. Please try again later.',
                    false,
                );
            } else if (message?.success === 1) {
                const newUsername = message.username ?? username;
                await setActiveAccount(newUsername);

                const cookies = await getCookies();
                addAccount({
                    username: newUsername,
                    password: password,
                    id: message.id,
                    cookies,
                }).then(() => refresh());

                handleLoginSuccess();
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
        setTransitionState('logging-out');
        await CookieManager.clearAll();
        clearAccounts().then(() => refresh());
        setTransitionState('logged-out');
    };

    const logout = async (silent = false) => {
        setTransitionState('logging-out');
        await CookieManager.clearAll();
        if (!silent) await setActiveAccount(null);
        setTransitionState('logged-out');
    };

    const switchAccount = async (username: string, silent = false) => {
        const prevState = transitionState === 'logged-in' 
            ? 'logged-in' 
            : 'logged-out';

        if (!silent)
            setTransitionState('switching');

        const account = await getAccountCredentials(username);
        if (!account) {
            setTransitionState(prevState);
            return;
        }

        console.log(`Switching to @${username}...`);

        // first, attempt to replace the cookies 
        // with the new csrf token
        // and fetch the session

        let directLoginSuccess = false;
        let newSession: ScratchSession|null = null;

        if (account.cookies) {
            console.log('Trying replacing cookies directly first...');
            // only override cookies, when the silent flag is false
            if (!silent) {
                try {
                    await CookieManager.clearAll();
                    
                    for (const cookie of account.cookies) {
                        await CookieManager.setFromResponse(WEBSITE_URL, cookie);
                }
                } catch (e) {
                    console.error(e);
                }
            }

            [newSession] = await getSession();
            if (!!newSession?.user && newSession.user.username === username) 
                directLoginSuccess = true;
        }

        if (directLoginSuccess && newSession) {
            console.log('Success!', newSession.user?.username, username);
            await setActiveAccount(newSession.user?.username ?? null);
            setSession(newSession);
            handleLoginSuccess();

            // if (!silent) {
            //     await sleep(1000);
            //     console.log('Still logging in just to make sure');
            //     await CookieManager.clearAll();
            //     await login(account.username, account.password, true);
            //     console.log('Done');
            // }
            return;
        }

        
        console.log('Failed. Logging in manually instead...');
        setSession(null);


        // if failed, login manually with username and password
        await CookieManager.clearAll();
        await login(account.username, account.password, true);
    }

    return (
        <SessionContext.Provider value={{
            session,
            isLoggedIn: transitionState === 'logged-in',
            isLoading: 
                transitionState === 'logging-in' || 
                transitionState === 'logging-out' || 
                transitionState === 'switching',

            login,
            switchAccount,
            logout,
            logoutAll,
        } as SessionContextType}>
            {children}
        </SessionContext.Provider>
    );
};