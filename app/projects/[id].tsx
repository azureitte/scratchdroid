import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    Image,
    Dimensions,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';

import { apiReq } from '@/util/api';
import { ScratchExtension, ScratchProject, ScratchProjectFile } from '@/util/types';
import { addPrefixUrl, dateShort, projectHasCloudVariables, truncateText } from '@/util/functions';

import { useSession } from '@/hooks/useSession';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';

import Heading from '@/components/general/Heading';
import CommentSection from '@/components/panels/CommentSection';
import { useInfiniteProjectComments } from '@/hooks/useInfiniteProjectComments';
import { LinearGradient } from 'expo-linear-gradient';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { ICONS, PNGS, SVGS } from '@/util/assets';

type ProjectPageHeaderProps = {
    project: ScratchProject;
    projectId: number;
    extensions?: ScratchExtension[];
    isCloud?: boolean;
    remixes: ScratchProject[];
    studios: any[],
    myUsername?: string;
}

type ExtensionChipProps = {
    name: string;
    icon: any;
    isSvg?: boolean;
}

const ExtensionChip = ({
    name,
    icon,
    isSvg = true,
}: ExtensionChipProps) => {
    const Icon = isSvg ? icon : ((props: any) => <Image
        source={icon}
        {...props}
    />);

    return (<View style={styles.extensionChip}>
        <Icon style={styles.extensionChipIcon} height={24} width={24} />
        <Text style={styles.extensionChipText}>{name}</Text>
    </View>);
};

const ProjectPageHeader = ({
    project,
    projectId,
    extensions = [],
    isCloud = false,
    remixes,
    studios,
    myUsername,
}: ProjectPageHeaderProps) => {

    const screen = useWindowDimensions();

    const projectWidth = Math.min(480, screen.width - 16);
    const projectHeight = (projectWidth / 4) * 3 + 45;

    const footerSectionGradient = <LinearGradient
        colors={['#1C1C1C', '#1C1C1C00']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.footerSectionGradient}
    />;

    const IconViewMore = ICONS.cardViewMore;

    const publishedStr = dateShort(new Date(project.history.shared));
    const modifiedStr = dateShort(new Date(project.history.modified));

    const publishedEqModified = publishedStr === modifiedStr;

    return (<View style={[styles.content]}>
        <View style={styles.titleSection}>
            <Image
                source={{ uri: addPrefixUrl(project.author.profile.images['60x60']) }}
                style={styles.authorAvatar}
            />
            <View style={styles.title}>
                <Text style={styles.titleText} numberOfLines={1}>
                    { project.title ?? '...' }  
                </Text>
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
            <WebView
                source={{
                    uri: `https://turbowarp.org/${project.id}/embed?addons=pause,mute-project&settings-button`,
                }}
                style={[styles.projectFrame, {
                    width: projectWidth,
                    height: projectHeight,
                }]}
                nestedScrollEnabled={true}
            />
        </View>

        <View style={styles.actionBar}>
            <Text style={{ color: '#fff', fontSize: 14 }}>
                Loves: { project.stats.loves }
                Favorites: { project.stats.favorites }
                Remixes: { project.stats.remixes }
                Views: { project.stats.views }
            </Text>
        </View>

        <View style={styles.contentCard}>
            { !!project.instructions && <>
                <Text style={styles.contentCardTitle}>Instructions</Text>
                <Text style={styles.contentCardText} selectable>
                    { truncateText(project.instructions, 400) }
                    { project.instructions.length > 400 && 
                        <Link href={`/projects/${projectId}/about`} style={styles.link}>
                            {'\nRead More'}
                        </Link> }
                </Text>
            </> }
            { !!project.description && <>
                <Text style={styles.contentCardTitle}>Notes & Credits</Text>
                <Text style={styles.contentCardText} selectable>
                    { truncateText(project.description, 400) }
                    { project.description.length > 400 && 
                    <Link href={`/projects/${projectId}/about`} style={styles.link}>
                        {'\nRead More'}
                    </Link> }
                </Text>
            </> }
            { !!extensions.length && <>
                <Text style={styles.contentCardTitle}>Extensions</Text>
                <View style={styles.extensionsBar}>
                    { extensions.includes('text2speech') && <ExtensionChip 
                        name="Text-to-Speech" 
                        icon={SVGS.project.extTts} 
                    /> }
                    { extensions.includes('videoSensing') && <ExtensionChip 
                        name="Video Sensing" 
                        icon={SVGS.project.extVideo} 
                    /> }
                    { extensions.includes('faceSensing') && <ExtensionChip 
                        name="Face Sensing" 
                        icon={SVGS.project.extFaceSensing} 
                    /> }
                    { extensions.includes('pen') && <ExtensionChip 
                        name="Pen" 
                        icon={SVGS.project.extPen} 
                    /> }
                    { extensions.includes('music') && <ExtensionChip 
                        name="Music" 
                        icon={SVGS.project.extMusic} 
                    /> }
                    { extensions.includes('translate') && <ExtensionChip 
                        name="Translate" 
                        icon={PNGS.project.extTranslate} 
                        isSvg={false}
                    /> }
                    { extensions.includes('makeymakey') && <ExtensionChip 
                        name="Makey Makey" 
                        icon={PNGS.project.extMakeymakey} 
                        isSvg={false}
                    /> }
                    { extensions.includes('microbit') && <ExtensionChip 
                        name="Micro:bit" 
                        icon={PNGS.project.extMicrobit} 
                        isSvg={false}
                    /> }
                    { extensions.includes('gdxfor') && <ExtensionChip 
                        name="Force and Acceleration" 
                        icon={SVGS.project.extGdxfor} 
                    /> }
                    { extensions.includes('ev3') && <ExtensionChip 
                        name="EV3" 
                        icon={SVGS.project.extEv3} 
                    /> }
                    { extensions.includes('wedo2') && <ExtensionChip 
                        name="WeDo 2.0" 
                        icon={PNGS.project.extWedo2}
                        isSvg={false}
                    /> }
                    { isCloud && <ExtensionChip 
                        name="Cloud Variables" 
                        icon={SVGS.project.cloud} 
                    /> }
                </View> 
            </> }

            <Text style={styles.contentCardSubtext}>
                { `Published on ${publishedStr}` }
                { !publishedEqModified && ` • Modified on ${modifiedStr}` }
            </Text>
        </View>

        

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

const ProjectPage = () => {

    const { id } = useLocalSearchParams<{ id: string }>();
    const { session } = useSession();
    const insets = useSafeAreaInsets();

    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const [ remixes, setRemixes ] = useState<ScratchProject[]>([]);
    const [ studios, setStudios ] = useState<any[]>([]);
    const [ projectFile, setProjectFile ] = useState<ScratchProjectFile|null>(null);

    useChangeAppStateOnFocus({
        footerVisible: false,
        primaryColor: 'regular',
    });
    
    const fetchProject = async () => {
        const projectRes = await apiReq<ScratchProject>({
            host: 'https://api.scratch.mit.edu',
            path: `/projects/${id}/`,
            auth: session?.user?.token,
            responseType: 'json',
        });
        if (!projectRes.success) throw new Error(projectRes.error);

        return projectRes.data;
    };


    const {
        data: project,
        isLoading,
        isError,
        error,
    } = useQuery<ScratchProject>({
        queryKey: ['project', id],
        queryFn: fetchProject,
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
    const comments = useInfiniteProjectComments({
        project: Number(id),
        author: project?.author.username ?? '',
        enabled: !!id && !!project?.author,
    });

    

    const fetchRemixes = async () => {
        const remixesRes = await apiReq<ScratchProject[]>({
            host: 'https://api.scratch.mit.edu',
            path: `/projects/${id}/remixes`,
            params: { limit: 6 },
            responseType: 'json',
        });
        if (remixesRes.success)
            return remixesRes.data;
        return [];
    };

    const fetchStudios = async (author: string) => {
        const studiosRes = await apiReq<any>({
            host: 'https://api.scratch.mit.edu',
            path: `/users/${author}/projects/${id}/studios`,
            params: { limit: 6 },
            responseType: 'json',
        });
        if (studiosRes.success)
            return studiosRes.data;
        return [];
    };

    const fetchProjectFile = async (token: string) => {
        const projectFileRes = await apiReq<ScratchProjectFile>({
            host: 'https://projects.scratch.mit.edu',
            path: `/${id}`,
            params: { token },
            responseType: 'json',
        });
        if (projectFileRes.success)
            return projectFileRes.data;
        return null;
    };

    const fetchAll = async () => {
        const [ _project, _remixes ] = await Promise.all([
            fetchProject(),
            fetchRemixes(),
        ]);
        const [ _studios, _projectFile ] = await Promise.all([
            fetchStudios(_project?.author?.username),
            fetchProjectFile(_project?.project_token),
            comments.refresh(),
        ]);
        setRemixes(_remixes);
        setStudios(_studios);
        setProjectFile(_projectFile);
    };

    // initial fetch
    useEffect(() => {
        fetchAll();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAll();
        setIsRefreshing(false);
    };

    const hasCloudData = useMemo(() => projectHasCloudVariables(projectFile), [projectFile]);

    if (isError) return <Text>{error.message}</Text>;
    if (isLoading || !project) return <ActivityIndicator />;

    return (
        <View style={[styles.container, { 
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
        }]}>
            <CommentSection 
                comments={comments.data}
                header={<ProjectPageHeader 
                    project={project}
                    projectId={Number(id)}
                    extensions={projectFile?.extensions ?? []}
                    isCloud={hasCloudData}
                    remixes={remixes}
                    studios={studios}
                    myUsername={session?.user?.username}
                />}
                hasNextPage={comments.hasNextPage}
                isLoading={comments.isLoading}
                fetchNextPage={comments.fetchNextPage}
                isRefreshing={isRefreshing}
                handleRefresh={handleRefresh}
                //ref={listRef}
            />
        </View>
    );
    
};

export default ProjectPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#121212',
    },


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
        color: '#fff',
        maxWidth: Dimensions.get('window').width - 90,
    },
    titleSubtext: {
        fontSize: 16,
        fontWeight: 500,
        color: '#888',
    },

    contentCard: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#1C1C1C',
        gap: 8,
    },
    contentCardTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#888',
        marginTop: 4,
    },
    contentCardText: {
        fontSize: 18,
        lineHeight: 28,
        fontWeight: 400,
        color: '#fff',
        marginBottom: 8,
    },
    contentCardSubtext: {
        fontSize: 16,
        color: '#888',
        fontWeight: 500,
        marginTop: 12,
        marginBottom: 8,
    },

    mentionLink: {
        color: "#71A3FF",
        fontWeight: 600,
        fontSize: 16,
        fontStyle: 'normal',
    },
    link: {
        color: "#71A3FF",
        fontWeight: 500,
        fontSize: 16,
        fontStyle: 'normal',
        textDecorationLine: 'underline',
    },

    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    extensionsBar: {
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: -2,
        flexWrap: 'wrap',
    },
    extensionChip: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
    },
    extensionChipIcon: {
        width: 24,
        height: 24,
    },
    extensionChipText: {
        fontSize: 16,
        fontWeight: 600,
        color: '#fff',
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
