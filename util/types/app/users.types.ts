import type { ScratchUser } from "@/util/types/api/user.types";
import type { ScratchProject } from "@/util/types/api/project.types";

export type BannerProject = {
    id: number;
    title: string;
    thumbnail_url: string;
    label: string;
}

export type ProfileProject = {
    id: number;
    title: string;
    author: string;
}
export type ProfileStudio = {
    id: number;
    title: string;
}
export type ProfileClassroom = {
    id: number;
    title: string;
}
export type ProfileUser = {
    id: number;
    username: string;
}

export type UserDataR2 = {
    role: string;
    roleLink: string|null;
    bannerProject: BannerProject|null;

    canFollow: boolean;
    isFollowing: boolean;
    
    favoriteProjects: ProfileProject[];
    studiosFollowing: ProfileStudio[];
    studiosCurating: ProfileStudio[];
    followers: ProfileUser[];
    following: ProfileUser[];
    classrooms: ProfileClassroom[];

    sharedProjectsCount?: number;
    classroomsCount?: number;
}

export type UserQueryData = {
    user: ScratchUser;
    sharedProjects: ScratchProject[];

    role: string;
    roleLink: string|null;
    bannerProject: BannerProject|null;
    favoriteProjects: ProfileProject[];
    studiosFollowing: ProfileStudio[];
    studiosCurating: ProfileStudio[];
    followers: ProfileUser[];
    following: ProfileUser[];
    classrooms: ProfileClassroom[];

    sharedProjectsCount?: number;
    classroomsCount?: number;

    canFollow: boolean;
    isFollowing: boolean;
}