export type ScratchProject = {
    id: number;
    title: string;
    author: {
        id: number;
        username: string;
        scratchteam: boolean;
        history: {
            joined: string;
        };
        profile: {
            id: number|null;
            images: {
                "32x32": string;
                "50x50": string;
                "55x55": string;
                "60x60": string;
                "90x90": string;
            };
        }
    },
    instructions: string;
    description: string;
    image: string;
    images: {
        "100x80": string;
        "135x102": string;
        "144x108": string;
        "200x200": string;
        "216x163": string;
        "282x218": string;
    },
    visibility: "visible";
    history: {
        created: string;
        modified: string;
        shared: string;
    };
    public: boolean;
    is_published: boolean;
    remix: {
        parent: number|null;
        root: number|null;
    };
    stats: {
        loves: number;
        favorites: number;
        views: number;
        remixes: number;
    },
    comments_allowed?: boolean;
    project_token: string;
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