export type MystuffProject = {
    id: number;
    title: string;
    author: {
        id: number;
        username: string;
        thumbnailUrl: string;
    };
    history: {
        created: Date;
        modified: Date;
        shared?: Date;
    };
    thumbnailUrl: string;
    isPublished: boolean;
    stats: {
        loves: number;
        favorites: number;
        views: number;
        remixes: number;
        comments: number;
    };
}

export type MystuffStudio = {
    id: number;
    title: string;
    author: {
        id: number;
        username: string;
        thumbnailUrl: string;
    };
    history: {
        created: Date;
        modified: Date;
    };
    thumbnailUrl: string;
    stats: {
        projects: number;
        comments: number;
    };
}