import { Share, StyleSheet, View, Alert, AlertButton } from 'react-native';
import * as Clipboard from "expo-clipboard";

import { buildMenu, commentContentToString } from '@/util/functions';
import { WEBSITE_URL } from '@/util/constants';
import type { FlattenedComment } from '@/util/types';

import { useSheet } from '@/hooks/useSheet';
import Button from '@/components/general/Button';
import CommentItem from '@/components/panels/CommentItem';
import type { AddCommentMenuProps } from './AddCommentMenu';
import { useDeleteUserComment } from '@/hooks/mutations/useDeleteUserComment';
import { emit } from '@/util/eventBus';

export type CommentOptionsMenuProps = {
    type: 
        | 'user'
        | 'project'
        | 'studio';
    objectId: number;
    objectName?: string;
    comment: FlattenedComment;
    canReply?: boolean;
    canDelete?: boolean;
    canReport?: boolean;
    getUrl?: () => string;
}

const CommentOptionsMenu = ({
    type,
    objectId,
    objectName,
    comment,
    canReply = true,
    canDelete = true,
    canReport = true,
    getUrl,
}: CommentOptionsMenuProps) => {
    const sheet = useSheet();

    const userAction = useDeleteUserComment({
        username: objectName!,
        onSuccess: (comment) => {
            sheet.pop();
            emit('delete-comment', comment);
        },
        onError: (error) => {
            sheet.pop();
            Alert.alert(
                'Cannot delete comment!',
                error,
                [{ text: 'OK' }],
                { cancelable: true }
            );
        },
    });

    const handleCopy = async () => {
        await Clipboard.setStringAsync(commentContentToString(comment.content));
        sheet.pop();
    }

    const handleShare = async () => {
        sheet.pop();
        await Share.share({
            message: WEBSITE_URL + (getUrl?.() ?? comment.id.toString()),
            url: WEBSITE_URL + (getUrl?.() ?? comment.id.toString()),
        });
    }

    const deleteComment = () => {
        if (type === 'user') 
            userAction.mutate({ 
                id: comment.id,
                parentId: comment.parent,
            });
    }

    const handleDelete = () => {
        const buttons: AlertButton[] = [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: deleteComment, style: 'destructive' },
        ]
        if (canReport) buttons.push({ text: 'Report', onPress: () => {} });

        let description = 'Are you sure you want to delete this comment?';
        if (canReport) description += ' If the comment is mean or disrespectful, please click report instead, to let the Scratch Team know about it.';

        Alert.alert(
            'Delete Comment?',
            description,
            buttons,
            { cancelable: true }
        );
    }

    const handleReport = () => {
        sheet.pop();
        Alert.alert(
            'Report Comment?',
            'Are you sure you want to report this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report', onPress: () => {}, style: 'destructive' },
            ],
            { cancelable: true }
        );
    }

    const handleReply = async () => {
        sheet.replace<AddCommentMenuProps>('addComment', {
            isReply: true,
            type,
            objectId,
            objectName,
            parentId: comment.parent ?? comment.id,
            replyToId: comment.author.id,
            replyToUsername: comment.author.username,
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.commentWrapper}>
                    <CommentItem comment={comment} isIsolated />
                </View>
                <Button text="Copy text" onPress={handleCopy} />
                <Button text="Share" onPress={handleShare} />
                { canReply && <Button text="Reply" onPress={handleReply} /> }
                { canDelete && <Button text="Delete" onPress={handleDelete} /> }
                { canReport && <Button text="Report" onPress={handleReport} /> }
            </View>
        </View>
    );
};

export default buildMenu({
    render: (props: CommentOptionsMenuProps) => <CommentOptionsMenu {...props} />,
    detents: ['auto', 1],
});

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        gap: 8,
    },
    commentWrapper: {
        flexDirection: 'row',
        marginBottom: 24,
        marginTop: 20,
    }
});
