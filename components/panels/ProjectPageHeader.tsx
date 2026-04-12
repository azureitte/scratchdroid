import {
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    Image,
    Pressable,
} from 'react-native';
import WebView from 'react-native-webview';
import {  Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ScratchExtension } from '@/util/types/projects.types';
import { addPrefixUrl, shortDate, shortNumber } from '@/util/functions';
import { $u } from '@/util/thumbnailCaching';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { ICONS } from '@/util/assets';

import Heading from '@/components/general/Heading';
import Button from '@/components/general/Button';
import ScrollableText from '@/components/general/ScrollableText';
import ExtensionChip from '@/components/panels/ExtensionChip';
import InfoCard from '@/components/panels/InfoCard';
import LoveFavButton, { type StatProp } from '@/components/panels/LoveFavButton';
import { Project } from '@/util/types/projects.types';

type ProjectPageHeaderProps = {
    project: Project;
    projectId: number;

    loves: StatProp;
    favs: StatProp;
    remixes: Project[];
    studios: any[],
    isOwn?: boolean;
    webviewActive?: boolean;

    handleProjectOptions?: () => void;
    onInfoPress?: () => void;
}

const ProjectPageHeader = ({
    project,
    projectId,
    loves,
    favs,
    remixes,
    studios,
    isOwn = false,
    webviewActive = true,
    handleProjectOptions,
    onInfoPress,
}: ProjectPageHeaderProps) => {

    const screen = useWindowDimensions();
    const router = useRouter();

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

    const publishedStr = shortDate(project.history.shared);
    const modifiedStr = shortDate(project.history.modified);

    const publishedEqModified = publishedStr === modifiedStr;

    const hasExtensionsOrCloud = project.extensions.length > 0 || project.hasCloudData;

    return (<View style={[styles.content]}>
        <View style={styles.titleSection}>
            <Link href={`/users/${project.author.username}`} style={styles.authorAvatarWrap}>
                <Image
                    source={{ uri: $u(
                        project.author.images.large,
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
                    loves={loves}
                    favs={favs}
                />

                <View style={styles.stat}>
                    <IconRemix style={styles.statIcon} />
                    <Text style={styles.statText}>
                        { shortNumber(project.stats.remixes) }
                    </Text>
                </View>
                <View style={styles.stat}>
                    <IconView style={styles.statIcon} />
                    <Text style={styles.statText}>
                        { shortNumber(project.stats.views) }
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
            childTitle={hasExtensionsOrCloud && 'Extensions'}
            subtext={
                `Published on ${publishedStr}` 
                + (!publishedEqModified ? ` • Modified on ${modifiedStr}` : '')
            }
            href={`/projects/${projectId}/info`}
            onPress={onInfoPress}
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

        

        { (!!remixes.length || !!studios.length) && <View style={styles.footer}>
            { !!remixes.length && <Pressable 
                style={styles.footerSection}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
                onPress={() => {
                    router.push(`/projects/${projectId}/remixes`);
                }}
            >
                <Heading style={styles.footerTitle}>Remixes</Heading>
                <View style={styles.footerContentPartial}>
                    { remixes.map((remix) => <Image
                        key={remix.id}
                        style={[styles.footerThumbnail, styles.footerThumbnailProject]}
                        source={{ uri: addPrefixUrl(remix.images.tiny) }}
                    />) }
                </View>
                { footerSectionGradient }
                <IconViewMore style={styles.footerIcon} />
            </Pressable> }
            { !!studios.length && <Pressable 
                style={styles.footerSection}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
                onPress={() => {
                    router.push(`/projects/${projectId}/studios`);
                }}
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
