import { Session } from "@/util/types/accounts.types";
import { Studio, StudioQueryData } from "@/util/types/studios.types";
import { apiReq } from "../request";
import { ScratchStudio, ScratchUserToStudioRelation } from "../types/studio.types";
import { API_MODERN_ENDPOINT } from "../constants";

const fetchStudio = async (id: number, session?: Session): Promise<ScratchStudio> => {
    const studioRes = await apiReq<ScratchStudio>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/studios/${id}`,
        auth: session?.user?.token,
        responseType: 'json',
    });
    if (!studioRes.success) throw new Error(studioRes.error);

    return studioRes.data;
};

const fetchMyRelationToStudio = async (id: number, session?: Session): Promise<ScratchUserToStudioRelation> => {
    if (!session?.user?.username) return {
        manager: false,
        curator: false,
        invited: false,
        following: false,
    };

    const relationRes = await apiReq<ScratchUserToStudioRelation>({
        endpoint: API_MODERN_ENDPOINT,
        path: `/studios/${id}/users/${session.user.username}`,
        responseType: 'json',
    });
    if (!relationRes.success)
        throw new Error(relationRes.error);

    return relationRes.data;
};

type GetStudioProps = {
    id: number;
    session?: Session;
}

export const getStudio = async ({
    id,
    session,
}: GetStudioProps): Promise<StudioQueryData> => {
    const [ studio, relation ] = await Promise.all([
        fetchStudio(id, session),
        fetchMyRelationToStudio(id, session),
    ]);
    return serializeStudio(studio, relation, session);
}

export const serializeStudio = (studioData: ScratchStudio, relationData: ScratchUserToStudioRelation, session?: Session): StudioQueryData => {

    const permissions = {
        owner: studioData.host === session?.user?.id,
        manager: relationData.manager,
        curator: relationData.curator || relationData.manager,
        invited: relationData.invited,
    };

    const isFollowing = relationData.following;

    const canAddProjects = 
        studioData.open_to_all || 
        permissions.curator || 
        permissions.manager;
    
    const studio: Studio = {
        id: studioData.id,
        title: studioData.title,
        description: studioData.description,
        isPublished: studioData.public,
        image: studioData.image,
        history: {
            created: new Date(studioData.history.created),
            modified: new Date(studioData.history.modified),
        },
        stats: {
            comments: studioData.stats.comments,
            projects: studioData.stats.projects,
            followers: studioData.stats.followers,
            managers: studioData.stats.managers,
        },
        canAddProjects,
        canComment: studioData.comments_allowed,
    }

    return {
        studio,
        permissions,
        isFollowing,
    }
};