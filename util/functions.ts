import { HTMLElement } from "node-html-parser";
import he from "he";
import { formatDistanceToNow, format } from 'date-fns';

import type { 
    FlattenedComment, 
    PartialSheetMenuDefinition, 
    ScratchProjectFile, 
    SheetMenuDefinition 
} from "./types";
import { CommentSectionRef } from "@/components/panels/CommentSection";
import { FAIL_REASON_MESSAGES } from "./constants";
import { InfiniteData } from "@tanstack/react-query";

export function shortRelativeDate(date: Date) {
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 10) {
        return "now";
    }

    const units = [
        { limit: 60, div: 1, suffix: "s" },
        { limit: 3600, div: 60, suffix: "m" },
        { limit: 86400, div: 3600, suffix: "h" },
        { limit: 604800, div: 86400, suffix: "d" },
        { limit: 2629800, div: 604800, suffix: "w" },
        { limit: 31557600, div: 2629800, suffix: "mo" },
        { limit: Infinity, div: 31557600, suffix: "y" },
    ];

    for (const u of units) {
        if (diff < u.limit) {
            return Math.floor(diff / u.div) + u.suffix;
        }
    }
}

export function relativeDate (date: Date) {
    let diff = Date.now() - date.getTime();

    if (diff < 10_000) {
        return "just now";
    }

    return formatDistanceToNow(date, { addSuffix: true });
}

export function muteStatusDateToString (expiresAt: number) {
    const futureDate = new Date(expiresAt * 1000);
    return formatDistanceToNow(futureDate, { addSuffix: true });
}

export function dateShort (date: Date) {
    return format(date, 'MMM d, yyyy');
}

const shortNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
});

export function shortNumber (num: number) {
  return shortNumberFormatter.format(num);
}

export const truncateText = (text: string, maxLength: number, charPerNewLine: number = 60): [string, boolean] => {
    let idx = 0;
    let counter = 0;
    while (idx < text.length && counter < maxLength) {
        if (text[idx] === '\n') {
            counter += charPerNewLine;
        } else {
            counter += 1;
        }
        idx++;
    }
    if (idx >= text.length) return [text, false];
    return [text.slice(0, idx).trimEnd() + '...', true];
}

export function commentR2htmlToFlattened (
    commentElem: HTMLElement, 
    opts: {
        isReply: boolean;
        parentId?: number;
        isLastInBlock: boolean;
        replyIdx?: number;
    }
): FlattenedComment {
    const id = Number(commentElem.getAttribute('data-comment-id'));
    let content = commentElem.querySelector('.content')?.innerText ?? '';
    content = content
        .replaceAll('\n', ' ') // turn newlines into spaces
        .replace(/\s+/g, ' ') // remove multiple spaces
        .trim();

    const authorUsername = commentElem.querySelector('.name')?.children[0]?.innerText ?? '';
    const authorId = commentElem.querySelector('[data-commentee-id]')?.getAttribute('data-commentee-id') ?? authorUsername;
    const authorImage = addPrefixUrl(commentElem.querySelector('.avatar')?.getAttribute('src') ?? '');
    const author = {
        id: authorId,
        username: authorUsername,
        scratchteam: false,
        image: authorImage,
    }
    
    const createdAtStr = commentElem.querySelector('.time')?.getAttribute('title');
    const createdAt = createdAtStr ? new Date(createdAtStr) : new Date(0);

    let replyTo = null;
    if (opts.isReply) {
        const contentSpl = content.split(' ')
        replyTo = contentSpl[0].slice(1);
        content = contentSpl.slice(1).join(' ');
    }

    let comment: FlattenedComment;

    if (opts.isReply) {
        comment = {
            id,
            content,
            author,
            createdAt,
            modifiedAt: createdAt,
            isReply: true,
            parent: opts.parentId!,
            replyTo: replyTo!,
            isLastInBlock: opts.isLastInBlock ?? false,
            isHighlighted: false,
            replyIdx: opts.replyIdx ?? 0,
        };
    } else {
        comment = {
            id,
            content,
            author,
            createdAt,
            modifiedAt: createdAt,
            isReply: false,
            parent: null,
            replyTo: null,
            isLastInBlock: opts.isLastInBlock ?? false,
            isHighlighted: false,
        };
    }

    return comment;
}

export function commentsR2htmlToFlattened (root: HTMLElement): FlattenedComment[] {
    const comments: FlattenedComment[] = [];

    const parentElems = root.querySelectorAll('.top-level-reply');
    for (const parentElem of parentElems) {
        const parentCommentElem = parentElem.querySelector('.comment');
        const replyElems = parentElem.querySelector('.replies')?.querySelectorAll('.comment');

        const comment = commentR2htmlToFlattened(parentCommentElem!, {
            isReply: false,
            isLastInBlock: !replyElems || replyElems.length === 0,
        });
        comments.push(comment);

        if (replyElems) {
            let i = 0;
            for (const replyElem of replyElems) {
                const reply = commentR2htmlToFlattened(replyElem, {
                    isReply: true,
                    parentId: comment.id,
                    isLastInBlock: i === replyElems.length - 1,
                    replyIdx: i,
                });
                comments.push(reply);
                i++;
            }
        }
    }

    return comments;
}

export function parseR2AddCommentResponse (root: HTMLElement, opts: {
    isReply: boolean;
    parentId?: number;
} = {
    isReply: false,
}): ({
    success: true;
    comment?: FlattenedComment;
}|{
    success: false;
    error: string;
}) {
    const errorElem = root.querySelector('#error-data');
    if (errorElem) {
        try {
            const errorObj = JSON.parse(errorElem.innerText);
            return {
                success: false,
                error: FAIL_REASON_MESSAGES[errorObj.error](errorObj.mute_status),
            };
        } catch {
            return {
                success: false,
                error: FAIL_REASON_MESSAGES.error(),
            };
        }
    }

    const commentElem = root.querySelector('.comment');
    if (!commentElem) return {
        success: true,
    };

    const comment = commentR2htmlToFlattened(commentElem, {
        isReply: opts.isReply,
        parentId: opts.parentId,
        isLastInBlock: true,
    });
    return {
        success: true,
        comment,
    };
}

export const addPrefixUrl = (url: string) => {
    if (url.startsWith('https:')) return url;
    return 'https:' + url;
}

export const decodeWww3Comment = (comment: string) => {
    return he.decode(comment) // html escape decode
        .replaceAll('\n', ' ') // turn newlines into spaces
        .replace(/\s+/g, ' ') // remove multiple spaces
        .trim();
}

export const projectHasCloudVariables = (project?: ScratchProjectFile|null) => {
    if (!project) return false;

    const stageTarget = project.targets?.find(t => t.isStage);
    if (!stageTarget) return false;

    try {
        return Object.values(stageTarget.variables).some((v: any) => v[2] === true);
    } catch {
        return false;
    }
}

export const addOrReplace = (arr: any[], item: any, idx: number) => {
    if (idx < 0) return;
    if (idx >= arr.length)
        arr.push(item);
    else 
        arr[idx] = item;
}

export const scrollCommentSectionToId = (listRef: CommentSectionRef|null|undefined, comments: FlattenedComment[], commentId: number|string) => {
    const comment = comments.find(c => c.id === Number(commentId));
    if (comment) {
        const targetIdx = comments.indexOf(comment);
        listRef?.scrollToIndex(targetIdx);
        return true;
    }
    return false;
}

export const buildMenu = (def: PartialSheetMenuDefinition): SheetMenuDefinition => ({
    ...def,
    detents: def.detents ?? ['auto'],
    dismissible: def.dismissible ?? true,
});


export const insertItemAtInfinite = <TItem, TPageParam = unknown>(
    item: TItem, 
    oldData: InfiniteData<TItem[], TPageParam>, 
    pageIndex: number, 
    itemIndex: number
) => {
    const newData: InfiniteData<TItem[], TPageParam> = {
        pages: [...oldData.pages.map(p => [...p])],
        pageParams: [...oldData.pageParams],
    };
    newData.pages[pageIndex].splice(itemIndex, 0, item);
    return newData;
}

type FindInfiniteResult = {
  pageIndex: number;
  itemIndex: number;
};

export const findIndexInfinite = <TItem>(
    data: InfiniteData<TItem[]>,
    predicate: (item: TItem, index: number) => boolean
): FindInfiniteResult => {

    if (data) {
        for (let pageIndex = 0; pageIndex < data.pages.length; pageIndex++) {
            const items = data.pages[pageIndex];
            const itemIndex = items.findIndex(predicate);

            if (itemIndex !== -1) {
                return { pageIndex, itemIndex };
            }
        }
    }

    return {
        pageIndex: -1,
        itemIndex: -1,
    };

}

export const findLastIndexInfinite = <TItem>(
    data: InfiniteData<TItem[]>,
    predicate: (item: TItem, index: number) => boolean
): FindInfiniteResult => {

    if (data) {
        for (let pageIndex = data.pages.length - 1; pageIndex >= 0; pageIndex--) {
            const items = data.pages[pageIndex];
            const itemIndex = items.findLastIndex(predicate);

            if (itemIndex !== -1) {
                return { pageIndex, itemIndex };
            }
        }
    }
    
    return {
        pageIndex: -1,
        itemIndex: -1,
    };
}