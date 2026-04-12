export enum ActivityType {
    FOLLOW_USER = 'followuser',
    FOLLOW_STUDIO = 'followstudio',
    SHARE_PROJECT = 'shareproject',
    LOVE_PROJECT = 'loveproject',
    FAVORITE_PROJECT = 'favoriteproject',
    REMIX_PROJECT = 'remixproject',
    BECOME_CURATOR = 'becomecurator',
    BECOME_MANAGER = 'becomeownerstudio',
    ADD_PROJECT = 'addproject',
    USER_JOIN = 'userjoin',
}

export type ActivityUnit = 
    | ActivityFollowUser
    | ActivityFollowStudio
    | ActivityShareProject
    | ActivityLoveProject
    | ActivityFavoriteProject
    | ActivityRemixProject
    | ActivityBecomeCurator
    | ActivityBecomeManager
    | ActivityAddProject
    | ActivityUserJoin;

type ActivityUnitBase = {
    id: number;
    date: Date;
    actor: {
        id: number;
        username: string;
    };
}

type ActivityFollowUser = ActivityUnitBase & {
    type: ActivityType.FOLLOW_USER;
    followee: {
        id: number;
        username: string;
    };
}
type ActivityFollowStudio = ActivityUnitBase & {
    type: ActivityType.FOLLOW_STUDIO;
    studio: {
        id: number;
        title: string;
    };
}
type ActivityShareProject = ActivityUnitBase & {
    type: ActivityType.SHARE_PROJECT;
    project: {
        id: number;
        title: string;
    };
}
type ActivityLoveProject = ActivityUnitBase & {
    type: ActivityType.LOVE_PROJECT;
    project: {
        id: number;
        title: string;
    };
}
type ActivityFavoriteProject = ActivityUnitBase & {
    type: ActivityType.FAVORITE_PROJECT;
    project: {
        id: number;
        title: string;
    };
}
type ActivityRemixProject = ActivityUnitBase & {
    type: ActivityType.REMIX_PROJECT;
    project: {
        id: number;
        title: string;
    };
    parent: {
        id: number;
        title: string;
    };
}
type ActivityBecomeCurator = ActivityUnitBase & {
    type: ActivityType.BECOME_CURATOR;
    studio: {
        id: number;
        title: string;
    };
}
type ActivityBecomeManager = ActivityUnitBase & {
    type: ActivityType.BECOME_MANAGER;
    studio: {
        id: number;
        title: string;
    };
}
type ActivityAddProject = ActivityUnitBase & {
    type: ActivityType.ADD_PROJECT;
    project: {
        id: number;
        title: string;
    };
    studio: {
        id: number;
        title: string;
    };
}
type ActivityUserJoin = ActivityUnitBase & {
    type: ActivityType.USER_JOIN;
}