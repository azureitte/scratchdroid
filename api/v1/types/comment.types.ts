import type { MuteStatus } from "./account.types";

export type ScratchComment = {
    id: number;
    content: string;
    author: {
        id: number;
        username: string;
        scratchteam: boolean;
        image: string;
    };
    commentee_id: number|null;
    parent_id: number|null;
    datetime_created: string;
    datetime_modified: string;
    reply_count: number;
    visibility: "visible";
}

export type ModernAddCommentResponse = 
    | ScratchComment
    | ModernAddCommentResponseRejected;

export type ModernAddCommentResponseRejected = {
    rejected: string;
    status: {
        mute_status?: MuteStatus;
    }
}