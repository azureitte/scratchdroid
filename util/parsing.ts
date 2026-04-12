import {
    randstr, 
    uniqueById 
} from "@/util/functions";

import type { 
    Comment,
    CommentContentNode,
    FlattenedComment, 
    RootComment,
} from "@/util/types/comments.types";


/**
 * Flattens an array of RootComment objects, converting them and their replies
 * into a single array of FlattenedComment objects, used to render in FlatLists
 * @param comments - Root comments array
 * @param opts - Optional parameters
 * @param opts.highlightedId - (Optional) The ID of the comment to mark as highlighted
 * @returns 
 */
export function flattenComments (comments: RootComment[], opts?: {
    highlightedId?: number;
}): FlattenedComment[] {
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
            isReported: comment.isReported,
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
                replyTo: reply.replyTo,
                replyIdx: idx,
                isReported: reply.isReported,
            });
        });
        return acc;
    }, [] as FlattenedComment[]));
}

/**
 * Converts a FlattenedComment object back into a Comment object.
 * Note that if it's a root comment, the replies information will be lost.
 * @param comment 
 * @returns 
 */
export function unflattenComment (comment: FlattenedComment): Comment {
    if (comment.isReply) {
        return {
            id: comment.id,
            content: comment.content,
            author: comment.author,
            createdAt: comment.createdAt,
            modifiedAt: comment.modifiedAt,
            isReply: true,
            parent: comment.parent,
            replyTo: comment.replyTo,
            isReported: comment.isReported,
        }
    } else {
        return {
            id: comment.id,
            content: comment.content,
            author: comment.author,
            createdAt: comment.createdAt,
            modifiedAt: comment.modifiedAt,
            isReply: false,
            replies: [],
            totalReplies: 0,
            isReported: comment.isReported,
        }
    }
}

/**
 * Converts a comment content node array into a readable string
 * @param content 
 * @returns 
 */
export function commentContentToString (content: CommentContentNode[]): string {
    return content.reduce((acc, node) => {
        return acc + (node?.text ?? '');
    }, '');
}


/**
 * Tests if the input string is a mention, if true, returns the mention portion as well as the rest of the string.
 * @param text - The string to test
 * @returns - String passed the test?, mention string, rest of the string
 */
function parseMention (text: string): [false, null, null]|[true, string, string] {
    const mentionRegex = /^(@[A-Za-z0-9_-]+)(.*)$/;
    const match = text.match(mentionRegex);
    if (!match) return [false, null, null];
    return [true, match[1], match[2]];
}

/**
 * Parses mentions and URLs inside an existing text comment node
 * and splits it into multiple nodes acoordingly.
 * @param text - The text of the node
 * @returns - The split nodes array
 */
export function parseRichText (text: string) {
    const nodes: CommentContentNode[] = [];
    const textSpl = text.split(' ');

    const urlRegex = /^https?:\/\/([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

    let acc = '';
    for (const word of textSpl) {
        const [isMention, mention, rest] = parseMention(word);
        const isUrl = urlRegex.test(word);

        if (isMention || isUrl) {
            if (acc.length > 0) {
                nodes.push({
                    type: 'text',
                    text: acc.replace(/\s+/g, ' '),
                    key: randstr(8),
                });
            }
            acc = ' ';
            if (isMention) {
                nodes.push({
                    type: 'mention',
                    text: mention,
                    username: word.slice(1),
                    key: randstr(8),
                });
                nodes.push({
                    type: 'text',
                    text: rest,
                    key: randstr(8),
                });
            } else {
                nodes.push({
                    type: 'link',
                    text: word,
                    url: word,
                    isExternal: true,
                    key: randstr(8),
                });
            }
        } else {
            acc += word + ' ';
        }
    }
    
    // add last text node
    if (acc.length > 0) {
        nodes.push({
            type: 'text',
            text: acc.replace(/\s+/g, ' '),
            key: randstr(8),
        });
        acc = '';
    }

    return nodes;
}

export function parseMultilineRichText (text: string) {
    console.log('formatting multiline text');
    const lineNodes = text.split('\n').map(parseRichText);
    return lineNodes.reduce((acc, lineNodes) => {
        return [...acc, ...lineNodes, { 
            type: 'text', 
            text: '\n', 
            key: randstr(8) 
        }];
    }, [] as CommentContentNode[]).slice(0, -1);
}