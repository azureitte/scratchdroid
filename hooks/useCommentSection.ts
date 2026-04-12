import { 
    useCallback,
    useEffect,
    useRef, 
    useState 
} from 'react';
import type { FlatList } from 'react-native';

import { DEFAULT_REPLY_COUNT, REPLY_INCREMENT_COUNT } from '@/util/constants';
import type { Comment, FlattenedComment } from '@/util/types/comments.types';

import { useComments } from '@/hooks/queries/useComments';
import { useFocusEffect } from 'expo-router';
import { off, on } from '@/util/eventBus';

type UseCommentSectionProps = {
    type: 'project'|'user'|'studio';
    objectId: number;
    objectName?: string;
    author?: string;
    highlightedComment?: number;
}

export const useCommentSection = ({
    type,
    objectId,
    objectName,
    author,
    highlightedComment,
}: UseCommentSectionProps) => {

    const listRef = useRef<FlatList<any>>(null);

    const isProgrammaticScroll = useRef(false);
    const highlightIdx = useRef<number|null>(null);
    const hightlightTimeout = useRef<any>(null);
    const initPageFetchCount = useRef(0);

    const [ isHighlighting, setHighlighting ] = useState(false);

    // map between parent comment ID and how much replies have been revealed visually
    // (if not all replies are revealed, a "Show More Replies" button will be shown)
    const [ replyRevealMap, setReplyRevealMap ] = useState<Record<number, number>>({});


    let enabled = true;
    if (type === 'user' && !objectName) enabled = false;
    if (type === 'project' && (!objectId || !author)) enabled = false;

    const comments = useComments({
        type,
        objectId: type === 'user' ? undefined : objectId,
        objectName: type === 'user' ? objectName : undefined,
        author,
        highlightedComment,
        enabled,
    });

    const scrollToIndex = (index: number) => {
        const commentAtIndex = comments.data[index];
        if (!commentAtIndex) return;
        if (commentAtIndex.isReply) revealRepliesUntil(commentAtIndex.parent, commentAtIndex.replyIdx);

        try {
            index++;
            highlightIdx.current = index;
            isProgrammaticScroll.current = true;
            listRef.current?.scrollToIndex({ 
                index, 
                animated: true,
                viewPosition: 0.4,
            });
        } catch (e) {
            console.error(e);
        }
    }

    const scrollToComment = (commentId: number|string, data?: FlattenedComment[]) => {
        if (!data) data = comments.data;

        const comment = data.find(c => c.id === Number(commentId));
        if (comment) {
            const targetIdx = data.indexOf(comment);
            setTimeout(() => scrollToIndex(targetIdx), 0);
            return true;
        }
        return false;
    }

    // initial fetch
    useEffect(() => {
        enabled && comments.refresh();
    }, [enabled]);

    // scroll to target comment, if commentId param was provided
    useEffect(() => {
        if (comments.isFirstLoading) return;

        if (highlightedComment) {
            if (comments.flags.highlightsComments) {
                if (comments.highlightLoaded) scrollToComment(highlightedComment);
            } else {
                if (comments.data.length && !comments.isFirstLoading) {
                    // if has comment with provided id, resolve
                    const found = scrollToComment(highlightedComment);
                    if (found) return;
        
                    // if not, fetch comments until comment with provided id is found
                    // limit at 40 pages max
                    if (comments.hasNextPage && initPageFetchCount.current < 40) {
                        comments.fetchNextPage();
                        initPageFetchCount.current++;
                    }
                }
            }
        }
    }, [comments.highlightLoaded, comments.data, highlightedComment, comments.isFirstLoading]);


    // insert comments directly when recieved event
    const onAddComment = useCallback((comment?: Comment) => {
        if (!comment) return;
        let newData = comments.addCommentDirectly(comment);
        
        setTimeout(() => {
            if (comment.isReply || comments.flags.isOptimistic)
                scrollToComment(comment.id, newData);
            else
                scrollToIndex(0);
        }, 100);
    }, [comments.data]);

    const onDeleteComment = useCallback((comment: Comment) => {
        comments.deleteCommentDirectly(comment);
    }, [comments]);

    const onReplaceComment = useCallback((comment: Comment) => {
        comments.replaceCommentDirectly(comment);
    }, [comments]);

    useFocusEffect(() => {
        on('add-comment', onAddComment);
        on('delete-comment', onDeleteComment);
        on('replace-comment', onReplaceComment);
        return () => {
            off('add-comment', onAddComment);
            off('delete-comment', onDeleteComment);
            off('replace-comment', onReplaceComment);
        };
    });


    // reply revealing

    const getReplyRevealCount = (parentId: number) => {
        return replyRevealMap[parentId] ?? DEFAULT_REPLY_COUNT;
    }
    const revealMoreReplies = (parentId: number) => {
        setReplyRevealMap(prev => ({
            ...prev,
            [parentId]: (prev[parentId] ?? DEFAULT_REPLY_COUNT) + REPLY_INCREMENT_COUNT,
        }));
    }
    const revealRepliesUntil = (parentId: number, index: number) => {
        setReplyRevealMap(prev => ({
            ...prev,
            [parentId]: index+2,
        }));
    }
    const resetRevealedReplies = () => {
        setReplyRevealMap({});
    }


    const onListScrollEnd = () => {
        if (isProgrammaticScroll.current) {
            setHighlighting(true);
            if (hightlightTimeout.current) clearTimeout(hightlightTimeout.current);
            hightlightTimeout.current = setTimeout(() => {
                setHighlighting(false);
                hightlightTimeout.current = null;
                isProgrammaticScroll.current = false;
            }, 1000);
        }
    }

    const onListScrollFail = (index: number, averageItemLength: number) => {
        listRef.current?.scrollToOffset({
            offset: averageItemLength * index,
            animated: true,
        });
        setTimeout(() => {
            if (index >= comments.data.length) return;
            listRef.current?.scrollToIndex({ 
                index, 
                animated: true, 
                viewPosition: 0.4,
            });
        }, 100);
    }

    return {
        comments,
        isHighlighting,
        highlightIdx: highlightIdx.current ?? -1,
        refresh: comments.refresh,
        getReplyRevealCount,
        revealMoreReplies,
        revealRepliesUntil,
        resetRevealedReplies,
        listRef,
        onListScrollEnd,
        onListScrollFail,
    }

}