import React, { createContext, useState } from 'react';

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
};

export const AppContext = createContext<AppContextType>({
    headerVisible: false,
    footerVisible: false,
    setHeaderVisible: () => {},
    setFooterVisible: () => {},

    primaryColor: 'regular',
    setPrimaryColor: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [ headerVisible, setHeaderVisible ] = useState(false);
    const [ footerVisible, setFooterVisible ] = useState(false);
    const [ primaryColor, setPrimaryColor ] = useState<AppPrimaryColor>('regular');

    return (
        <AppContext.Provider value={{
            headerVisible,
            footerVisible,
            setHeaderVisible,
            setFooterVisible,

            primaryColor,
            setPrimaryColor,
        }}>
            {children}
        </AppContext.Provider>
    );
};