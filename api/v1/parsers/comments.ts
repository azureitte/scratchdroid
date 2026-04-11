import type { HTMLElement } from "node-html-parser";

import { addPrefixUrl } from "@/util/functions";
import { htmlToCommentContent, stringToCommentContent } from "@/util/parsing/comments";
import { FAIL_REASON_MESSAGES } from "../constants";

import type { ScratchComment } from "../types/comment.types";
import type { 
    Comment,
    ReplyComment, 
    RootComment,
} from "@/util/types/app/comments.types";


type CommentR2Return<T> = T extends true 
    ? ReplyComment 
    : RootComment;


/**
 * Converts an HTML element returned by ScratchR2 API endpoints into a compatible Comment object
 * @param commentElem - The HTML element to convert
 * @param opts - Optional parameters
 * @param opts.isReply - Whether the comment is a reply
 * @param opts.parentId - The ID of the parent comment, if the comment is a reply
 * @returns The converted comment
 */ 
export function getCommentFromR2 <T extends boolean>(
    commentElem: HTMLElement, 
    opts: {
        isReply: T;
        parentId?: number;
    }
): CommentR2Return<T> {
    const id = Number(commentElem.getAttribute('data-comment-id'));
    let contentElem = commentElem.querySelector('.content');

    let [content, skip] = htmlToCommentContent(contentElem, opts.isReply);

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

    const replyTo = skip?.type === 'mention' && skip.username;

    if (opts.isReply) {
        return {
            id,
            content,
            author,
            createdAt,
            modifiedAt: createdAt,
            isReply: true,
            parent: opts.parentId!,
            replyTo: replyTo || '',
            isReported: false,
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
            isReported: false,
        } as any;
    }
}

/**
 * Converts the HTML of a comment section returned by ScratchR2 API endpoints into an array of RootComment objects
 * @param root - The HTML element to convert
 * @returns - The converted root comments array
 */
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

/**
 * Converts a comment mutation response returned by ScratchR2 API endpoints into the compatible result object.
 * It also automatically parses the fail reason code and converts it to a message string.
 * @param root - The HTML element to convert
 * @param opts - Optional parameters
 * @param opts.isReply - Whether the comment is a reply
 * @param opts.parentId - The ID of the parent comment, if the comment is a reply
 * @returns - Succesful or fail result state
 */
export function parseR2CommentMutationResponse (root: HTMLElement, opts: {
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

/**
 * Converts a comment returned by modern Scratch API endpoints into a compatible Comment object
 * @param comment - Raw comment object from Scratch API
 * @param opts - Optional parameters
 * @param opts.replies - Pre-fetched replies for this comment, if it's a root comment
 * @param opts.userMap - Pre-fetched UserID -> Username map
 * @returns 
 */
export const getCommentFromWww3 = (comment: ScratchComment, opts?: {
    replies?: ReplyComment[];
    userMap?: Map<number, string>;
}): Comment => {
    const isReply = comment.parent_id != null;

    const content = stringToCommentContent(comment.content);

    if (isReply) { return {
        id: comment.id,
        content,
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
        isReported: false,
    } }
    return {
        id: comment.id,
        content,
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
        isReported: false,
    }
}

