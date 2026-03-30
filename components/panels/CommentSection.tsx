import { memo, ReactElement } from 'react';
import { StyleSheet, Text, View, Image, FlatList, ViewStyle, RefreshControl } from 'react-native';
import { Link } from 'expo-router';

import type { FlattenedComment } from '@/util/types';
import { relativeDate } from '@/util/functions';

import Heading from '../general/Heading';
import ListLoadMore from './ListLoadMore';

type CommentProps = {
    comment: FlattenedComment;
}

const Comment = memo(({
    comment,
}: CommentProps) => (
    <View style={[
        styles.commentWrapper,
        comment.isReply && styles.reply,
        comment.isLastInBlock && styles.commentLast,
        // comment.hasMoreToLoad && styles.replyMore,
    ]}>
        <Image source={{ uri: comment.author.image }} style={styles.commentAvatar} />
        <View style={styles.commentRight}>
            <Link href={`/users/${comment.author.username}`} style={styles.mentionLink}>
                @{ comment.author.username }
            </Link>
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
    </View>
));

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

const CommentSection = ({
    comments,
    listStyle,
    header,

    hasNextPage = false,
    isLoading = false,
    fetchNextPage = () => {},
    isRefreshing = false,
    handleRefresh,
}: CommentSectionProps) => {
    const stickyHeader = <View style={[{
        marginTop: 50,
        pointerEvents: 'none',
    }]}>
        <View style={styles.header}>
            <Heading>Comments</Heading>
        </View>
    </View>

    return (<View style={styles.container}>
        <FlatList
            data={[ null, ...comments ]}
            renderItem={({ item, index }) => {
                if (index === 0) return stickyHeader;
                return <Comment comment={item!} />
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
        />
    </View>);
};

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

    commentAvatar: { 
        width: 42, 
        height: 42, 
        borderRadius: 8,
        marginRight: 10,
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

    mentionLink: {
        color: "#71A3FF",
        fontWeight: 600,
        fontSize: 16,
    },
});
