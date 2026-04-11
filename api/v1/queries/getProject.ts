import { Session } from "@/util/types/accounts.types";
import { Project, ProjectQueryData } from "@/util/types/projects.types";
import { apiReq } from "../request";
import { ScratchProject, ScratchProjectFile } from "../types/project.types";

const fetchProject = async (id: number, session?: Session): Promise<Project> => {
    const projectRes = await apiReq<ScratchProject>({
        host: 'https://api.scratch.mit.edu',
        path: `/projects/${id}/`,
        auth: session?.user?.token,
        responseType: 'json',
    });
    if (!projectRes.success) throw new Error(projectRes.error);

    return serializeProject(projectRes.data);
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
        return remixesRes.data.map(serializeProject);
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
        fetchProjectFile(id, project?.token),
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

export const serializeProject = (data: ScratchProject): Project => ({
    id: data.id,
    title: data.title,
    author: {
        id: data.author.id,
        username: data.author.username,
        isAdmin: data.author.scratchteam,
        joined: new Date(data.author.history.joined),
        images: {
            tiny: data.author.profile.images['32x32'],
            small: data.author.profile.images['50x50'],
            medium: data.author.profile.images['55x55'],
            large: data.author.profile.images['60x60'],
            huge: data.author.profile.images['90x90'],
        },
    },

    instructions: data.instructions,
    description: data.description,

    image: data.image,
    images: {
        tiny: data.images['100x80'],
        small: data.images['135x102'],
        medium: data.images['144x108'],
        square: data.images['200x200'],
        large: data.images['216x163'],
        huge: data.images['282x218'],
    },
    history: {
        created: new Date(data.history.created),
        modified: new Date(data.history.modified),
        shared: new Date(data.history.shared),
    },
    isPublished: data.is_published,
    
    remix: {
        parent: data.remix.parent,
        root: data.remix.root,
    },

    stats: {
        loves: data.stats.loves,
        favorites: data.stats.favorites,
        views: data.stats.views,
        remixes: data.stats.remixes,
    },

    canComment: data.comments_allowed ?? true,
    token: data.project_token,
});