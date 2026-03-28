import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PROJECT_CARD_THUMBNAIL_HEIGHT } from '@/util/constants';

type StudioCardProps = {
    id: number;
    title: string;
    onPress?: () => void;
};

const StudioCard = ({
    id,
    title,
    onPress,
}: StudioCardProps) => {
    const router = useRouter();

    return (
        <Pressable 
            style={styles.container}
            android_ripple={{ color: "#fff3", foreground: true }}
            onPress={onPress ?? (() => router.push(`/studios/${id}`))}
        >
            <Image 
                source={{ uri: `https://uploads.scratch.mit.edu/galleries/thumbnails/${id}.png` }}
                style={styles.thumbnail} 
            />
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </Pressable>
    );
};

export default StudioCard;

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'column',
        gap: 4,
        height: PROJECT_CARD_THUMBNAIL_HEIGHT + 48,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    thumbnail: {
        aspectRatio: 17/10,
        height: PROJECT_CARD_THUMBNAIL_HEIGHT,
        objectFit: 'fill',
        borderRadius: 4,
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        maxWidth: PROJECT_CARD_THUMBNAIL_HEIGHT / 10 * 17,
        color: '#fff',
        marginBottom: 1,
    },
});
