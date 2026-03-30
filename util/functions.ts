import { HTMLElement } from "node-html-parser";
import { formatDistanceToNow } from 'date-fns';

import type { FlattenedComment } from "./types";

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

const shortNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
});

export function shortNumber (num: number) {
  return shortNumberFormatter.format(num);
}


export function commentsR2htmlToFlattened (root: HTMLElement): FlattenedComment[] {
    const comments: FlattenedComment[] = [];

    const getComment = (
        commentElem: HTMLElement, 
        opts: {
            isReply: boolean;
            parentId?: number;
            isLastInBlock: boolean;
            hasMoreToLoad?: boolean;
        }
    ) => {
        const id = Number(commentElem.getAttribute('data-comment-id'));
        let content = commentElem.querySelector('.content')?.innerText ?? '';
        content = content
            .replaceAll('\n', ' ') // turn newlines into spaces
            .replace(/\s+/g, ' ') // remove multiple spaces
            .trim();

        const authorUsername = commentElem.querySelector('.name')?.children[0]?.innerText ?? '';
        const authorImage = 'https:' + (commentElem.querySelector('.avatar')?.getAttribute('src') ?? '');
        const author = {
            id: authorUsername,
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
                hasMoreToLoad: opts.hasMoreToLoad ?? false,
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
            };
        }

        return comment;
    }

    const parentElems = root.querySelectorAll('.top-level-reply');
    for (const parentElem of parentElems) {
        const parentCommentElem = parentElem.querySelector('.comment');
        const replyElems = parentElem.querySelector('.replies')?.querySelectorAll('.comment');

        const comment = getComment(parentCommentElem!, {
            isReply: false,
            isLastInBlock: !replyElems || replyElems.length === 0,
        });
        comments.push(comment);

        if (replyElems) {
            let i = 0;
            for (const replyElem of replyElems) {
                const reply = getComment(replyElem, {
                    isReply: true,
                    parentId: comment.id,
                    isLastInBlock: i === replyElems.length - 1,
                    hasMoreToLoad: false,
                });
                comments.push(reply);
                i++;
            }
        }
    }

    return comments;
}