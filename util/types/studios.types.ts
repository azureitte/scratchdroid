export type Studio = {
    id: number;
    title: string;
    description: string;
    isPublished: boolean;
    image: string;
    history: {
        created: Date;
        modified: Date;
    };
    stats: {
        comments: number;
        projects: number;
        followers: number;
        managers: number;
    };
    canAddProjects: boolean;
    canComment: boolean;
}

export type StudioQueryData = {
    studio: Studio;
    permissions: StudioPermissions;
    isFollowing: boolean;
}

export type StudioPermissions = {
    owner: boolean;
    manager: boolean;
    curator: boolean;
    invited: boolean;
}