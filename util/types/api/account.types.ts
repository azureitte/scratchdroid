export type ScratchMystuffItem =
    | ScratchMystuffProjectItem
    | ScratchMystuffStudioItem;
export type ScratchMystuffProjectItem = {
    fields: {
        title: string;
        view_count: number;
        favorite_count: number;
        love_count: number;
        remixers_count: number;
        commenters_count: number;
        datetime_created: string;
        datetime_modified: string;
        datetime_shared: string|null;
        visibility: "visible";
        isPublished: boolean;
        thumbnail: string;
        thumbnail_url: string;
        uncached_thumbnail_url: string;
        creator: {
            username: string;
            pk: number;
            thumbnail_url: string;
            admin: boolean;
        };
    };
    model: 'projects.project';
    pk: number;
}
export type ScratchMystuffStudioItem = {
    fields: {
        title: string;
        curators_count: number;
        projecters_count: number;
        commenters_count: number;
        datetime_created: string;
        datetime_modified: string;
        thumbnail_url: string;
        owner: {
            username: string;
            pk: number;
            thumbnail_url: string;
            admin: boolean;
        };
    };
    model: 'galleries.gallery';
    pk: number;
}