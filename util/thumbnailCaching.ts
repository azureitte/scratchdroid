import { addPrefixUrl } from "./functions";

type UserThumbnailCache = {
    id?: number;
    cacheValue: number; // randomly generated number, appended to the end of the url to prevent caching
}

const userCacheTable: Map<string, UserThumbnailCache> = new Map();

export function cacheForUser (username: string, id?: number) {
    if (!userCacheTable.has(username)) {
        const cacheValue = Math.random();
        userCacheTable.set(username, { id, cacheValue });
    }
    return userCacheTable.get(username)?.cacheValue ?? 0;
}

export function refreshCacheForUser (username: string) {
    console.log('refreshing cache for', username);
    userCacheTable.delete(username);
}

export const $u = (url: string, username: string, id?: number, ..._: any[]) => addPrefixUrl(url.includes('?')
    ? `${url}&meow=${cacheForUser(username, id)}`
    : `${url}?meow=${cacheForUser(username, id)}`);