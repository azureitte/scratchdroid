import { useState } from 'react';
import {
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    Image,
    Pressable,
} from 'react-native';
import WebView from 'react-native-webview';
import { Icon, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ScratchExtension, ScratchProject } from '@/util/types/api/project.types';
import { addPrefixUrl, shortDate } from '@/util/functions';
import { $u } from '@/util/thumbnailCaching';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { ICONS } from '@/util/assets';

import { useSheet } from '@/hooks/useSheet';
import { useLoveProject } from '@/hooks/mutations/useLoveProject';
import { useFavProject } from '@/hooks/mutations/useFavProject';

import Heading from '@/components/general/Heading';
import Button from '@/components/general/Button';
import ScrollableText from '@/components/general/ScrollableText';
import ExtensionChip from '@/components/panels/ExtensionChip';
import InfoCard from '@/components/panels/InfoCard';
import LoveFavButton from '@/components/panels/LoveFavButton';
import { ProjectOptionsMenuProps } from '@/components/menus/ProjectOptionsMenu';

type ProjectPageHeaderProps = {
    project: ScratchProject;
    projectId: number;
    extensions?: ScratchExtension[];
    isCloud?: boolean;
    lovedByMe?: boolean;
    favedByMe?: boolean;
    setLovedByMe?: (loved: boolean) => void;
    setFavedByMe?: (faved: boolean) => void;
    setCommentsAllowed?: (commentsAllowed: boolean) => void;
    remixes: ScratchProject[];
    studios: any[],
    myUsername?: string;
    webviewActive?: boolean;
    onInfoPress?: () => void;
}

const ProjectPageHeader = ({
    project,
    projectId,
    extensions = [],
    isCloud = false,
    lovedByMe = false,
    favedByMe = false,
    setLovedByMe,
    setFavedByMe,
    setCommentsAllowed,
    remixes,
    studios,
    myUsername,
    webviewActive = true,
    onInfoPress,
}: ProjectPageHeaderProps) => {

    const screen = useWindowDimensions();
    const sheet = useSheet();

    const loveAction = useLoveProject({
        projectId: project.id,
        onSuccess: (loved) => {
            setLovedByMe?.(loved);
        },
        onError: () => {
            setLovedByMe?.(!lovedByMe);
        },
    });
    const favAction = useFavProject({
        projectId: project.id,
        onSuccess: (faved) => {
            setFavedByMe?.(faved);
        },
        onError: () => {
            setFavedByMe?.(!favedByMe);
        },
    });

    const handleProjectOptions = () => {
        sheet.push<ProjectOptionsMenuProps>('projectOptions', { 
            projectId: project.id,
            projectTitle: project.title,
            canRemix: project.author.username !== myUsername,
            canReport: project.author.username !== myUsername,
            canComment: project.comments_allowed ?? true,
            canToggleCommenting: project.author.username === myUsername,
            setCommentsAllowed,
        });
    }

    const projectWidth = Math.min(480, screen.width - 16);
    const projectHeight = (projectWidth / 4) * 3 + 45;

    const footerSectionGradient = <LinearGradient
        colors={['#1C1C1C', '#1C1C1C00']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.footerSectionGradient}
    />;

    const IconViewMore = ICONS.cardViewMore;
    const IconRemix = ICONS.remix;
    const IconView = ICONS.view;

    const publishedStr = shortDate(new Date(project.history.shared));
    const modifiedStr = shortDate(new Date(project.history.modified));

    const publishedEqModified = publishedStr === modifiedStr;

    return (<View style={[styles.content]}>
        <View style={styles.titleSection}>
            <Link href={`/users/${project.author.username}`} style={styles.authorAvatarWrap}>
                <Image
                    source={{ uri: $u(
                        project.author.profile.images['60x60'],
                        project.author.username,
                        project.author.id,
                    ) }}
                    style={styles.authorAvatar}
                />
            </Link>
            <View style={styles.title}>
                <ScrollableText style={styles.titleText}>
                    { project.title ?? '...' }
                </ScrollableText>
                <Text style={styles.titleSubtext} numberOfLines={1}>
                    { 'by ' }
                    <Link href={`/users/${project.author.username}`} style={styles.mentionLink}>
                        @{project.author.username}
                    </Link>
                </Text>
            </View>
        </View>

        <View style={[styles.projectFrameWrap, {
            width: projectWidth,
            height: projectHeight,
        }]}>
            { webviewActive && <WebView
                source={{
                    uri: `https://turbowarp.org/${project.id}/embed?addons=pause,mute-project&settings-button`,
                }}
                style={[styles.projectFrame, {
                    width: projectWidth,
                    height: projectHeight,
                }]}
                nestedScrollEnabled={true}
            /> }
        </View>

        <View style={styles.actionBar}>
            <View style={styles.stats}>
                <LoveFavButton
                    loves={{
                        count: project.stats.loves,
                        active: lovedByMe,
                        loading: loveAction.isPending,
                        onPress: () => {
                            setLovedByMe?.(!lovedByMe); // optimistic update
                            loveAction.mutate({ from: lovedByMe, to: !lovedByMe });
                        }
                    }}
                    favs={{
                        count: project.stats.favorites,
                        active: favedByMe,
                        loading: favAction.isPending,
                        onPress: () => {
                            setFavedByMe?.(!favedByMe); // optimistic update
                            favAction.mutate({ from: favedByMe, to: !favedByMe });
                        }
                    }}
                />

                <View style={styles.stat}>
                    <IconRemix style={styles.statIcon} />
                    <Text style={styles.statText}>
                        { project.stats.remixes }
                    </Text>
                </View>
                <View style={styles.stat}>
                    <IconView style={styles.statIcon} />
                    <Text style={styles.statText}>
                        { project.stats.views }
                    </Text>
                </View>
            </View>

            <Button
                icon="more"
                onPress={handleProjectOptions}
            />
        </View>

        <InfoCard
            sections={[
                { title: 'Instructions', text: project.instructions },
                { title: 'Notes & Credits', text: project.description },
            ]}
            childTitle={extensions.length > 0 && 'Extensions'}
            subtext={
                `Published on ${publishedStr}` 
                + (!publishedEqModified ? ` • Modified on ${modifiedStr}` : '')
            }
            href={`/projects/${projectId}/info`}
            onPress={onInfoPress}
        >
            { extensions.length > 0 && <View style={styles.extensionsBar}>
                { extensions.includes('text2speech') && <ExtensionChip extension="text2speech" /> }
                { extensions.includes('videoSensing') && <ExtensionChip extension="videoSensing" /> }
                { extensions.includes('faceSensing') && <ExtensionChip extension="faceSensing" /> }
                { extensions.includes('pen') && <ExtensionChip extension="pen" /> }
                { extensions.includes('music') && <ExtensionChip extension="music" /> }
                { extensions.includes('translate') && <ExtensionChip extension="translate" /> }
                { extensions.includes('makeymakey') && <ExtensionChip extension="makeymakey" /> }
                { extensions.includes('microbit') && <ExtensionChip extension="microbit" /> }
                { extensions.includes('gdxfor') && <ExtensionChip extension="gdxfor" /> }
                { extensions.includes('ev3') && <ExtensionChip extension="ev3" /> }
                { extensions.includes('wedo2') && <ExtensionChip extension="wedo2" /> }
                { isCloud && <ExtensionChip extension="cloud" /> }
            </View> }
        </InfoCard>

        

        { (!!remixes.length || !!studios.length) && <View style={styles.footer}>
            { !!remixes.length && <Pressable 
                style={styles.footerSection}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
            >
                <Heading style={styles.footerTitle}>Remixes</Heading>
                <View style={styles.footerContentPartial}>
                    { remixes.map((remix) => <Image
                        key={remix.id}
                        style={[styles.footerThumbnail, styles.footerThumbnailProject]}
                        source={{ uri: addPrefixUrl(remix.images['100x80']) }}
                    />) }
                </View>
                { footerSectionGradient }
                <IconViewMore style={styles.footerIcon} />
            </Pressable> }
            { !!studios.length && <Pressable 
                style={styles.footerSection}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
            >
                <Heading style={styles.footerTitle}>Studios</Heading>
                <View style={styles.footerContentPartial}>
                    { studios.map((studio) => <Image
                        key={studio.id}
                        style={[styles.footerThumbnail, styles.footerThumbnailStudio]}
                        source={{ uri: addPrefixUrl(studio.image) }}
                    />) }
                </View>
                { footerSectionGradient }
                <IconViewMore style={styles.footerIcon} />
            </Pressable> }
        </View> }
    </View>);

}

export default ProjectPageHeader;

const styles = StyleSheet.create({
    content: {
        gap: 8,
    },

    projectFrame: {
        flex: 0,
        backgroundColor: 'transparent',
    },
    projectFrameWrap: {
        overflow: 'hidden',
        borderRadius: 8,
        marginHorizontal: 'auto',
    },
    

    authorAvatarWrap: {
        width: 48,
        height: 48,
    },
    authorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },

    titleSection: {
        marginTop: 70,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    title: {
        gap: 2,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 600,
        marginRight: 56,
        color: '#fff',
        overflow: 'scroll',
    },
    titleSubtext: {
        fontSize: 16,
        fontWeight: 500,
        color: '#888',
    },

    mentionLink: {
        color: "#93C0FF",
        fontWeight: 600,
        fontSize: 16,
        fontStyle: 'normal',
    },

    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 8,
    },

    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        width: 24,
        height: 24,
    },
    statText: {
        fontSize: 16,
        fontWeight: 500,
        color: '#fff',
    },

    extensionsBar: {
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: -2,
        flexWrap: 'wrap',
    },

    footer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 8,
    },
    footerSection: {
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        gap: 12,
        backgroundColor: '#1C1C1C',
        paddingVertical: 8,
        paddingHorizontal: 16,
        paddingRight: 0,
        borderRadius: 12,
        height: 120,
        overflow: 'hidden',
    },
    footerTitle: {
        fontSize: 20,
    },
    footerIcon: {
        position: 'absolute',
        right: 8,
        top: 10,
        width: 24,
        height: 24,
    },
    footerContentPartial: {
        width: '100%',
        flexDirection: 'row',
        overflow: 'hidden',
        gap: 4,
    },
    footerThumbnail: {
        borderRadius: 8,
        opacity: 0.7,
        overflow: 'hidden',
    },
    footerThumbnailProject: {
        height: 60,
        aspectRatio: 4/3,
        objectFit: 'fill',
    },
    footerThumbnailStudio: {
        height: 60,
        aspectRatio: 17/10,
        objectFit: 'fill',
    },

    footerSectionGradient: {
        position: 'absolute',
        top: 0,
        width: 100,
        bottom: 0,
        right: 0,
    },
});
