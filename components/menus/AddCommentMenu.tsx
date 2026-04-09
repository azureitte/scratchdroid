import { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

import { buildMenu } from '@/util/functions';
import { $u } from '@/util/thumbnailCaching';
import { emit } from '@/util/eventBus';

import { useSheet } from '@/hooks/useSheet';
import { useSession } from '@/hooks/useSession';
import { useAddUserComment } from '@/hooks/mutations/useAddUserComment';
import { useAddModernComment } from '@/hooks/mutations/useAddModernComment';

import Button from '@/components/general/Button';
import TextArea from '@/components/general/TextArea';

export type AddCommentMenuProps = {
    type: 
        | 'user'
        | 'project'
        | 'studio';
    objectId: number;
    objectName?: string;
}&({
    isReply?: false;
    parentId?: undefined;
    replyToId?: undefined;
    replyToUsername?: undefined;
}|{
    isReply: true;
    parentId: number;
    replyToId: number;
    replyToUsername: string;
});

const AddCommentMenu = ({
    type,
    objectId,
    objectName,
    isReply = false,
    ...replyOpts
}: AddCommentMenuProps) => {

    const sheet = useSheet();
    const { session } = useSession();

    const [ commentText, setCommentText ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');

    const userAction = useAddUserComment({
        username: objectName!,
        onSuccess: (comment) => {
            setErrorMessage('');
            emit('add-comment', comment);
            sheet.pop();
        },
        onError: (error) => {
            setErrorMessage(error);
        },
    });

    const projectAction = useAddModernComment({
        type: 'project',
        objectId: Number(objectId),
        onSuccess: (comment) => {
            setErrorMessage('');
            emit('add-comment', comment);
            sheet.pop();
        },
        onError: (error) => {
            setErrorMessage(error);
        },
    });

    const action = 
        type === 'user' ? userAction :
        type === 'project' ? projectAction :
        undefined;

    return (
        <View style={[styles.container]}>
            <Text style={styles.title}>
                { isReply ? `Reply to @${replyOpts.replyToUsername}` : 'New comment' }
            </Text>
            <View style={styles.commentBox}>
                <Image
                    source={{ uri: $u(session!.user!.thumbnailUrl,
                        session!.user!.username, session!.user!.id) }}
                    style={styles.avatar}
                />
                <TextArea
                    placeholder='Write something worth sharing...'
                    value={commentText}
                    onChangeText={setCommentText}
                    autoFocus={true}
                    maxLength={500}
                />
            </View>
            { errorMessage && <Text style={styles.errorText}>{errorMessage}</Text> }
            <View style={styles.buttonRow}>
                <Button 
                    text={isReply ? 'Reply' : 'Post'}
                    onPress={() => {
                        setErrorMessage('');
                        action?.mutate({ 
                            content: commentText,
                            parentId: replyOpts.parentId,
                            replyToId: replyOpts.replyToId,
                        })
                    }}
                    isLoading={action?.isPending}
                    isDisabled={!action}
                    variation='big' 
                    role='primary'
                    fullWidth
                />
            </View>
        </View>
    );
};

export default buildMenu({
    render: (props: AddCommentMenuProps) => <AddCommentMenu {...props} />,
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 0,
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 600,
        marginHorizontal: 8,
        marginTop: 16,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 12,
    },
    commentBox: {
        flexDirection: 'row',
        gap: 12,
    },
    avatar: {
        width: 42, 
        height: 42, 
        borderRadius: 8,
        objectFit: 'fill',
    },
    errorText: {
        color: '#fff',
        backgroundColor: '#c40',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 54,
    },
});
