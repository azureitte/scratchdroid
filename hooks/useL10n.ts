import { useContext } from 'react';

import { getLanguages } from '@/util/l10n';
import { L10nContext } from '@/context/L10nContext';

export const useL10n = () => {
    const { messages, locale, setLocale } = useContext(L10nContext);

    const languages = getLanguages();

    return {
        messages,
        locale,
        setLocale,
        languages,
    }
}