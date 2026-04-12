import React, { 
    forwardRef, 
    ReactElement,
    useCallback,
    useEffect,
    useImperativeHandle, 
    useRef, 
    useState 
} from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    Image, 
    FlatList, 
    ViewStyle, 
    RefreshControl, 
    Pressable,
} from 'react-native';

import { longTap, sleep } from '@/util/functions';
import { $u } from '@/util/thumbnailCaching';
import { DEFAULT_REPLY_COUNT, DEFAULT_RIPPLE_CONFIG, REPLY_INCREMENT_COUNT } from '@/util/constants';
import type { Comment, FlattenedComment } from '@/util/types/comments.types';

import { useSession } from '@/hooks/useSession';
import { useSheet } from '@/hooks/useSheet';

import Heading from '@/components/general/Heading';
import ListLoadMore from '@/components/panels/ListLoadMore';
import ListLoading from '@/components/panels/ListLoading';
import CommentItem from '@/components/panels/CommentItem';

import type { AddCommentMenuProps } from '@/app-menus/comments/add.menu';
import type { CommentOptionsMenuProps } from '@/app-menus/comments/options.menu';
import { useComments } from '@/hooks/queries/useComments';
import { useFocusEffect } from 'expo-router';
import { off, on } from '@/util/eventBus';


export type CommentSectionRef = {
    refresh: () => void;
};

type CommentSectionProps = {
    type?:
        | 'user'
        | 'project'
        | 'studio';
    objectId: number;
    objectName?: string;
    author?: string;
    highlightedComment?: number;
    isOwn?: boolean;
    canComment?: boolean;

    listStyle?: ViewStyle;
    header?: ReactElement;

    isRefreshing?: boolean;
    handleRefresh?: () => void;
}

const CommentSection = forwardRef(({
    type = 'user',
    objectId,
    objectName,
    author,
    highlightedComment,

    listStyle,
    header,
    isOwn = false,
    canComment = true,

    isRefreshing = false,
    handleRefresh,
}: CommentSectionProps, ref?: React.ForwardedRef<CommentSectionRef>) => {

    const { session } = useSession();
    const sheet = useSheet();

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

    useImperativeHandle(ref, () => ({
        refresh: () => {
            comments.refresh();
        },
    }));

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

    const handleAddRootComment = () => {
        sheet.push<AddCommentMenuProps>('addComment', {
            isReply: false,
            type,
            objectId,
            objectName,
        });
    }

    const handleAddReply = (parentId: number, replyToId: number, replyToUsername: string) => {
        sheet.push<AddCommentMenuProps>('addComment', {
            isReply: true,
            type,
            objectId,
            objectName,
            parentId: parentId,
            replyToId: replyToId,
            replyToUsername: replyToUsername,
        });
    }

    const handleCommentOptions = (comment: FlattenedComment) => {
        longTap();
        sheet.push<CommentOptionsMenuProps>('commentOptions', { 
            comment,
            type,
            objectId,
            objectName,
            canDelete: isOwn,
            canReport: comment.author.id !== session?.user?.id,
            canReply: true,
            getUrl: () => (
                type === 'user' ? `/users/${objectName}/` :
                type === 'project' ? `/projects/${objectId}/` :
                type === 'studio' && `/studios/${objectId}/`
            ) + `#comments-${comment.id}`
        });
    }


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



    const stickyHeader = <View style={[{
        marginTop: 50,
    }]}>
        <View style={styles.header}>
            <Heading style={styles.headerTitle}>Comments</Heading>
            <Pressable
                onPress={() => {
                    if (!canComment) return;
                    handleAddRootComment();
                }}
                style={styles.addCommentWrap}
                android_ripple={ canComment 
                    ? DEFAULT_RIPPLE_CONFIG 
                    : undefined }
            >
                { canComment 
                    ? <>
                        <Image
                            source={{ uri: $u(session?.user?.thumbnailUrl!,
                                session?.user?.username!, session?.user?.id!) }}
                            style={styles.addCommentAvatar}
                        />
                        <Text style={styles.addCommentText}>
                            Leave a comment...
                        </Text>
                    </>
                    : <Text style={styles.addCommentText}>
                        Sorry, comment posting has been turned off here.
                    </Text> }
            </Pressable>
        </View>
    </View>;

    return (<View style={styles.container}>
        <FlatList
            data={[ null, ...comments.data ]}
            renderItem={({ item, index }: {
                item: FlattenedComment|null;
                index: number;
            }) => {
                if (index === 0 || item === null) return stickyHeader;
                if (item.isReply && getReplyRevealCount(item.parent) <= item.replyIdx) return null;
                return <Pressable
                    style={styles.commentPressableWrapper}
                    onLongPress={() => handleCommentOptions(item)}
                    delayLongPress={500}
                >
                    <CommentItem 
                        comment={item!} 
                        isHighlighted={index === highlightIdx.current && isHighlighting}
                        isShowMore={item.isReply && getReplyRevealCount(item.parent) === item.replyIdx + 1}
                        onShowMore={async () => {
                            if (item.isReply) {
                                if (comments.flags.fetchesReplies) {
                                    await comments.fetchRepliesFor(item.parent, item.replyIdx + 1, REPLY_INCREMENT_COUNT);
                                    await sleep(0);
                                }
                                revealMoreReplies(item.parent);
                            }
                        }}
                        onReply={() => {
                            handleAddReply(item.parent ?? item.id, Number(item.author.id), item.author.username)
                        }}
                    />
                </Pressable>
            }}
            keyExtractor={(item): any => item?.id}
            style={[styles.commentsList, listStyle]} 
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled
            stickyHeaderIndices={[1]}

            ListHeaderComponent={header}
            ListFooterComponent={comments.isFirstLoading 
                ? <ListLoading />
                : <ListLoadMore
                    hasNextPage={comments.hasNextPage}
                    isLoading={comments.isLoading}
                    fetchNextPage={comments.fetchNextPage}
                />
            }
            refreshControl={<RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                    resetRevealedReplies();
                    handleRefresh?.();
                }}
                progressViewOffset={60}
            />}

            initialNumToRender={5}
            windowSize={3}

            showsVerticalScrollIndicator={false}

            ref={listRef}

            onScrollToIndexFailed={(info) => {
                listRef.current?.scrollToOffset({
                    offset: info.averageItemLength * info.index,
                    animated: true,
                });
                setTimeout(() => {
                    if (info.index >= comments.data.length) return;
                    listRef.current?.scrollToIndex({ 
                        index: info.index, 
                        animated: true, 
                        viewPosition: 0.4,
                    });
                }, 100);
            }}

            onMomentumScrollEnd={() => {
                if (isProgrammaticScroll.current) {
                    setHighlighting(true);
                    if (hightlightTimeout.current) clearTimeout(hightlightTimeout.current);
                    hightlightTimeout.current = setTimeout(() => {
                        setHighlighting(false);
                        hightlightTimeout.current = null;
                        isProgrammaticScroll.current = false;
                    }, 1000);
                }
            }}
        />
    </View>);
});

export default CommentSection;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },

    header: {
        paddingVertical: 12,
        paddingBottom: 0,
        marginBottom: 24,
        backgroundColor: '#121212',
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
    },
    headerTitle: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
    },

    commentsList: {
        flex: 1,
        width: '100%',
    },

    listContent: {
        paddingVertical: 0,
    },

    addCommentWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#1C1C1C',
        borderRadius: 8,
        overflow: 'hidden',
        gap: 12,
    },
    addCommentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 8,
        objectFit: 'fill',
        opacity: 0.8,
    },
    addCommentText: {
        color: '#888',
        fontSize: 16,
        fontWeight: 400,
        fontStyle: 'italic',
    },

    commentPressableWrapper: {
        flex: 1,
    },
});
