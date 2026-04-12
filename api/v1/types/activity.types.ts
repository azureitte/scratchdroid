export type ScratchFollowingActivity =
    | ScratchActivityFollowUser
    | ScratchActivityFollowStudio
    | ScratchActivityShareProject
    | ScratchActivityLoveProject
    | ScratchActivityFavoriteProject
    | ScratchActivityRemixProject
    | ScratchActivityBecomeCurator
    | ScratchActivityBecomeManager;

type ScratchActivityUnitBase = {
    id: number;
    datetime_created: string;
    actor_id: number;
    actor_username: string;
}

type ScratchActivityFollowUser = ScratchActivityUnitBase & {
    type: 'followuser';
    followed_id: number;
    followed_username: string;
}
type ScratchActivityFollowStudio = ScratchActivityUnitBase & {
    type: 'followstudio';
    gallery_id: number;
    title: string;
}
type ScratchActivityShareProject = ScratchActivityUnitBase & {
    type: 'shareproject';
    project_id: number;
    title: string;
}
type ScratchActivityLoveProject = ScratchActivityUnitBase & {
    type: 'loveproject';
    project_id: number;
    title: string;
}
type ScratchActivityFavoriteProject = ScratchActivityUnitBase & {
    type: 'favoriteproject';
    project_id: number;
    project_title: string;
}
type ScratchActivityRemixProject = ScratchActivityUnitBase & {
    type: 'remixproject';
    project_id: number;
    title: string;
    parent_id: number;
    parent_title: string;
}
type ScratchActivityBecomeCurator = ScratchActivityUnitBase & {
    type: 'becomecurator';
    gallery_id: number;
    title: string;
}
type ScratchActivityBecomeManager = ScratchActivityUnitBase & {
    type: 'becomeownerstudio';
    gallery_id: number;
    gallery_title: string;
}