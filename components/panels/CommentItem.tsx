import React, { 
    memo,
    useState 
} from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    Image,
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
import { relativeDate } from '@/util/functions';

import Button from '@/components/general/Button';
import { ICONS } from '@/util/assets';
import CommentContent from './CommentContent';

const COLOR_NOHIGHLIGHT = '#4177FF00';
const COLOR_HIGHLIGHT = '#4177FF44';

type CommentItemProps = {
    comment: FlattenedComment;
    isHighlighted?: boolean;
    isShowMore?: boolean;
    isIsolated?: boolean;
    onShowMore?: () => void;
    onReply?: () => void;
}

const CommentItem = memo(({
    comment,
    isHighlighted = false,
    isShowMore = false,
    isIsolated = false,
    onShowMore,
    onReply,
}: CommentItemProps) => {

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
        isIsolated && styles.commentIsolated,
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
                    <CommentContent 
                        content={comment.content} 
                        numberOfLines={isIsolated ? 1 : undefined} 
                    />
                    { !isIsolated && <Text style={styles.commentSubtext}>
                        { relativeDate(comment.createdAt) }
                    </Text> }
                    { !isShowMore && !isIsolated && <Pressable
                        onPress={onReply}
                        style={styles.commentReplyBtn}
                    >
                        <Text style={styles.commentReplyBtnText}>reply</Text>
                        <ReplyIcon style={styles.commentReplyBtnIcon} height={16} />
                    </Pressable> }
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

export default CommentItem;

const styles = StyleSheet.create({
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
    replyMore: {
        height: 50,
        overflow: 'hidden',
    },
    commentIsolated: {
        flex: 0,
        height: 70,
        width: '100%',
        paddingLeft: 0,
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderBottomWidth: 0,
        marginBottom: 0,
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
