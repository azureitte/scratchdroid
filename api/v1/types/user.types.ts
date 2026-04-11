export type ScratchUser = {
    id: number;
    username: string;
    scratchteam: boolean;
    history: {
        joined: string;
    };
    profile: {
        id: number;
        images: {
            "32x32": string;
            "50x50": string;
            "55x55": string;
            "60x60": string;
            "90x90": string;
        };
        status: string;
        bio: string;
        country: string;
    };
}