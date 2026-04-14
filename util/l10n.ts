import messagesEn from '@/assets/l10n/en.json';

const L10N_CDN_URL = 'https://cdn.kanava.ucrash.fun/scratchdroid/l10n';

export type LocaleData = Record<string, string>;

export const messages: Record<string, LocaleData> = {
    en: messagesEn,
};

export async function updateMessages(locale: string) {
    if (locale === 'en') return; // English locale is pre-loaded

    const res = await fetch(`${L10N_CDN_URL}/${locale}.json`);
    if (!res.ok) throw new Error('Failed to load locale');
    const data = await res.json();
    messages[locale] = data;
}