import type { ScratchAdminAlert, ScratchMessage } from "@/util/types/api/message.types";
import type { ScratchProject, ScratchProjectFile } from "@/util/types/api/project.types";
import type { ScratchUser } from "@/util/types/api/user.types";

export type MessageQueryItem = ({
    type: 'message';
    message: ScratchMessage;
} | {
    type: 'adminAlert';
    message: ScratchAdminAlert;
})

export type UserQueryData = {
    user: ScratchUser;
    bannerProject: BannerProject|null;
    sharedProjects: ScratchProject[];
    favoriteProjects: ScratchProject[];
    followers: ScratchUser[];
    following: ScratchUser[];
}

export type ProjectQueryData = {
    project: ScratchProject;
    remixes: ScratchProject[];
    studios: any[];
    file: ScratchProjectFile|null;
}


export type BannerProject = {
    id: number;
    title: string;
    thumbnail_url: string;
    label: string;
}