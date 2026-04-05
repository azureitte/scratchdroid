import React, { 
    forwardRef, 
    memo, 
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
    Pressable
} from 'react-native';
import Animated, { 
    Easing,
    useAnimatedStyle, 
    useDerivedValue, 
    withTiming 
} from 'react-native-reanimated';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import type { FlattenedComment } from '@/util/types';
import { addPrefixUrl, relativeDate } from '@/util/functions';
import { DEFAULT_REPLY_COUNT, DEFAULT_RIPPLE_CONFIG, REPLY_INCREMENT_COUNT } from '@/util/constants';

import { useSheet } from '@/hooks/useSheet';

import Heading from '@/components/general/Heading';
import ListLoadMore from '@/components/panels/ListLoadMore';
import Button from '@/components/general/Button';
import type { AddCommentMenuProps } from '@/components/menus/AddCommentMenu';
import { useSession } from '@/hooks/useSession';
import { ICONS } from '@/util/assets';

const COLOR_NOHIGHLIGHT = '#4177FF00';
const COLOR_HIGHLIGHT = '#4177FF44';

type CommentProps = {
    comment: FlattenedComment;
    isHighlighted?: boolean;
    isShowMore?: boolean;
    onShowMore?: () => void;
    onReply?: () => void;
}

const Comment = memo(({
    comment,
    isHighlighted = false,
    isShowMore = false,
    onShowMore,
    onReply,
}: CommentProps) => {

    const [ isFetching, setIsFetching ] = useState(false);

    const highlightColor = useDerivedValue(() => {
        return withTiming(
            isHighlighted ? COLOR_HIGHLIGHT : COLOR_NOHIGHLIGHT,
            { duration: 700, easing: Easing.inOut(Easing.cubic) }
        );
    }, [isHighlighted]);

    const wrapperStyle = useAnimatedStyle(() => ({
        backgroundColor: highlightColor.value,
    }));

    const ReplyIcon = ICONS.reply;

    return (<Animated.View style={[
        styles.commentWrapper,
        comment.isReply && styles.reply,
        comment.isLastInBlock && styles.commentLast,
        wrapperStyle,
    ]}>
        <Link href={`/users/${comment.author.username}`} style={[
                styles.commentAvatarWrap,
                comment.isHighlighted && styles.commentAvatarHighlight,
            ]}>
            <Image source={{ uri: comment.author.image }} style={styles.commentAvatar} />
        </Link>
        <View style={styles.commentRight}>
            { comment.isHighlighted && <View style={styles.commentBadge}>
                <Text style={styles.commentBadgeText}>
                    { comment.isReply ? 'Highlighted reply' : 'Highlighted comment' }
                </Text>
            </View> }

            <Text style={styles.authorStatus} numberOfLines={1}>
                <Link href={`/users/${comment.author.username}`} style={styles.mentionLink}>
                    @{ comment.author.username }
                </Link>
                { comment.replyTo && ` to @${comment.replyTo}` }
            </Text>
            <View style={[
                styles.commentBubbleWrap,
                isShowMore && styles.replyMore,
            ]}>
                <View style={styles.commentBubbleDeco} />
                <View style={styles.commentBubble}>
                    <Text style={styles.commentText} selectable>
                        { comment.content }
                    </Text>
                    <Text style={styles.commentSubtext}>
                        { relativeDate(comment.createdAt) }
                    </Text>
                    <Pressable
                        onPress={onReply}
                        style={styles.commentReplyBtn}
                    >
                        <Text style={styles.commentReplyBtnText}>reply</Text>
                        <ReplyIcon style={styles.commentReplyBtnIcon} height={16} />
                    </Pressable>
                </View>
            </View>
            { isShowMore && <LinearGradient
                colors={['#12121200', '#121212']}
                style={styles.commentReplyFade}
            /> }
            { isShowMore && <Button
                text="More Replies"
                onPress={async () => {
                    setIsFetching(true);
                    await onShowMore?.();
                    setIsFetching(false);
                }}
                role="secondary"
                isLoading={isFetching}
            /> }
        </View>
    </Animated.View>);
});


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

    hasNextPage?: boolean;
    isLoading?: boolean;
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

    hasNextPage = false,
    isLoading = false,
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

    const stickyHeader = <View style={[{
        marginTop: 50,
    }]}>
        <View style={styles.header}>
            <Heading style={styles.headerTitle}>Comments</Heading>
            <Pressable
                onPress={handleAddComment}
                style={styles.addCommentWrap}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
            >
                <Image
                    source={{ uri: addPrefixUrl(session?.user?.thumbnailUrl!) }}
                    style={styles.addCommentAvatar}
                />
                <Text style={styles.addCommentText}>Leave a comment...</Text>
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
                console.log(e);
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
                return <Comment 
                    comment={item!} 
                    isHighlighted={index === highlightIdx.current && isHighlighting}
                    isShowMore={item.isReply && getReplyRevealCount(item.parent) === item.replyIdx + 1}
                    onShowMore={async () => {
                        if (item.isReply) {
                            await fetchReplies?.(item.parent, item.replyIdx + 1, REPLY_INCREMENT_COUNT);
                            revealMoreReplies(item.parent);
                        }
                    }}
                    onReply={() => {
                        handleAddReply(item.parent ?? item.id, Number(item.author.id), item.author.username)
                    }}
                />
            }}
            keyExtractor={(item): any => item?.id}
            style={[styles.commentsList, listStyle]} 
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled
            stickyHeaderIndices={[1]}

            ListHeaderComponent={header}
            ListFooterComponent={<ListLoadMore
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                fetchNextPage={fetchNextPage}
            />}
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

    commentWrapper: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 16,
        paddingHorizontal: 16,
        position: 'relative',
    },
    reply: {
        paddingLeft: 64,
    },
    commentLast: {
        paddingBottom: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
    },
    commentHighlighted: {
        backgroundColor: '#4177ff44',  
    },
    replyMore: {
        height: 50,
        overflow: 'hidden',
    },

    commentAvatarWrap: {
        display: 'flex',
        width: 42, 
        height: 42,
        marginRight: 10,
    },
    commentAvatar: { 
        width: 42, 
        height: 42, 
        borderRadius: 8,
    },
    commentAvatarHighlight: {
        marginTop: 24,
    },

    commentRight: {
        gap: 8,
        flex: 1,
    },
    commentBubbleWrap: {
        flex: 1,
        flexDirection: "row",
    },

    commentBadge: {
        flexDirection: "row",
    },
    commentBadgeText: {
        color: "#ffffff9e",
        fontSize: 12,
        backgroundColor: "#ffffff22",
        paddingHorizontal: 8,
        height: 16,
        borderRadius: 4,
        flex: 0,
    },

    commentBubbleDeco: {
        width: 20,
        height: 16,
        borderBottomStartRadius: 16,
        backgroundColor: "#212121",
        borderWidth: 2,
        borderEndColor: "#212121",
        marginRight: -2.5,
        zIndex: 1,
        borderColor: "#353535",
    },
    commentBubble: {
        padding: 16,
        paddingBottom: 12,
        minHeight: 58,
        borderRadius: 8,
        borderTopStartRadius: 0,
        backgroundColor: "#212121",
        borderWidth: 2,
        borderColor: "#353535",
        flex: 1,
    },
    commentText: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: 400,
        color: "#fff",
    },
    commentSubtext: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: 400,
        color: "#6C6C6C",
    },

    commentReplyBtn: {
        position: 'absolute',
        bottom: -10,
        right: 8,
        paddingLeft: 40,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        // backgroundColor: '#fff',
    },
    commentReplyBtnText: {
        fontSize: 14,
        fontWeight: 600,
        color: '#93C0FF',
    },
    commentReplyBtnIcon: {
        marginLeft: 2,
    },

    commentReplyFade: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        height: 80,
    },

    authorStatus: {
        fontSize: 14,
        fontWeight: 500,
        color: '#666',
        fontStyle: 'italic',
    },
    mentionLink: {
        color: "#93C0FF",
        fontWeight: 600,
        fontSize: 16,
        fontStyle: 'normal',
    },
});
