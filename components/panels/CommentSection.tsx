import React, { forwardRef, memo, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, ViewStyle, RefreshControl } from 'react-native';
import Animated, { 
    Easing,
    useAnimatedStyle, 
    useDerivedValue, 
    withTiming 
} from 'react-native-reanimated';
import { Link } from 'expo-router';

import type { FlattenedComment } from '@/util/types';
import { relativeDate } from '@/util/functions';

import Heading from '../general/Heading';
import ListLoadMore from './ListLoadMore';

type CommentProps = {
    comment: FlattenedComment;
    isHighlighted?: boolean;
}

const Comment = memo(({
    comment,
    isHighlighted = false,
}: CommentProps) => {

    const COLOR_NOHIGHLIGHT = '#4177FF00';
    const COLOR_HIGHLIGHT = '#4177FF44';

    const highlightColor = useDerivedValue(() => {
        return withTiming(
            isHighlighted ? COLOR_HIGHLIGHT : COLOR_NOHIGHLIGHT,
            { duration: 700, easing: Easing.inOut(Easing.cubic) }
        );
    }, [isHighlighted]);

    const wrapperStyle = useAnimatedStyle(() => ({
        backgroundColor: highlightColor.value,
    }));

    return (<Animated.View style={[
        styles.commentWrapper,
        comment.isReply && styles.reply,
        comment.isLastInBlock && styles.commentLast,
        // comment.hasMoreToLoad && styles.replyMore,
        wrapperStyle,
    ]}>
        <Link href={`/users/${comment.author.username}`} style={styles.commentAvatarWrap}>
            <Image source={{ uri: comment.author.image }} style={styles.commentAvatar} />
        </Link>
        <View style={styles.commentRight}>
            <Text style={styles.authorStatus} numberOfLines={1}>
                <Link href={`/users/${comment.author.username}`} style={styles.mentionLink}>
                    @{ comment.author.username }
                </Link>
                { comment.replyTo && ` to @${comment.replyTo}` }
            </Text>
            <View style={styles.commentBubbleWrap}>
                <View style={styles.commentBubbleDeco} />
                <View style={styles.commentBubble}>
                    <Text style={styles.commentText} selectable>
                        { comment.content }
                    </Text>
                    <Text style={styles.commentSubtext}>
                        { relativeDate(comment.createdAt) }
                    </Text>
                </View>
            </View>
        </View>
    </Animated.View>);
});

type CommentSectionProps = {
    comments: FlattenedComment[];
    listStyle?: ViewStyle;
    header?: ReactElement;

    hasNextPage?: boolean;
    isLoading?: boolean;
    fetchNextPage?: () => void;
    isRefreshing?: boolean;
    handleRefresh?: () => void;
}

export type CommentSectionRef = {
    scrollToIndex: (index: number) => void;
};

const CommentSection = forwardRef(({
    comments,
    listStyle,
    header,

    hasNextPage = false,
    isLoading = false,
    fetchNextPage = () => {},
    isRefreshing = false,
    handleRefresh,
}: CommentSectionProps, ref?: React.ForwardedRef<CommentSectionRef>) => {
    const stickyHeader = <View style={[{
        marginTop: 50,
        pointerEvents: 'none',
    }]}>
        <View style={styles.header}>
            <Heading>Comments</Heading>
        </View>
    </View>;

    const listRef = useRef<FlatList<any>>(null);

    const isProgrammaticScroll = useRef(false);
    const highlightIdx = useRef<number|null>(null);
    const hightlightTimeout = useRef<any>(null);

    const [ isHighlighting, setHighlighting ] = useState(false);

    useImperativeHandle(ref, () => ({
        scrollToIndex: (index: number) => {
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
        }
    }));

    return (<View style={styles.container}>
        <FlatList
            data={[ null, ...comments ]}
            renderItem={({ item, index }) => {
                if (index === 0) return stickyHeader;
                return <Comment comment={item!} isHighlighted={index === highlightIdx.current && isHighlighting} />
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
                onRefresh={handleRefresh}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        borderBottomWidth: 1,
        backgroundColor: '#121212',
        borderBottomColor: '#262626',
    },

    commentsList: {
        flex: 1,
        width: '100%',
    },

    listContent: {
        paddingVertical: 0,
    },

    commentWrapper: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 16,
        paddingHorizontal: 16,
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

    commentRight: {
        gap: 8,
        flex: 1,
    },
    commentBubbleWrap: {
        flex: 1,
        flexDirection: "row",
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

    authorStatus: {
        fontSize: 14,
        fontWeight: 500,
        color: '#666',
        fontStyle: 'italic',
    },
    mentionLink: {
        color: "#71A3FF",
        fontWeight: 600,
        fontSize: 16,
        fontStyle: 'normal',
    },
});
