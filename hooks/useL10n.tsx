import { useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { getLanguages } from '@/util/l10n';
import { L10nContext } from '@/context/L10nContext';

export const useL10n = () => {

    const { messages, locale, setLocale } = useContext(L10nContext);
    const languages = getLanguages();
    const intl = useIntl();

    const t = (id: string) => intl.formatMessage({ id });

    return {
        messages,
        locale,
        setLocale,
        languages,
        t,
    }
}