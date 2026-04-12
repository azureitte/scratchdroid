import { MystuffProject, MystuffStudio } from "@/util/types/mystuff.types";
import { apiReq } from "../request";
import { ScratchMystuffItem, ScratchMystuffProjectItem, ScratchMystuffStudioItem } from "../types/account.types";
import { API_LEGACY_ENDPOINT } from "../constants";

const PROJECTS_PER_PAGE = 40;
const STUDIOS_PER_PAGE = 40;

type GetMystuffProjectOptions = {
    type: 'projects';
    subtype: 'all'|'public'|'private'|'trash';
    ascsort?: 'title';
    descsort?: 'title'|'views'|'remixes'|'loves';
    page?: number;
}

type GetMyStuffStudioOptions = {
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

export async function getMystuff (opts: GetMystuffProjectOptions): Promise<MystuffProject[]>;
export async function getMystuff (opts: GetMyStuffStudioOptions): Promise<MystuffStudio[]>;
export async function getMystuff ({
    type,
    subtype,
    ascsort,
    descsort,
    page = 0,
}:(GetMystuffProjectOptions|GetMyStuffStudioOptions)): Promise<MystuffProject[]|MystuffStudio[]> {
    const path = '/'
        + (type === 'projects' ? 'projects' : 'galleries') + '/'
        + toR2(subtype) + '/';

    const mystuffRes = await apiReq<ScratchMystuffItem[]>({
        endpoint: API_LEGACY_ENDPOINT,
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

    if (type === 'projects') 
        return mystuffRes.data.map(p => {
            const project = p as ScratchMystuffProjectItem;
            return {
                id: project.pk,
                title: project.fields.title,
                author: {
                    id: project.fields.creator.pk,
                    username: project.fields.creator.username,
                    thumbnailUrl: project.fields.creator.thumbnail_url,
                },
                history: {
                    created: new Date(project.fields.datetime_created),
                    modified: new Date(project.fields.datetime_modified),
                    shared: project.fields.datetime_shared 
                        ? new Date(project.fields.datetime_shared) 
                        : undefined,
                },
                thumbnailUrl: project.fields.uncached_thumbnail_url,
                isPublished: project.fields.isPublished,
                stats: {
                    loves: project.fields.love_count,
                    favorites: project.fields.favorite_count,
                    views: project.fields.view_count,
                    remixes: project.fields.remixers_count,
                    comments: project.fields.commenters_count,
                },
            } as MystuffProject;
        });

    return mystuffRes.data.map(s => {
        const studio = s as ScratchMystuffStudioItem;
        return {
            id: studio.pk,
            title: studio.fields.title,
            author: {
                id: studio.fields.owner.pk,
                username: studio.fields.owner.username,
                thumbnailUrl: studio.fields.owner.thumbnail_url,
            },
            history: {
                created: new Date(studio.fields.datetime_created),
                modified: new Date(studio.fields.datetime_modified),
            },
            thumbnailUrl: studio.fields.thumbnail_url,
            stats: {
                projects: studio.fields.projecters_count,
                comments: studio.fields.commenters_count,
            },
        } as MystuffStudio;
    });
}

export const getMystuffItemsPerPage = (
    type: 'projects'|'studios',
) => type === 'projects' 
    ? PROJECTS_PER_PAGE 
    : STUDIOS_PER_PAGE;