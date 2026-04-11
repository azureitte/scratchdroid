export type BannerProject = {
    id: number;
    title: string;
    thumbnail_url: string;
    label: string;
}

export type CarouselProject = {
    id: number;
    title: string;
    author: string;
    views?: number;
    loves?: number;
}
export type CarouselStudio = {
    id: number;
    title: string;
}
export type ProfileClassroom = {
    id: number;
    title: string;
}
export type CarouselUser = {
    id: number;
    username: string;
}

export type UserDataR2 = {
    role: string;
    roleLink: string|null;
    bannerProject: BannerProject|null;

    canComment: boolean;
    canFollow: boolean;
    isFollowing: boolean;
    
    favoriteProjects: CarouselProject[];
    studiosFollowing: CarouselStudio[];
    studiosCurating: CarouselStudio[];
    followers: CarouselUser[];
    following: CarouselUser[];
    classrooms: ProfileClassroom[];

    sharedProjectsCount?: number;
    classroomsCount?: number;
}

export type User = {
    id: number;
    username: string;
    joined: Date;
    images: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        huge: string;
    };

    country: string;
    bio: string;
    status: string;
    role: string;
    roleLink: string|null;
    bannerProject: BannerProject|null;
    
    sharedProjects: CarouselProject[];
    favoriteProjects: CarouselProject[];
    studiosFollowing: CarouselStudio[];
    studiosCurating: CarouselStudio[];
    followers: CarouselUser[];
    following: CarouselUser[];
    classrooms: ProfileClassroom[];

    sharedProjectsCount?: number;
    classroomsCount?: number;

    canComment: boolean;
    canFollow: boolean;
    isFollowing: boolean;
}