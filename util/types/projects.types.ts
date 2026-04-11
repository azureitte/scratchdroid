export type Project = {
    id: number;
    title: string;
    author: {
        id: number;
        username: string;
        isAdmin: boolean;
        joined: Date;
        images: {
            tiny: string;
            small: string;
            medium: string;
            large: string;
            huge: string;
        };
    };

    instructions: string;
    description: string;

    image: string;
    images: {
        tiny: string;
        small: string;
        medium: string;
        square: string;
        large: string;
        huge: string;
    };
    history: {
        created: Date;
        modified: Date;
        shared: Date;
    };
    isPublished: boolean;
    
    remix: {
        parent: number|null;
        root: number|null;
    };

    stats: {
        loves: number;
        favorites: number;
        views: number;
        remixes: number;
    };

    canComment: boolean;
    token: string;
}

export type ProjectQueryData = {
    project: Project;

    remixes: Project[];
    studios: any[];

    lovedByMe: boolean;
    favedByMe: boolean;
    file: ScratchProjectFile|null;
}

export type ScratchProjectFile = {
    extensions: ScratchExtension[];
    meta: {
        semver: string;
        vm: string;
        agent: string;
    };
    targets: any[];
    monitors: any[];
}

export type ScratchExtension = 
    | 'text2speech'
    | 'videoSensing'
    | 'pen'
    | 'music'
    | 'translate'
    | 'makeymakey'
    | 'microbit'
    | 'gdxfor'
    | 'ev3'
    | 'wedo2'
    | 'faceSensing';