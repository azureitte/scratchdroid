import { apiReq } from "../request";
import { ScratchMystuffItem } from "../types/account.types";

const PROJECTS_PER_PAGE = 40;
const STUDIOS_PER_PAGE = 40;

type GetMystuffOptions = {
    type: 'projects';
    subtype: 'all'|'public'|'private'|'trash';
    ascsort?: 'title';
    descsort?: 'title'|'views'|'remixes'|'loves';
    page?: number;
}|{
    type: 'studios';
    subtype: 'all'|'owned'|'curated';
    ascsort?: 'title';
    descsort?: 'title'|'projects';
    page?: number;
};

const TO_R2: Record<string, string> = {
    'all': 'all',
    'public': 'shared',
    'private': 'notshared',
    'trash': 'trashed',
    'owned': 'owned',
    'curated': 'curated',
    'title': 'title',
    'views': 'view_count',
    'remixes': 'remixers_count',
    'loves': 'love_count',
    'projects': 'projecters_count',
}

export const toR2 = (str?: string) => {
    if (!str) return undefined;
    return TO_R2[str];
}

export const getMystuff = async ({
    type,
    subtype,
    ascsort,
    descsort,
    page = 0,
}: GetMystuffOptions): Promise<ScratchMystuffItem[]> => {
    if (!page) return [];

    const path = '/site-api/'
        + (type === 'projects' ? 'projects' : 'galleries') + '/'
        + toR2(subtype) + '/';

    const mystuffRes = await apiReq<ScratchMystuffItem[]>({
        path: path,
        params: { 
            page: page + 1,
            ascsort: toR2(ascsort) ?? '',
            descsort: toR2(descsort) ?? '',
        },
        useCrsf: true,
        responseType: 'json',
    });

    if (!mystuffRes.success) throw new Error(mystuffRes.error);
    if (mystuffRes.status === 404) return [];

    return mystuffRes.data;
}

export const getMystuffItemsPerPage = (
    type: 'projects'|'studios',
) => type === 'projects' 
    ? PROJECTS_PER_PAGE 
    : STUDIOS_PER_PAGE;