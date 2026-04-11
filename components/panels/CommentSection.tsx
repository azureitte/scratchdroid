import React, { 
    forwardRef, 
    ReactElement,
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
import type { FlattenedComment } from '@/util/types/app/comments.types';

import { useSession } from '@/hooks/useSession';
import { useSheet } from '@/hooks/useSheet';

import Heading from '@/components/general/Heading';
import ListLoadMore from '@/components/panels/ListLoadMore';
import ListLoading from '@/components/panels/ListLoading';
import CommentItem from '@/components/panels/CommentItem';

import type { AddCommentMenuProps } from '@/app-menus/comments/add.menu';
import type { CommentOptionsMenuProps } from '@/app-menus/comments/options.menu';


export type CommentSectionRef = {
    scrollToIndex: (index: number) => void;
    revealRepliesUntil: (parentId: number, index: number) => void;
};

type CommentSectionProps = {
    type?:
        | 'user'
        | 'project'
        | 'studio';
    objectId: number;
    objectName?: string;

    comments: FlattenedComment[];
    listStyle?: ViewStyle;
    header?: ReactElement;
    isOwn?: boolean;
    canComment?: boolean;

    hasNextPage?: boolean;
    isLoading?: boolean;
    isFirstLoading?: boolean;
    fetchNextPage?: () => void;
    fetchReplies?: (parentId: number, from: number, limit: number) => void;
    isRefreshing?: boolean;
    handleRefresh?: () => void;
}

const CommentSection = forwardRef(({
    type = 'user',
    objectId,
    objectName,

    comments,
    listStyle,
    header,
    isOwn = false,
    canComment = true,

    hasNextPage = false,
    isLoading = false,
    isFirstLoading = false,
    fetchNextPage = () => {},
    fetchReplies,
    isRefreshing = false,
    handleRefresh,
}: CommentSectionProps, ref?: React.ForwardedRef<CommentSectionRef>) => {

    const { session } = useSession();
    const sheet = useSheet();

    const listRef = useRef<FlatList<any>>(null);

    const isProgrammaticScroll = useRef(false);
    const highlightIdx = useRef<number|null>(null);
    const hightlightTimeout = useRef<any>(null);

    const [ isHighlighting, setHighlighting ] = useState(false);

    // map between parent comment ID and how much replies have been revealed visually
    // (if not all replies are revealed, a "Show More Replies" button will be shown)
    const [ replyRevealMap, setReplyRevealMap ] = useState<Record<number, number>>({});

    const handleAddComment = () => {
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

    const stickyHeader = <View style={[{
        marginTop: 50,
    }]}>
        <View style={styles.header}>
            <Heading style={styles.headerTitle}>Comments</Heading>
            <Pressable
                onPress={() => {
                    if (!canComment) return;
                    handleAddComment();
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


    useImperativeHandle(ref, () => ({
        scrollToIndex: (index: number) => {
            const commentAtIndex = comments[index];
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
        },
        revealRepliesUntil: revealRepliesUntil,
    }));

    return (<View style={styles.container}>
        <FlatList
            data={[ null, ...comments ]}
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
                                if (fetchReplies) {
                                    await fetchReplies(item.parent, item.replyIdx + 1, REPLY_INCREMENT_COUNT);
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
            ListFooterComponent={isFirstLoading 
                ? <ListLoading />
                : <ListLoadMore
                    hasNextPage={hasNextPage}
                    isLoading={isLoading}
                    fetchNextPage={fetchNextPage}
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
