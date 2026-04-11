export type ScratchFeaturedProject = {
    type: 'project';
    id: number;
    title: string;
    creator: string;
    creator_id: number;
    thumbnail_url: string;
    love_count: number;
}
export type ScratchSdsProject = ScratchFeaturedProject & {
    gallery_id: number;
    gallery_title: string;
}
export type ScratchFeaturedStudio = {
    type: 'gallery';
    id: number;
    thumbnail_url: string;
    title: string;
}

export type ScratchFeaturedTab = {
    community_featured_projects: ScratchFeaturedProject[];
    community_featured_studios: ScratchFeaturedStudio[];
    community_most_loved_projects: ScratchFeaturedProject[];
    community_most_remixed_projects: ScratchFeaturedProject[];
    community_newest_projects: ScratchFeaturedProject[];
    curator_top_projects: ScratchFeaturedProject[];
    scratch_design_studio: ScratchSdsProject[];
}