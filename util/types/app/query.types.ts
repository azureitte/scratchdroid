import type { ScratchAdminAlert, ScratchMessage } from "@/util/types/api/message.types";
import type { ScratchProject, ScratchProjectFile } from "@/util/types/api/project.types";

export type MessageQueryItem = ({
    type: 'message';
    message: ScratchMessage;
} | {
    type: 'adminAlert';
    message: ScratchAdminAlert;
})

export type ProjectQueryData = {
    project: ScratchProject;
    lovedByMe: boolean;
    favedByMe: boolean;
    remixes: ScratchProject[];
    studios: any[];
    file: ScratchProjectFile|null;
}
