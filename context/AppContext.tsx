import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { checkForUpdateAsync, fetchUpdateAsync, reloadAsync } from 'expo-updates';

import { IS_DEV } from '@/util/constants';

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

    const downloadUpdate = useCallback(async () => {
        await fetchUpdateAsync();
        reloadAsync();
    }, []);

    const checkForUpdates = useCallback(async () => {
        const update = await checkForUpdateAsync();
        if (update.isAvailable) {
            Alert.alert('Updates Available!',
                `A new version of the app is ready. Update now?`,
                [ 
                    { text: "Later", style: "cancel" },
                    { text: "Update", onPress: downloadUpdate },
                ]);
        }
    }, []);

    useEffect(() => {
        if (!IS_DEV) checkForUpdates();
    }, []);

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