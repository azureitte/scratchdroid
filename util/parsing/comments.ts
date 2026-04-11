import { HTMLElement, NodeType, parse } from "node-html-parser";

import {
    SCRATCH_EMOJI_CODES, 
    WEBSITE_URL 
} from "@/util/constants";
import { 
    addPrefixUrl, 
    randstr, 
    uniqueById 
} from "@/util/functions";

import type { 
    Comment,
    CommentContentNode,
    FlattenedComment, 
    RootComment,
} from "@/util/types/app/comments.types";


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
 * Converts comment's content from parsed HTML to an array of comment content nodes
 * @param root - The HTML to convert
 * @param skipFirst - If true, skips the first node and returns it separately
 * @returns - A tuple, where the first element is the comment content nodes array, and the second is the skip node, if present
 */
export function htmlToCommentContent (root: HTMLElement|null, skipFirst = false): [CommentContentNode[], CommentContentNode|undefined] {
    if (!root) return [[], undefined];

    let skip: CommentContentNode|undefined;

    let nodes = root.childNodes;
    if (nodes[0].nodeType === NodeType.TEXT_NODE && nodes[0].textContent.trim() === '') {
        nodes = nodes.slice(1);
    }

    const content = nodes.reduce((acc, node, idx) => {
        const key = randstr(8);
        let contentNode: CommentContentNode|undefined;
        const shouldSkip = skipFirst && idx === 0;
        const shouldPush = !shouldSkip;

        // text nodes
        if (node.nodeType === NodeType.TEXT_NODE) {
            let text = (node.textContent ?? '')
                .replaceAll('\n', ' ') // turn newlines into spaces
                .replace(/\s+/g, ' ') // remove multiple spaces

            if (idx === 0 || (skipFirst && idx === 1)) 
                text = text.trimStart();
            if (idx === nodes.length - 1) 
                text = text.trimEnd();

            const splitNodes = splitTextContentNode(text);

            contentNode = splitNodes[0];
            acc.push(...splitNodes);

        // link and mention nodes
        } else if (node.nodeType === NodeType.ELEMENT_NODE) {
            const elem = node as HTMLElement;
            if (elem.tagName === 'A') {
                let href = elem.getAttribute('href') ?? '';
                const text = elem.innerText;

                // mention nodes
                if (text.startsWith('@') && href.startsWith('/users/')) {
                    contentNode = {
                        type: 'mention',
                        text,
                        username: text.slice(1),
                        key,
                    };
                    shouldPush && acc.push(contentNode);

                // link nodes
                } else {
                    const isExternal = href.startsWith(WEBSITE_URL);
                    if (isExternal) href = href.slice(WEBSITE_URL.length);
                    contentNode = {
                        type: 'link',
                        text,
                        url: href,
                        isExternal,
                        key,
                    };
                    shouldPush && acc.push(contentNode);
                }

            // emoji nodes
            } else if (elem.tagName === 'IMG') {
                if (elem.classList.contains('easter-egg')) {
                    const src = elem.getAttribute('src') ?? '';
                    const emojiName = src.slice(src.lastIndexOf('/') + 1).split('.')[0];
                    contentNode = {
                        type: 'emoji',
                        text: SCRATCH_EMOJI_CODES[emojiName] ?? emojiName,
                        imageUrl: addPrefixUrl(src),
                        key,
                    };
                    shouldPush && acc.push(contentNode);
                } else if (elem.classList.contains('emoji')) {
                    const src = WEBSITE_URL + (elem.getAttribute('src') ?? '');
                    const emojiName = src.slice(src.lastIndexOf('/') + 1).split('.')[0];
                    contentNode = {
                        type: 'emoji',
                        text: SCRATCH_EMOJI_CODES[emojiName] ?? emojiName,
                        imageUrl: addPrefixUrl(src),
                        key,
                    };
                    shouldPush && acc.push(contentNode);
                }
            }
        }

        if (shouldSkip) skip = contentNode;
        return acc;
    }, [] as CommentContentNode[]);

    return [content, skip];
}

/**
 * Converts comment's content from raw HTML string to an array of comment content nodes
 * @param content - The string to convert
 * @returns - The comment content nodes array
 */
export function stringToCommentContent (content: string): CommentContentNode[] {
    return htmlToCommentContent(parse(content))[0];
}

/**
 * Converts a comment content node array into a readable string
 * @param content 
 * @returns 
 */
export function commentContentToString (content: CommentContentNode[]) {
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
export function splitTextContentNode (text: string) {
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

export function formatMultilineText (text: string) {
    console.log('formatting multiline text');
    const lineNodes = text.split('\n').map(splitTextContentNode);
    return lineNodes.reduce((acc, lineNodes) => {
        return [...acc, ...lineNodes, { 
            type: 'text', 
            text: '\n', 
            key: randstr(8) 
        }];
    }, [] as CommentContentNode[]).slice(0, -1);
}