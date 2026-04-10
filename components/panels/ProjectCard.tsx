import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ICONS } from '@/util/assets';
import { DEFAULT_RIPPLE_CONFIG, PROJECT_CARD_THUMBNAIL_HEIGHT } from '@/util/constants';
import { shortNumber } from '@/util/functions';

type ProjectCardProps = {
    id: number;
    title: string;
    author: string;
    viewCount?: number;
    loveCount?: number;
    gridColumns?: number;
    onPress?: () => void;
};

const ProjectCard = ({
    id,
    title,
    author,
    viewCount,
    loveCount,
    gridColumns = 1,
    onPress,
}: ProjectCardProps) => {
    const ViewIcon = ICONS.statView;
    const LoveIcon = ICONS.statLove;

    const router = useRouter();

    return (
        <Pressable 
            style={[
                styles.container,
                gridColumns > 1 && styles.containerInsideGrid,
                gridColumns > 1 && { width: `${100 / gridColumns}%` },
            ]}
            android_ripple={DEFAULT_RIPPLE_CONFIG}
            onPress={onPress ?? (() => router.push(`/projects/${id}`))}
        >
            <Image 
                source={{ uri: `https://uploads.scratch.mit.edu/projects/thumbnails/${id}.png` }}
                style={styles.thumbnail} 
            />
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.author} numberOfLines={1}>@{author}</Text>
            <View style={styles.stats}>
                { !!viewCount && <View style={styles.stat}>
                    <Text style={styles.statText}>{shortNumber(viewCount)}</Text>
                    <ViewIcon style={styles.statIcon} />
                </View> }
                { !!loveCount && <View style={styles.stat}>
                    <Text style={styles.statText}>{shortNumber(loveCount)}</Text>
                    <LoveIcon style={styles.statIcon} />
                </View> }
            </View>
        </Pressable>
    );
};

export default ProjectCard;

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'column',
        gap: 4,
        height: PROJECT_CARD_THUMBNAIL_HEIGHT + 64,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    containerInsideGrid: {
        alignItems: 'center',
    },

    thumbnail: {
        aspectRatio: 4/3,
        height: PROJECT_CARD_THUMBNAIL_HEIGHT,
        objectFit: 'fill',
        borderRadius: 4,
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        maxWidth: PROJECT_CARD_THUMBNAIL_HEIGHT / 3 * 4,
        color: '#fff',
        marginBottom: 1,
    },
    author: {
        fontSize: 14,
        fontWeight: 500,
        color: '#888888',
    },
    stats: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        fontWeight: 500,
        color: '#888888',
    },
    statIcon: {
        width: 12,
        height: 12,
        opacity: 0.6,
    },
});
