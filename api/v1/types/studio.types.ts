export type ScratchStudio = {
    id: number;
    title: string;
    host: number;
    description: string;
    visibility: 'visible';
    public: boolean;
    open_to_all: boolean;
    comments_allowed: boolean;
    image: string;
    history: {
        created: string;
        modified: string;
    };
    stats: {
        comments: number;
        followers: number;
        managers: number;
        projects: number;
    };
};

export type ScratchUserToStudioRelation = {
    manager: boolean;
    curator: boolean;
    invited: boolean;
    following: boolean;
};