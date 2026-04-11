import { Share, StyleSheet, View, Alert, AlertButton, Text } from 'react-native';
import * as Clipboard from "expo-clipboard";

import { buildMenu } from '@/util/functions';
import { WEBSITE_URL } from '@/util/constants';

import { useSheet } from '@/hooks/useSheet';
import { useToggleUserComments } from '@/hooks/mutations/useToggleUserComments';

import ContextMenu, { ContextMenuItem } from '@/components/general/ContextMenu';

export type UserOptionsMenuProps = {
    username: string;
    canReport?: boolean;
    canComment?: boolean;
    canToggleCommenting?: boolean;
    setCanComment?: (commentsAllowed: boolean) => void;
}

const UserOptionsMenu = ({
    username,
    canReport = true,
    canComment = true,
    canToggleCommenting = false,
    setCanComment,
}: UserOptionsMenuProps) => {

    const sheet = useSheet();

    const toggleCommentsAction = useToggleUserComments({
        username,
        onSuccess: (commentsAllowed) => {
            setCanComment?.(commentsAllowed);
        },
    });

    const getUrl = () => `${WEBSITE_URL}/users/${username}/`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(getUrl());
        sheet.pop();
    }

    const handleShare = async () => {
        sheet.pop();
        await Share.share({
            message: getUrl(),
            url: getUrl(),
        });
    }

    const handleToggleCommenting = async () => {
        sheet.pop();
        await toggleCommentsAction.mutate({ 
            from: canComment, 
            to: !canComment 
        });
    }

    const handleDefault = () => sheet.pop();

    const menu1: ContextMenuItem[] = [
        { key: 'copy', label: 'Copy link', onPress: handleCopy, icon: 'link' },
        { key: 'share', label: 'Share', onPress: handleShare, icon: 'share' },
    ];

    const menu2: ContextMenuItem[] = [];
    if (canToggleCommenting) 
        menu2.push({ 
            key: 'toggle-commenting', 
            label: `${canComment ? 'Disable' : 'Enable'} commenting`, 
            onPress: handleToggleCommenting, icon: 'comments' 
        });
    if (canReport) 
        menu2.push({ key: 'report', label: 'Report', onPress: handleDefault, isDanger: true, icon: 'report' });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.titleText}>
                        @{ username }
                    </Text>
                </View>
                <ContextMenu items={menu1} />
                <ContextMenu items={menu2} />
            </View>
        </View>
    );
};

export default buildMenu({
    render: (props: UserOptionsMenuProps) => <UserOptionsMenu {...props} />,
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
    titleText: {
        fontSize: 24,
        fontWeight: 600,
        color: '#fff',
    },
    titleWrapper: {
        flexDirection: 'row',
        marginBottom: 12,
        marginTop: 20,
    }
});
