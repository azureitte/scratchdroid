import { useEffect, useRef, useState } from 'react';
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
    const insets = useSafeAreaInsets();

    const [ commentText, setCommentText ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');

    const userAction = useAddUserComment({
        username: objectName!,
        onSuccess: (comment) => {
            setErrorMessage('');
            sheet.pop();
        },
        onError: (error) => {
            setErrorMessage(error);
        },
    });

    const action = type === 'user' ? userAction : undefined;

    return (
        <View style={[styles.container, {
            paddingBottom: insets.bottom + 12,
        }]}>
            <Text style={styles.title}>
                { isReply ? `Reply to @${replyOpts.replyToUsername}` : 'New comment' }
            </Text>
            { errorMessage && <Text style={styles.errorText}>{errorMessage}</Text> }
            <TextInput
                placeholder='Write something worth sharing...'
                multiline={true}
                style={styles.input}
                placeholderTextColor="#a4a4a4" 
                value={commentText}
                onChangeText={setCommentText}
                autoFocus={true}
            />
            <View style={styles.buttonRow}>
                <Button 
                    text="Post" 
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
    },
    input: {
        flex: 1,
        minHeight: 120,
        backgroundColor: '#272727',
        color: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 18,
        textAlignVertical: 'top',
        marginBottom: 8,
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
