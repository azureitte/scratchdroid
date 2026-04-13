import he from "he";

import { getLastPathSegment } from "@/util/functions";
import { ActivityType, ActivityUnit } from "@/util/types/activity.types";
import { HTMLElement, NodeType } from "node-html-parser";
import { parseRelativeDateString } from "@/util/parsing";

const STRING_SEARCHES = [
    'is now following',
    'is now following the studio',
    'shared the project',
    'loved',
    'favorited',
    'remixed',
    'became a curator of',
    'was promoted to manager of',
    'added',
    'joined Scratch',
];

const STRING_MATCHES = [
    ActivityType.FOLLOW_USER,
    ActivityType.FOLLOW_STUDIO,
    ActivityType.SHARE_PROJECT,
    ActivityType.LOVE_PROJECT,
    ActivityType.FAVORITE_PROJECT,
    ActivityType.REMIX_PROJECT,
    ActivityType.BECOME_CURATOR,
    ActivityType.BECOME_MANAGER,
    ActivityType.ADD_PROJECT,
    ActivityType.USER_JOIN,
];

let _id = 0;

const id = () => ++_id;
const dehe = <T extends string|null|undefined>(str?: T) => (str && he.decode(str)) as T|string;

export function getActivityFromR2 (root: HTMLElement): ActivityUnit[] {
    const activity: ActivityUnit[] = [];

    const items = root.querySelectorAll('li');

    for (const item of items) {
        const itemContent = item.querySelector('div');
        if (!itemContent) continue;
        const itemNodes = itemContent.childNodes;

        const actorNodeIdx = itemNodes.findIndex(n => n.nodeType === NodeType.ELEMENT_NODE && (n as HTMLElement).tagName === 'SPAN');
        if (actorNodeIdx === -1) continue;
        const actorNode = itemNodes[actorNodeIdx];
        
        const actorUsername = actorNode.innerText.trim();

        const dateElem = itemContent.querySelector('[data-tag="time"]');
        const dateStr = dateElem?.innerText.trim() ?? 'just now';
        const date = parseRelativeDateString(dateStr);


        const stringNode = itemNodes[actorNodeIdx + 1];
        if (!stringNode) continue;
        const stringText = stringNode.innerText.trim();

        const matchIdx = STRING_SEARCHES.findLastIndex(s => stringText.startsWith(s));
        const type = STRING_MATCHES[matchIdx];
        if (!type) continue;

        let activityUnit: ActivityUnit;

        switch (type) {
            case ActivityType.FOLLOW_USER: {
                const followeeElem = itemContent.querySelector('a')!;
                const followeeUsername = followeeElem.innerText.trim();

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    followee: {
                        id: 0,
                        username: followeeUsername,
                    },
                }
                break;
            }
            case ActivityType.FOLLOW_STUDIO: {
                const studioElem = itemContent.querySelector('a')!;
                const studioTitle = dehe(studioElem.innerText.trim());
                const studioId = getLastPathSegment(studioElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    studio: {
                        id: Number(studioId),
                        title: studioTitle,
                    },
                }
                break;
            }
            case ActivityType.SHARE_PROJECT: {
                const projectElem = itemContent.querySelector('a')!;
                const projectTitle = dehe(projectElem.innerText.trim());
                const projectId = getLastPathSegment(projectElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    project: {
                        id: Number(projectId),
                        title: projectTitle,
                    },
                }
                break;
            }
            case ActivityType.LOVE_PROJECT: {
                const projectElem = itemContent.querySelector('a')!;
                const projectTitle = dehe(projectElem.innerText.trim());
                const projectId = getLastPathSegment(projectElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    project: {
                        id: Number(projectId),
                        title: projectTitle,
                    },
                }
                break;
            }
            case ActivityType.FAVORITE_PROJECT: {
                const projectElem = itemContent.querySelector('a')!;
                const projectTitle = dehe(projectElem.innerText.trim());
                const projectId = getLastPathSegment(projectElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    project: {
                        id: Number(projectId),
                        title: projectTitle,
                    },
                }
                break;
            }
            case ActivityType.REMIX_PROJECT: {
                const links = itemContent.querySelectorAll('a');

                const parentElem = links[0];
                const parentTitle = dehe(parentElem.innerText.trim());
                const parentId = getLastPathSegment(parentElem.getAttribute('href') ?? '');

                const childElem = links[1];
                const childTitle = dehe(childElem.innerText.trim());
                const childId = getLastPathSegment(childElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    parent: {
                        id: Number(parentId),
                        title: parentTitle,
                    },
                    project: {
                        id: Number(childId),
                        title: childTitle,
                    },
                }
                break;
            }
            case ActivityType.BECOME_CURATOR: {
                const studioElem = itemContent.querySelector('a')!;
                const studioTitle = dehe(studioElem.innerText.trim());
                const studioId = getLastPathSegment(studioElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    studio: {
                        id: Number(studioId),
                        title: studioTitle,
                    },
                }
                break;
            }
            case ActivityType.BECOME_MANAGER: {
                const studioElem = itemContent.querySelector('a')!;
                const studioTitle = dehe(studioElem.innerText.trim());
                const studioId = getLastPathSegment(studioElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    studio: {
                        id: Number(studioId),
                        title: studioTitle,
                    },
                }
                break;
            }
            case ActivityType.ADD_PROJECT: {
                const links = itemContent.querySelectorAll('a');

                const projectElem = links[0];
                const projectTitle = dehe(projectElem.innerText.trim());
                const projectId = getLastPathSegment(projectElem.getAttribute('href') ?? '');

                const studioElem = links[1];
                const studioTitle = dehe(studioElem.innerText.trim());
                const studioId = getLastPathSegment(studioElem.getAttribute('href') ?? '');

                activityUnit = {
                    type,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                    project: {
                        id: Number(projectId),
                        title: projectTitle,
                    },
                    studio: {
                        id: Number(studioId),
                        title: studioTitle,
                    },
                }
                break;
            }
            default: {
                activityUnit = {
                    type: ActivityType.USER_JOIN,
                    id: id(),
                    date,
                    actor: {
                        id: 0,
                        username: actorUsername,
                    },
                }
                break;
            }
        }

        activity.push(activityUnit);
    }

    return activity;

}