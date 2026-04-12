import { Share, StyleSheet, View, Alert, AlertButton } from 'react-native';
import * as Clipboard from "expo-clipboard";

import { buildMenu } from '@/util/functions';
import { commentContentToString, unflattenComment } from '@/util/parsing/comments';
import { WEBSITE_URL } from '@/util/constants';
import { emit } from '@/util/eventBus';
import type { FlattenedComment } from '@/util/types/comments.types';

import { useSheet } from '@/hooks/useSheet';
import { useDeleteComment } from '@/hooks/mutations/useDeleteComment';
import { useReportComment } from '@/hooks/mutations/useReportComment';

import type { AddCommentMenuProps } from './add.menu';

import ContextMenu, { type ContextMenuItem } from '@/components/general/ContextMenu';
import CommentItem from '@/components/panels/CommentItem';

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

    const displayDeleteError = (error: string) => {
        sheet.pop();
        Alert.alert(
            'Cannot delete comment!',
            error,
            [{ text: 'OK' }],
            { cancelable: true }
        );
    }

    const displayReportError = (error: string) => {
        sheet.pop();
        Alert.alert(
            'Cannot report comment!',
            error,
            [{ text: 'OK' }],
            { cancelable: true }
        );
    }

    const displayReportSuccess = () => {
        sheet.pop();
        Alert.alert(
            'Done!',
            'The comment has been reported, and the Scratch Team has been notified.',
            [{ text: 'OK' }],
            { cancelable: true }
        );
    }

    const deleteAction = useDeleteComment({
        type,
        objectId,
        objectName,
        onSuccess: (newComment) => {
            emit('delete-comment', newComment ?? comment);
            sheet.pop();
        },
        onError: displayDeleteError,
    });

    const reportAction = useReportComment({
        type,
        objectId,
        objectName,
        onSuccess: (newComment) => {
            if (!newComment) newComment = unflattenComment({ ...comment, isReported: true })
            emit('replace-comment', newComment);
            displayReportSuccess();
            sheet.pop();
        },
        onError: displayReportError,
    });

    const deleteComment = () => {
        deleteAction.mutate({ 
            id: comment.id,
            parentId: comment.parent,
        });
    }

    const reportComment = () => {
        reportAction.mutate({ 
            id: comment.id,
            parentId: comment.parent,
        });
    }


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
    

    const handleDelete = () => {
        const buttons: AlertButton[] = [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: deleteComment, style: 'destructive' },
        ]
        if (canReport) buttons.splice(1, 0, { text: 'Report', onPress: () => reportComment });

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
                { text: 'Report', onPress: reportComment, style: 'destructive' },
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

    const menu1: ContextMenuItem[] = [
        { key: 'copy', label: 'Copy text', onPress: handleCopy, icon: 'copy' },
        { key: 'share', label: 'Share', onPress: handleShare, icon: 'share' },
    ];

    const menu2: ContextMenuItem[] = [];
    if (canReply) menu2.push({ key: 'reply', label: 'Reply', onPress: handleReply, icon: 'replyAlt' });
    if (canDelete) menu2.push({ key: 'delete', label: 'Delete', onPress: handleDelete, isDanger: true, icon: 'delete' });
    if (canReport) menu2.push({ key: 'report', label: 'Report', onPress: handleReport, isDanger: true, icon: 'report' });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.commentWrapper}>
                    <CommentItem comment={comment} isIsolated />
                </View>
                <ContextMenu items={menu1} />
                { menu2.length > 0 && <ContextMenu items={menu2} /> }
            </View>
        </View>
    );
};

export default buildMenu({
    render: (props: CommentOptionsMenuProps) => <CommentOptionsMenu {...props} />,
    detents: ['auto', 1],
    isDark: true,
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
