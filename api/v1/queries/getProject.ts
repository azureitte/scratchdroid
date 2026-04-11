import { Session } from "@/util/types/app/accounts.types";
import { ProjectQueryData } from "@/util/types/app/query.types";
import { apiReq } from "../request";
import { ScratchProject, ScratchProjectFile } from "../types/project.types";

const fetchProject = async (id: number, session?: Session) => {
    const projectRes = await apiReq<ScratchProject>({
        host: 'https://api.scratch.mit.edu',
        path: `/projects/${id}/`,
        auth: session?.user?.token,
        responseType: 'json',
    });
    if (!projectRes.success) throw new Error(projectRes.error);

    return projectRes.data;
};

const fetchLovedByMe = async (id: number, session?: Session) => {
    if (!session?.user?.username) return false;

    const lovedByMeRes = await apiReq<{ userLove: boolean }>({
        host: 'https://api.scratch.mit.edu',
        path: `/projects/${id}/loves/user/${session.user.username}`,
        responseType: 'json',
    });
    if (lovedByMeRes.success)
        return !!lovedByMeRes.data.userLove;

    return false;
};

const fetchFavedByMe = async (id: number, session?: Session) => {
    if (!session?.user?.username) return false;

    const favedByMeRes = await apiReq<{ userFavorite: boolean }>({
        host: 'https://api.scratch.mit.edu',
        path: `/projects/${id}/favorites/user/${session.user.username}`,
        responseType: 'json',
    });
    if (favedByMeRes.success)
        return !!favedByMeRes.data.userFavorite;

    return false;
};

const fetchRemixes = async (id: number) => {
    const remixesRes = await apiReq<ScratchProject[]>({
        host: 'https://api.scratch.mit.edu',
        path: `/projects/${id}/remixes`,
        params: { limit: 6 },
        responseType: 'json',
    });
    if (remixesRes.success)
        return remixesRes.data;
    return [];
};

const fetchStudios = async (id: number, author: string) => {
    const studiosRes = await apiReq<any>({
        host: 'https://api.scratch.mit.edu',
        path: `/users/${author}/projects/${id}/studios`,
        params: { limit: 6 },
        responseType: 'json',
    });
    if (studiosRes.success)
        return studiosRes.data;
    return [];
};

const fetchProjectFile = async (id: number, token: string) => {
    const projectFileRes = await apiReq<ScratchProjectFile>({
        host: 'https://projects.scratch.mit.edu',
        path: `/${id}`,
        params: { token },
        responseType: 'json',
    });
    if (projectFileRes.success)
        return projectFileRes.data;
    return null;
};

type GetProjectProps = {
    id: number;
    session?: Session;
}

export const getProject = async ({
    id,
    session,
}: GetProjectProps): Promise<ProjectQueryData> => {
    const [ project, lovedByMe, favedByMe, remixes ] = await Promise.all([
        fetchProject(id, session),
        fetchLovedByMe(id, session),
        fetchFavedByMe(id, session),
        fetchRemixes(id),
    ]);
    const [ studios, file ] = await Promise.all([
        fetchStudios(id, project?.author?.username),
        fetchProjectFile(id, project?.project_token),
    ]);
    return {
        project,
        lovedByMe,
        favedByMe,
        remixes,
        studios,
        file,
    }
}