export type FeaturedProject = {
    type: 'project';
    id: number;
    title: string;
    creator: string;
    creator_id: number;
    thumbnail_url: string;
    love_count: number;
}
export type SdsProject = FeaturedProject & {
    gallery_id: number;
    gallery_title: string;
}
export type FeaturedStudio = {
    type: 'gallery';
    id: number;
    thumbnail_url: string;
    title: string;
}

export type FeaturedTab = {
    community_featured_projects: FeaturedProject[];
    community_featured_studios: FeaturedStudio[];
    community_most_loved_projects: FeaturedProject[];
    community_most_remixed_projects: FeaturedProject[];
    community_newest_projects: FeaturedProject[];
    curator_top_projects: FeaturedProject[];
    scratch_design_studio: SdsProject[];
}