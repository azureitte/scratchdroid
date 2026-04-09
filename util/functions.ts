import { formatDistanceToNow, format } from 'date-fns';

import type { 
    FlattenedComment, 
} from "@/util/types/app/comments.types";
import type { 
    PartialSheetMenuDefinition, 
    SheetMenuDefinition 
} from "@/util/types/app/misc.types";

import type { CommentSectionRef } from "@/components/panels/CommentSection";
import { Cookies } from '@preeternal/react-native-cookie-manager';
import { ScratchSession } from './types/api/account.types';

export function shortDate (date: Date) {
    return format(date, 'MMM d, yyyy');
}

export function shortRelativeDate(date: Date) {
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 10) {
        return "now";
    }

    const units = [
        { limit: 60, div: 1, suffix: "s" },
        { limit: 3600, div: 60, suffix: "m" },
        { limit: 86400, div: 3600, suffix: "h" },
        { limit: 604800, div: 86400, suffix: "d" },
        { limit: 2629800, div: 604800, suffix: "w" },
        { limit: 31557600, div: 2629800, suffix: "mo" },
        { limit: Infinity, div: 31557600, suffix: "y" },
    ];

    for (const u of units) {
        if (diff < u.limit) {
            return Math.floor(diff / u.div) + u.suffix;
        }
    }
}

export function relativeDate (date: Date) {
    let diff = Date.now() - date.getTime();

    if (diff < 10_000) {
        return "just now";
    }

    return formatDistanceToNow(date, { addSuffix: true });
}

export function muteStatusDateToString (expiresAt: number) {
    const futureDate = new Date(expiresAt * 1000);
    return formatDistanceToNow(futureDate, { addSuffix: true });
}

const shortNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
});

export function shortNumber (num: number) {
  return shortNumberFormatter.format(num);
}

export const truncateText = (text: string, maxLength: number, charPerNewLine: number = 60): [string, boolean] => {
    let idx = 0;
    let counter = 0;
    while (idx < text.length && counter < maxLength) {
        if (text[idx] === '\n') {
            counter += charPerNewLine;
        } else {
            counter += 1;
        }
        idx++;
    }
    if (idx >= text.length) return [text, false];
    return [text.slice(0, idx).trimEnd() + '...', true];
}

export const randstr = (len: number) => {
    const soup = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    let str = '';
    for (let i = 0; i < len; i++) {
        str += soup.charAt(Math.floor(Math.random() * soup.length));
    }
    return str;
}

export const addPrefixUrl = (url: string) => {
    if (url.startsWith('https:')) return url;
    return 'https:' + url;
}

export const addOrReplace = (arr: any[], item: any, idx: number) => {
    if (idx < 0) return;
    if (idx >= arr.length)
        arr.push(item);
    else 
        arr[idx] = item;
}

export const scrollCommentSectionToId = (listRef: CommentSectionRef|null|undefined, comments: FlattenedComment[], commentId: number|string) => {
    const comment = comments.find(c => c.id === Number(commentId));
    if (comment) {
        const targetIdx = comments.indexOf(comment);
        setTimeout(() => listRef?.scrollToIndex(targetIdx), 0);
        return true;
    }
    return false;
}

export const buildMenu = (def: PartialSheetMenuDefinition): SheetMenuDefinition => ({
    ...def,
    detents: def.detents ?? ['auto'],
    dismissible: def.dismissible ?? true,
    isDark: def.isDark ?? false,
});

export function uniqueById<T extends { id: number; [key: string]: any }>(arr: T[]): T[] {
    const seen = new Set<number>();

    return arr.filter(item => {
        if (seen.has(item.id))
            return false;
        seen.add(item.id);
        return true;
    });
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function cookieObjToHeaders(cookies: Cookies) {
    const setCookieHeaders = Object.entries(cookies).map(([name, cookie]) => {
        let cookieString = `${name}=${cookie.value}`;

        if (cookie.path) cookieString += `; Path=${cookie.path}`;
        if (cookie.domain) cookieString += `; Domain=${cookie.domain}`;
        if (cookie.expires) cookieString += `; Expires=${cookie.expires}`;
        if (cookie.httpOnly) cookieString += `; HttpOnly`;
        if (cookie.secure) cookieString += `; Secure`;

        return cookieString;
    });

    return setCookieHeaders;
}

export function cookieObjToStr (cookies: Cookies) {
    try {
        return JSON.stringify(cookieObjToHeaders(cookies));
    } catch {
        return '[]';
    }
}

export function cookieObjToRequestHeader (cookies: Cookies) {
    return Object.entries(cookies)
        .map(([name, cookie]) => {
            if (name === 'scratchsessionsid') return `${name}="${cookie.value}"`;
            return `${name}=${cookie.value}`
        })
        .join('; ');
}

export function getRoleNameFromSession (session: ScratchSession) {
    if (!session.permissions) return 'Anonymous';
    if (session.permissions.admin) return 'Scratch Team';
    if (session.permissions.educator) return 'Teacher Account';
    if (session.permissions.educator_invitee) return 'Teacher Account (Pending)';
    if (session.permissions.invited_scratcher) return 'Invited Scratcher';
    if (session.permissions.student) return 'Student';
    if (session.permissions.new_scratcher) return 'New Scratcher';
    return 'Scratcher';
}