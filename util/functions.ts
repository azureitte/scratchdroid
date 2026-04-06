import { HTMLElement } from "node-html-parser";
import he from "he";
import { formatDistanceToNow, format } from 'date-fns';

import type { 
    Comment,
    FlattenedComment, 
    PartialSheetMenuDefinition, 
    ReplyComment, 
    RootComment, 
    ScratchComment, 
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

type CommentR2Return<T> = T extends true 
    ? ReplyComment 
    : RootComment;

export function getCommentFromR2 <T extends boolean>(
    commentElem: HTMLElement, 
    opts: {
        isReply: T;
        parentId?: number;
    }
): CommentR2Return<T> {
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
        id: Number(authorId),
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

    if (opts.isReply) {
        return {
            id,
            content,
            author,
            createdAt,
            modifiedAt: createdAt,
            isReply: true,
            parent: opts.parentId!,
            replyTo: replyTo!,
        } as any;
    } else {
        return {
            id,
            content,
            author,
            createdAt,
            modifiedAt: createdAt,
            isReply: false,
            replies: [],
            totalReplies: 0,
        } as any;
    }
}

export function getCommentsFromR2 (root: HTMLElement): RootComment[] {
    const comments: RootComment[] = [];

    const parentElems = root.querySelectorAll('.top-level-reply');
    for (const parentElem of parentElems) {
        const parentCommentElem = parentElem.querySelector('.comment');
        const replyElems = parentElem.querySelector('.replies')?.querySelectorAll('.comment');

        const comment = getCommentFromR2(parentCommentElem!, {
            isReply: false,
        });
        comments.push(comment);

        if (replyElems) {
            for (const replyElem of replyElems) {
                const reply = getCommentFromR2(replyElem, {
                    isReply: true,
                    parentId: comment.id,
                });
                comment.replies.push(reply);
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
    comment?: Comment;
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

    const comment = getCommentFromR2(commentElem, {
        isReply: opts.isReply,
        parentId: opts.parentId,
    });
    return {
        success: true,
        comment,
    };
}

export const getCommentFromWww3 = (comment: ScratchComment, opts?: {
    replies?: ReplyComment[];
    userMap?: Map<number, string>;
}): Comment => {
    const isReply = comment.parent_id != null;

    if (isReply) { return {
        id: comment.id,
        content: decodeWww3Comment(comment.content),
        author: {
            id: comment.author.id,
            username: comment.author.username,
            scratchteam: comment.author.scratchteam,
            image: comment.author.image,
        },
        createdAt: new Date(comment.datetime_created),
        modifiedAt: new Date(comment.datetime_modified),
        isReply: true,
        parent: comment.parent_id!,
        replyTo: opts?.userMap?.get(comment.commentee_id!) ?? comment.commentee_id?.toString() ?? '',
    } }
    return {
        id: comment.id,
        content: decodeWww3Comment(comment.content),
        author: {
            id: comment.author.id,
            username: comment.author.username,
            scratchteam: comment.author.scratchteam,
            image: comment.author.image,
        },
        createdAt: new Date(comment.datetime_created),
        modifiedAt: new Date(comment.datetime_modified),
        isReply: false,
        replies: opts?.replies ?? [],
        totalReplies: comment.reply_count,
    }
}

export const flattenComments = (comments: RootComment[], opts?: {
    highlightedId?: number;
}): FlattenedComment[] => {
    return uniqueById(comments.reduce((acc, comment) => {
        acc.push({
            id: comment.id,
            content: comment.content,
            author: comment.author,
            createdAt: comment.createdAt,
            modifiedAt:comment.modifiedAt,
            isLastInBlock: comment.replies.length === 0,
            isHighlighted: opts?.highlightedId === comment.id,
            isReply: false,
            parent: null,
            replyTo: null,
        });
        comment.replies.forEach((reply, idx) => {
            acc.push({
                id: reply.id,
                content: reply.content,
                author: reply.author,
                createdAt: reply.createdAt,
                modifiedAt: reply.modifiedAt,
                isLastInBlock: idx === comment.replies.length - 1,
                isHighlighted: opts?.highlightedId === reply.id,
                isReply: true,
                parent: comment.id,
                replyTo: reply.author.username,
                replyIdx: idx,
            });
        });
        return acc;
    }, [] as FlattenedComment[]));
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
        setTimeout(() => listRef?.scrollToIndex(targetIdx), 0);
        return true;
    }
    return false;
}

export const buildMenu = (def: PartialSheetMenuDefinition): SheetMenuDefinition => ({
    ...def,
    detents: def.detents ?? ['auto'],
    dismissible: def.dismissible ?? true,
});

export function uniqueById<T extends { id: number; [key: string]: any }>(arr: T[]): T[] {
    const seen = new Set<number>();

    return arr.filter(item => {
        if (seen.has(item.id))
            return false;
        seen.add(item.id);
        return true;
    });
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));