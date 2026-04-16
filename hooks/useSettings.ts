import { useCallback, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppSettings } from "@/util/types/app.types";

const DEFAULT_SETTINGS: AppSettings = {
    language: 'en',
    theme: 'dark',

    flag_hasSeenTestersOnboarding: false,
};

export const useSettings = () => {

    const [ settings, setSettings ] = useState<AppSettings>(DEFAULT_SETTINGS);

    const loadSettings = useCallback(async () => {
        const res = await AsyncStorage.getItem('settings');
        console.log('settings', res);
        if (!res) return;
        setSettings(JSON.parse(res));
    }, []);

    const getSetting = (key: keyof AppSettings) => settings[key];

    const setSetting = useCallback((key: keyof AppSettings, value: any) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            AsyncStorage.setItem('settings', JSON.stringify(newSettings))
            return newSettings;
        });
        
    }, [settings]);

    useEffect(() => {
        loadSettings();
    }, []);

    return {
        settings,
        getSetting,
        setSetting,
    }
    
}