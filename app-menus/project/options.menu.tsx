import { Share, StyleSheet, View, Alert, AlertButton } from 'react-native';
import * as Clipboard from "expo-clipboard";

import { buildMenu } from '@/util/functions';

import { useSheet } from '@/hooks/useSheet';
import { useApi } from '@/hooks/useApi';
import { useToggleComments } from '@/hooks/mutations/useToggleComments';

import ContextMenu, { ContextMenuItem } from '@/components/general/ContextMenu';
import ScrollableText from '@/components/general/ScrollableText';

export type ProjectOptionsMenuProps = {
    projectId: number;
    projectTitle?: string;
    canRemix?: boolean;
    canReport?: boolean;
    canComment?: boolean;
    canToggleCommenting?: boolean;
    setCommentsAllowed?: (commentsAllowed: boolean) => void;
}

const ProjectOptionsMenu = ({
    projectId,
    projectTitle,
    canRemix = true,
    canReport = true,
    canComment = true,
    canToggleCommenting = false,
    setCommentsAllowed,
}: ProjectOptionsMenuProps) => {

    const sheet = useSheet();
    const api = useApi();

    const toggleCommentsAction = useToggleComments({
        type: 'project',
        objectId: projectId,
        onSuccess: (commentsAllowed) => {
            setCommentsAllowed?.(commentsAllowed);
        },
        onError: () => {
            setCommentsAllowed?.(canComment);
        },
    });

    const getUrl = () => `${api.config.websiteUrl}/projects/${projectId}`;

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
        { key: 'download', label: 'Download', onPress: handleDefault, icon: 'download' },
    ];

    const menu2: ContextMenuItem[] = [
        { key: 'add-studio', label: 'Add to studio', onPress: handleDefault, icon: 'add' },
    ];
    if (canRemix) 
        menu2.push({ key: 'remix', label: 'Remix', onPress: handleDefault, icon: 'remix' });
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
                    <ScrollableText style={styles.titleText}>
                        { projectTitle ?? '...' }
                    </ScrollableText>
                </View>
                <ContextMenu items={menu1} />
                <ContextMenu items={menu2} />
            </View>
        </View>
    );
};

export default buildMenu({
    render: (props: ProjectOptionsMenuProps) => <ProjectOptionsMenu {...props} />,
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
        marginRight: 56,
        color: '#fff',
        overflow: 'scroll',
    },
    titleWrapper: {
        flexDirection: 'row',
        marginBottom: 12,
        marginTop: 20,
    }
});
