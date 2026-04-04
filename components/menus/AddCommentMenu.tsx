import { useState } from 'react';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buildMenu } from '@/util/functions';
import { useSheet } from '@/hooks/useSheet';
import Button from '@/components/general/Button';
import { useAddUserComment } from '@/hooks/useAddUserComment';

export type AddCommentMenuProps = {
    type: 
        | 'user'
        | 'project'
        | 'studio';
    objectId: number;
    objectName?: string;
}&({
    isReply?: false;
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
    const insets = useSafeAreaInsets();

    const [ commentText, setCommentText ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');

    const action = useAddUserComment({
        username: objectName!,
        onSuccess: (comment) => {
            setErrorMessage('');
            sheet.pop();
        },
        onError: (error) => {
            setErrorMessage(error);
        },
    });

    return (
        <View style={[styles.container, {
            paddingBottom: insets.bottom,
        }]}>
            <Text style={{ color: '#fff' }}>{type}</Text>
            <TextInput
                placeholder='Comment'
                multiline={true}
                style={styles.input}
                value={commentText}
                onChangeText={setCommentText}
            />
            { errorMessage && <Text style={styles.errorText}>{errorMessage}</Text> }
            <View style={styles.buttonRow}>
                <Button 
                    text="Post" 
                    onPress={() => {
                        setErrorMessage('');
                        action.mutate({ 
                            content: commentText,
                            parentId: isReply ? (replyOpts as any).parentId : undefined,
                            replyToId: isReply ? (replyOpts as any).replyToId : undefined,
                        })
                    }}
                    isLoading={action.isPending}
                    variation='big' 
                    role='primary'
                    fullWidth
                />
            </View>
        </View>
    );
};

export default buildMenu({
    title: 'Leave a comment',
    render: (props: AddCommentMenuProps) => <AddCommentMenu {...props} />,
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    input: {
        flex: 1,
        minHeight: 100,
    },
    errorText: {
        color: '#fff',
        backgroundColor: '#c40',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
});
