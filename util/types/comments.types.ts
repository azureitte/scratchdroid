export type Comment =
    | RootComment
    | ReplyComment;

export type RootComment = CommentBase & {
    isReply: false;
    replies: ReplyComment[];
    totalReplies: number;
}
export type ReplyComment = CommentBase & {
    isReply: true;
    parent: number;
    replyTo: string;
}

export type FlattenedComment = CommentBase & {
    isLastInBlock: boolean;  // is the comment the last one in the reply chain
    isHighlighted: boolean;
} & ({
    isReply: false;
    parent: null;
    replyTo: null;
}|{
    isReply: true;
    parent: number;   // parent comment id
    replyTo: string;  // username to which the reply is targeted
    replyIdx: number; // index of the reply relative to the parent thread
});

export type CommentContentNode =
    | CommentContentNodeText
    | CommentContentNodeLink
    | CommentContentNodeMention
    | CommentContentNodeEmoji;


    
type CommentBase = {
    id: number;
    content: CommentContentNode[];
    author: {
        id: number;
        username: string;
        scratchteam: boolean;
        image: string;
    };
    createdAt: Date;
    modifiedAt: Date;
    isReported: boolean;
}

type CommentContentNodeText = {
    type: 'text';
    text: string;
    key: string;
}
type CommentContentNodeLink = {
    type: 'link';
    text: string;
    url: string;
    isExternal: boolean;
    key: string;
}
type CommentContentNodeMention = {
    type: 'mention';
    text: string;
    username: string;
    key: string;
}
type CommentContentNodeEmoji = {
    type: 'emoji';
    text: string;
    imageUrl: string;
    key: string;
}

