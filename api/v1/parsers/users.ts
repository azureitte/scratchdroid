import { HTMLElement } from "node-html-parser";
import he from "he";

import { getLastPathSegment, fnull } from "@/util/functions";
import type { 
    BannerProject, 
    ProfileClassroom, 
    CarouselProject, 
    CarouselStudio, 
    CarouselUser, 
    UserDataR2 
} from "@/util/types/users.types";

const PROFILE_BOX_TITLES = {
    shared: 'Shared Projects',
    favorite: 'Favorite Projects',
    studiosFollowing: 'Studios I\'m Following',
    studiosCurating: 'Studios I Curate',
    followers: 'Followers',
    following: 'Following',
    classrooms: 'Classes',
}

type BoxMatchReturn = {
    type?: keyof typeof PROFILE_BOX_TITLES;
    count?: number;
}

type ProfileBox = {
    elem: HTMLElement;
    count?: number;
}

const dehe = <T extends string|null|undefined>(str?: T) => (str && he.decode(str)) as T|string;

export function getUserFromProfilePage (root: HTMLElement): UserDataR2|null {
    const content = root.querySelector('body #content');
    if (!content) return null;

    const profileData = content.querySelector('#profile-data')!;

    const roleElem = profileData.querySelector('.profile-details .group')
    const role = dehe(roleElem?.innerText.trim() ?? 'Scratcher');

    const roleLinkElem = roleElem?.querySelector('a');
    const roleLink = roleLinkElem?.getAttribute('href') ?? null;

    const bannerProjectHeadingElem = profileData.querySelector('.featured-project-heading');
    const bannerProjectHeading = bannerProjectHeadingElem?.innerText.trim() ?? 'Featured Project';

    const bannerProjectTitleElem = profileData.querySelector('.project-name');
    const bannerProjectTitle = dehe(bannerProjectTitleElem?.innerText.trim() ?? null);

    const bannerProjectLinkElem = profileData.querySelector('#featured-project');
    const bannerProjectLink = bannerProjectLinkElem?.getAttribute('href') ?? null;
    const bannerProjectId = bannerProjectLink ? Number(getLastPathSegment(bannerProjectLink)) : null;

    const followButtonElem = profileData.querySelector('.follow-button');
    const canFollow = followButtonElem !== null;
    const isFollowing = followButtonElem?.getAttribute('data-control') === 'unfollow';

    const commentsOff = content.querySelector('.comments-off');

    const carouselBoxElems = content.querySelectorAll('.box.slider-carousel-container');
    const matchedBoxes: Record<keyof typeof PROFILE_BOX_TITLES, ProfileBox|null> = {
        shared: null,
        favorite: null,
        studiosFollowing: null,
        studiosCurating: null,
        followers: null,
        following: null,
        classrooms: null,
    }

    for (const boxElem of carouselBoxElems) {
        const { type, count } = matchBox(boxElem);
        const listElem = boxElem.querySelector('ul');
        if (!listElem) continue;
        if (type) {
            matchedBoxes[type] = {
                elem: listElem,
                count,
            }
        }
    }

    const favoriteProjects: CarouselProject[] = [];
    const studiosFollowing: CarouselStudio[] = [];
    const studiosCurating: CarouselStudio[] = [];
    const followers: CarouselUser[] = [];
    const following: CarouselUser[] = [];
    const classrooms: ProfileClassroom[] = [];

    if (matchedBoxes.favorite) {
        for (const projectElem of matchedBoxes.favorite.elem.children) {
            const project = parseProfileProject(projectElem);
            favoriteProjects.push(project);
        }
    }
    if (matchedBoxes.studiosFollowing) {
        for (const studioElem of matchedBoxes.studiosFollowing.elem.children) {
            const studio = parseProfileStudio(studioElem);
            studiosFollowing.push(studio);
        }
    }
    if (matchedBoxes.studiosCurating) {
        for (const studioElem of matchedBoxes.studiosCurating.elem.children) {
            const studio = parseProfileStudio(studioElem);
            studiosCurating.push(studio);
        }
    }
    if (matchedBoxes.followers) {
        for (const userElem of matchedBoxes.followers.elem.children) {
            const user = parseProfileUser(userElem);
            followers.push(user);
        }
    }
    if (matchedBoxes.following) {
        for (const userElem of matchedBoxes.following.elem.children) {
            const user = parseProfileUser(userElem);
            following.push(user);
        }
    }
    if (matchedBoxes.classrooms) {
        for (const classroomElem of matchedBoxes.classrooms.elem.children) {
            const classroom = parseProfileClassroom(classroomElem);
            classrooms.push(classroom);
        }
    }

    return {
        role,
        roleLink,
        bannerProject: (fnull(bannerProjectId) && {
            label: bannerProjectHeading,
            id: bannerProjectId,
            title: bannerProjectTitle,
            thumbnail_url: `https://uploads.scratch.mit.edu/get_image/project/${bannerProjectId}_480x360.png`,
        }) as BannerProject|null,

        canComment: commentsOff == null,
        canFollow,
        isFollowing,

        favoriteProjects,
        studiosFollowing,
        studiosCurating,
        followers,
        following,
        classrooms,

        sharedProjectsCount: matchedBoxes.shared?.count,
        classroomsCount: matchedBoxes.classrooms?.count,
    }

}




function matchBox (box: HTMLElement): BoxMatchReturn {
    const titleElem = box.querySelector('.box-head h4');
    for (const [key, title] of Object.entries(PROFILE_BOX_TITLES)) {
        if (titleElem?.innerText.trim().startsWith(title)) {
            const type = key as keyof typeof PROFILE_BOX_TITLES;
            const countStr: string = titleElem.innerText.split('(')[1]?.split(')')[0];
            const count = countStr ? parseInt(countStr) : undefined;
            return { type, count };
        }
    }
    return { type: undefined };
}

function parseProfileProject (project: HTMLElement): CarouselProject {
    const titleElem = project.querySelector('.title');
    const titleLinkElem = titleElem?.querySelector('a');

    const title = dehe(titleElem?.innerText.trim() ?? '');
    const link = titleLinkElem?.getAttribute('href') ?? null;
    const id = link ? Number(getLastPathSegment(link)) : 0;

    const authorElem = project.querySelector('.owner a');
    const author = authorElem?.innerText.trim() ?? '';

    return { id, title, author };
}

function parseProfileStudio (studio: HTMLElement): CarouselStudio {
    const titleElem = studio.querySelector('.title');
    const titleLinkElem = titleElem?.querySelector('a');

    const title = dehe(titleElem?.innerText.trim() ?? '');
    const link = titleLinkElem?.getAttribute('href') ?? null;
    const id = link ? Number(getLastPathSegment(link)) : 0;

    return { id, title };
}

function parseProfileClassroom (classroom: HTMLElement): ProfileClassroom {
    return parseProfileStudio(classroom) as ProfileClassroom;
}

function parseProfileUser (user: HTMLElement): CarouselUser {
    const usernameElem = user.querySelector('.title');
    const username = usernameElem?.innerText.trim() ?? '';
    const imgElem = user.querySelector('img');
    const avatarUrl = imgElem?.getAttribute('data-original') ?? '';
    const id = getUidFromThumbnailUrl(avatarUrl);

    return { username, id };
}

function getUidFromThumbnailUrl (url: string) {
    const match = url.match(/\/user\/(\d+)_/);
    const userIdStr = match ? match[1] : null;
    const userId = userIdStr ? Number(userIdStr) : 0;
    return isNaN(userId) ? 0 : userId;
}