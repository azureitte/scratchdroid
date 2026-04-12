import { StyleSheet, View } from 'react-native';
import React from 'react';
import InfoCard from './InfoCard';
import { Project } from '@/util/types/projects.types';
import { shortDate } from '@/util/functions';
import ExtensionChip from './ExtensionChip';

type ProjectInfoCardProps = {
    project: Project;
    projectId: number;
    isFull?: boolean;
    onPress?: () => void;
}

const ProjectInfoCard = ({
    project,
    projectId,
    isFull = false,
    onPress,
}: ProjectInfoCardProps) => {
    const publishedStr = shortDate(project.history.shared);
    const modifiedStr = shortDate(project.history.modified);

    const publishedEqModified = publishedStr === modifiedStr;

    const hasExtensionsOrCloud = project.extensions.length > 0 || project.hasCloudData;

    return (
        <InfoCard
            sections={[
                { title: 'Instructions', text: project.instructions },
                { title: 'Notes & Credits', text: project.description },
            ]}
            childTitle={hasExtensionsOrCloud && 'Extensions'}
            subtext={
                `Published on ${publishedStr}` 
                + (!publishedEqModified ? ` • Modified on ${modifiedStr}` : '')
            }
            href={isFull ? undefined : `/projects/${projectId}/info`}
            variation={isFull ? 'full' : 'regular'}
            maxLength={isFull ? Infinity : undefined}
            onPress={onPress}
        >
            { hasExtensionsOrCloud && <View style={styles.extensionsBar}>
                { project.extensions.includes('text2speech') && <ExtensionChip extension="text2speech" /> }
                { project.extensions.includes('videoSensing') && <ExtensionChip extension="videoSensing" /> }
                { project.extensions.includes('faceSensing') && <ExtensionChip extension="faceSensing" /> }
                { project.extensions.includes('pen') && <ExtensionChip extension="pen" /> }
                { project.extensions.includes('music') && <ExtensionChip extension="music" /> }
                { project.extensions.includes('translate') && <ExtensionChip extension="translate" /> }
                { project.extensions.includes('makeymakey') && <ExtensionChip extension="makeymakey" /> }
                { project.extensions.includes('microbit') && <ExtensionChip extension="microbit" /> }
                { project.extensions.includes('gdxfor') && <ExtensionChip extension="gdxfor" /> }
                { project.extensions.includes('ev3') && <ExtensionChip extension="ev3" /> }
                { project.extensions.includes('wedo2') && <ExtensionChip extension="wedo2" /> }
                { project.hasCloudData && <ExtensionChip extension="cloud" /> }
            </View> }
        </InfoCard>
    );
};

export default ProjectInfoCard;

const styles = StyleSheet.create({
    extensionsBar: {
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: -2,
        flexWrap: 'wrap',
    },
});
