import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { reloadAsync } from 'expo-updates';
import { useQueryClient } from '@tanstack/react-query';
import CookieManager from '@preeternal/react-native-cookie-manager';

import { emit } from '@/util/eventBus';
import { 
    addAccount, 
    clearAccounts, 
    getAccountCredentials, 
    getActiveAccount, 
    setActiveAccount, 
    updateAccountCookies 
} from '@/util/accountStorage';
import type { ErrorSession, Session } from '@/util/types/accounts.types';

import { useAccountStorage } from '@/hooks/queries/useAccountStorage';
import { useApi } from '@/hooks/useApi';

type SessionContextType = 
({
    session: undefined;
    isLoggedIn: false;
    isLoading: true;
}|{
    session: Session;
    isLoggedIn: boolean;
    isLoading: false;
})
& {
    login: (username: string, password: string, silent?: boolean) => Promise<void>;
    switchAccount: (username: string, silent?: boolean) => Promise<void>;
    logout: (silent?: boolean) => Promise<void>;
    logoutAll: () => Promise<void>;
    reportFaultyLogin: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextType>({
    session: undefined,
    isLoggedIn: false,
    isLoading: true,

    login: async () => {},
    switchAccount: async () => {},
    logout: async () => {},
    logoutAll: async () => {},
    reportFaultyLogin: async () => {},
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

    const api = useApi();
    const { refresh } = useAccountStorage();

    const [ session, setSession ] = useState<Session|undefined>(undefined);
    const [ transitionState, setTransitionState ] = useState<TransitionState>('logging-in');

    const isFirstLoad = useRef(true);

    const getCookies = useCallback(async () => {
        return CookieManager.get(api.config.websiteUrl);
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

            const newSession = await api.q.getSession();
            
            if (!newSession.success && newSession.reason === '503') {
                setTransitionState('503');
                return;
            }

            if (newSession.success) {
                setSession(newSession);
                setTransitionState(newSession.user 
                    ? 'logged-in' 
                    : 'logged-out');
                return;
            }

            console.log('error!', newSession.reason);
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

    const handleLoginSuccess = () => {
        setTransitionState('logged-in');
        queryClient.invalidateQueries({ queryKey: ['unread'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }

    const handleLogin = async (username: string, password: string, silent = false) => {
        if (!silent)
            setTransitionState('logging-in');

        const err = (message: string) => {
            if (message !== '503')
                setActiveAccount(null);

            setTransitionState('logged-out')
            throw new Error(message);
        }

        try {
            const message = await api.a.login({ username, password });
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
        } catch (e: any) {
            err(e.message);
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

        if (session?.user) {
            const currentCookies = await getCookies();
            console.log('saving cookies for the current account before leaving...', session.user.username);
            await updateAccountCookies(session.user.username, currentCookies);
        }


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
        let newSession: Session|ErrorSession|undefined;

        if (account.cookies) {
            console.log('Trying replacing cookies directly first...');
            // only override cookies, when the silent flag is false
            if (!silent) {
                try {
                    await CookieManager.clearAll();
                    
                    for (const [name, cookie] of Object.entries(account.cookies)) {
                        await CookieManager.set(api.config.websiteUrl, {
                            name,
                            value: cookie.value,
                            domain: cookie.domain,
                            path: cookie.path ?? '/',
                            secure: cookie.secure,
                            httpOnly: cookie.httpOnly,
                            expires: cookie.expires,
                            version: '1',
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            newSession = await api.q.getSession();
            if (newSession.success && newSession.user?.username === username) 
                directLoginSuccess = true;
        }

        if (directLoginSuccess && newSession?.success) {
            console.log('Success!', newSession.user?.username, username);
            await setActiveAccount(newSession.user?.username ?? null);
            setSession(newSession);
            handleLoginSuccess();
            return;
        }

        
        console.log('Failed. Logging in manually instead...');
        setSession(undefined);


        // if failed, login manually with username and password
        await CookieManager.clearAll();
        await handleLogin(account.username, account.password, true);
    }

    const fixFaultyLogin = async () => {
        console.log("Faulty login reported. Attempting to fix...");
        await CookieManager.clearAll();

        const activeAccount = await getActiveAccount();
        if (!activeAccount) {
            await reloadAsync();
            return;
        }

        const account = await getAccountCredentials(activeAccount);
        if (!account) {
            await reloadAsync();
            return;
        }

        console.log("Logging in manually...");
        await handleLogin(account.username, account.password, true);
    }

    return (
        <SessionContext.Provider value={{
            session,
            isLoggedIn: transitionState === 'logged-in',
            isLoading: 
                transitionState === 'logging-in' || 
                transitionState === 'logging-out' || 
                transitionState === 'switching',

            login: handleLogin,
            switchAccount,
            logout,
            logoutAll,
            reportFaultyLogin: fixFaultyLogin,
        } as SessionContextType}>
            {children}
        </SessionContext.Provider>
    );
};