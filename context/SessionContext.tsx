import React, { createContext, useContext, useEffect, useState } from 'react';

import type { ScratchSession } from '../util/types';
import { apiReq } from '../util/api';
import CookieManager from '@preeternal/react-native-cookie-manager';

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
    logout: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextType>({
    session: null,
    isLoggedIn: false,
    isLoading: true,

    login: async () => {},
    logout: async () => {},
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const [ session, setSession ] = useState<ScratchSession|null>(null);
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        console.log('Refetch session');
        apiReq<ScratchSession>({
            path: '/session',
        }).then(response => {
            setIsLoading(false);

            if (response.success) {
                console.log('Session updated', response.data);
                setSession(response.data);
                setIsLoggedIn(!!response.data.user);
            }
        });
    }, [isLoggedIn]);

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
            if (response.data?.[0]?.success === 1) {
                setIsLoggedIn(true);
            } else if (response.data?.[0]?.redirect) {  
                err('Too many login attempts. Please try again later.');
            } else {
                err(response.data?.[0]?.msg);
            }
        } else {
            err('An unknown error occurred.');
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await CookieManager.clearAll();
        setIsLoggedIn(false);
    };

    return (
        <SessionContext.Provider value={{
            session,
            isLoggedIn,
            isLoading,

            login,
            logout,
        } as SessionContextType}>
            {children}
        </SessionContext.Provider>
    );
};