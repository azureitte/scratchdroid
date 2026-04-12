import { Session } from "@/util/types/accounts.types";
import { apiReq } from "../request";
import { API_MODERN_ENDPOINT } from "../constants";
import { ActivityType, ActivityUnit } from "@/util/types/activity.types";
import { ScratchFollowingActivity } from "../types/activity.types";

export const getFollowingActivity = async (session: Session, from = 0, limit = 4): Promise<ActivityUnit[]> => {
    if (!session.user) return [];

    const res = await apiReq<ScratchFollowingActivity[]>({
        endpoint: API_MODERN_ENDPOINT,
        path: '/users/' + session.user.username + '/following/users/activity',
        params: { offset: from, limit },
        auth: session.user.token,
        responseType: 'json',
    });
    if (!res.success) throw new Error(res.error);
    return res.data.map(serializeActivityUnit);
}

const serializeActivityUnit = (unit: ScratchFollowingActivity): ActivityUnit => {
    switch (unit.type) {
        case 'followuser': return {
            type: ActivityType.FOLLOW_USER,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            followee: {
                id: unit.followed_id,
                username: unit.followed_username,
            },
        }
        case 'followstudio': return {
            type: ActivityType.FOLLOW_STUDIO,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            studio: {
                id: unit.gallery_id,
                title: unit.title,
            },
        }
        case 'shareproject': return {
            type: ActivityType.SHARE_PROJECT,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            project: {
                id: unit.project_id,
                title: unit.title,
            },
        }
        case 'loveproject': return {
            type: ActivityType.LOVE_PROJECT,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            project: {
                id: unit.project_id,
                title: unit.title,
            },
        }
        case 'favoriteproject': return {
            type: ActivityType.FAVORITE_PROJECT,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            project: {
                id: unit.project_id,
                title: unit.project_title,
            },
        }
        case 'remixproject': return {
            type: ActivityType.REMIX_PROJECT,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            project: {
                id: unit.project_id,
                title: unit.title,
            },
            parent: {
                id: unit.parent_id,
                title: unit.parent_title,
            },
        }
        case 'becomecurator': return {
            type: ActivityType.BECOME_CURATOR,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            studio: {
                id: unit.gallery_id,
                title: unit.title,
            },
        }
        case 'becomeownerstudio': return {
            type: ActivityType.BECOME_MANAGER,
            id: unit.id,
            date: new Date(unit.datetime_created),
            actor: {
                id: unit.actor_id,
                username: unit.actor_username,
            },
            studio: {
                id: unit.gallery_id,
                title: unit.gallery_title,
            },
        }
    }
}