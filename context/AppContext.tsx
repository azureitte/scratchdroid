import React, { createContext, useEffect, useState } from 'react';

type AppPrimaryColor =
    | 'regular'
    | 'explore';

export type AppTabKey =
    | 'home'
    | 'explore'
    | 'messages'
    | 'mystuff';

type AppContextType = {
    headerVisible: boolean;
    footerVisible: boolean;
    setHeaderVisible: (visible: boolean) => void;
    setFooterVisible: (visible: boolean) => void;

    primaryColor: AppPrimaryColor;
    setPrimaryColor: (color: AppPrimaryColor) => void;

    currentTab: AppTabKey;
    setCurrentTab: (tab: AppTabKey) => void;
};

export const AppContext = createContext<AppContextType>({
    headerVisible: false,
    footerVisible: false,
    setHeaderVisible: () => {},
    setFooterVisible: () => {},

    primaryColor: 'regular',
    setPrimaryColor: () => {},

    currentTab: 'home',
    setCurrentTab: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [ headerVisible, setHeaderVisible ] = useState(false);
    const [ footerVisible, setFooterVisible ] = useState(false);
    const [ primaryColor, setPrimaryColor ] = useState<AppPrimaryColor>('regular');

    const [ currentTab, setCurrentTab ] = useState<AppTabKey>('home');

    return (
        <AppContext.Provider value={{
            headerVisible,
            footerVisible,
            setHeaderVisible,
            setFooterVisible,

            primaryColor,
            setPrimaryColor,

            currentTab,
            setCurrentTab,
        }}>
            {children}
        </AppContext.Provider>
    );
};