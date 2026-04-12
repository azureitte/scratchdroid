import React, { 
    forwardRef, 
    ReactElement,
    useImperativeHandle, 
    useRef, 
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
import { DEFAULT_RIPPLE_CONFIG, REPLY_INCREMENT_COUNT } from '@/util/constants';
import type { FlattenedComment } from '@/util/types/comments.types';

import { useSession } from '@/hooks/useSession';
import { useSheet } from '@/hooks/useSheet';

import Heading from '@/components/general/Heading';
import ListLoadMore from '@/components/panels/ListLoadMore';
import ListLoading from '@/components/panels/ListLoading';
import CommentItem from '@/components/panels/CommentItem';

import type { AddCommentMenuProps } from '@/app-menus/comments/add.menu';
import type { CommentOptionsMenuProps } from '@/app-menus/comments/options.menu';
import { useCommentSection } from '@/hooks/useCommentSection';


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

    const {
        comments,
        isHighlighting,
        refresh,
        getReplyRevealCount,
        revealMoreReplies,
        resetRevealedReplies,
        listRef,
        onListScrollEnd,
        onListScrollFail,
    } = useCommentSection({
        type,
        objectId,
        objectName,
        author,
        highlightedComment,
    });

    const highlightIdx = useRef<number|null>(null);


    useImperativeHandle(ref, () => ({
        refresh,
    }));

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
                onListScrollFail(info.index, info.averageItemLength);
            }}
            onMomentumScrollEnd={onListScrollEnd}
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
