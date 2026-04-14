import { useContext } from 'react';

import { L10nContext } from '@/context/L10nContext';

export const useL10n = () => {
    const { messages, locale, setLocale } = useContext(L10nContext);
    return {
        messages,
        locale,
        setLocale,
    }
}