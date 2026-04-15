import React, { createContext, useCallback, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import { messages, updateMessages } from '@/util/l10n';
import { useSettings } from '@/hooks/useSettings';

type L10nContextType = {
    messages: Record<string, string>;
    locale: string;
    setLocale: (locale: string) => void;
}

export const L10nContext = createContext<L10nContextType>({
    messages: {},
    locale: 'en',
    setLocale: () => {},
});

export const L10nProvider = ({ children }: { children: React.ReactNode }) => {

    const [ isLoading, setIsLoading ] = useState(false);
    const { settings: { language: locale }, setSetting } = useSettings();

    const setLocale = useCallback((locale: string) => {
        setSetting('language', locale);
    }, []);

    const loadLocale = useCallback(async (locale: string) => {
        setIsLoading(true);
        await updateMessages(locale);
        setLocale(locale);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadLocale(locale);
    }, [locale]);

    const currentMessages = messages[locale] ?? messages['en'];

    return (
        <L10nContext.Provider value={{
            messages: currentMessages,
            locale,
            setLocale,
        }}>
            <IntlProvider
                locale={locale}
                messages={currentMessages}
            >
                {children}
            </IntlProvider>
        </L10nContext.Provider>
    );
};