import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { DEFAULT_RIPPLE_CONFIG, USER_CARD_THUMBNAIL_HEIGHT } from '@/util/constants';
import { $u } from '@/util/thumbnailCaching';
import { useApi } from '@/hooks/useApi';

type UserCardProps = {
    id: number;
    username: string;
    image?: string;
    gridColumns?: number;
    onPress?: () => void;
};

const UserCard = ({
    id,
    username,
    image,
    gridColumns = 1,
    onPress,
}: UserCardProps) => {
    const router = useRouter();
    const api = useApi();

    const pfp = image ?? (id 
        ? `https://cdn2.scratch.mit.edu/get_image/user/${id}_60x60.png`
        : api.config.defaultPfpUrl);

    return (
        <Pressable 
            style={[
                styles.container,
                gridColumns > 1 && styles.containerInsideGrid,
                gridColumns > 1 && { width: `${100 / gridColumns}%` },
            ]}
            android_ripple={DEFAULT_RIPPLE_CONFIG}
            onPress={onPress ?? (() => router.push(`/users/${username}`))}
        >
            <Image 
                source={{ uri: $u(pfp, username, id) }}
                style={styles.thumbnail} 
            />
            <Text style={styles.title} numberOfLines={1}>{username}</Text>
        </Pressable>
    );
};

export default UserCard;

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'column',
        gap: 4,
        height: USER_CARD_THUMBNAIL_HEIGHT + 50,
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
        aspectRatio: 1,
        height: USER_CARD_THUMBNAIL_HEIGHT,
        objectFit: 'fill',
        borderRadius: 8,
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        maxWidth: USER_CARD_THUMBNAIL_HEIGHT,
        color: '#fff',
        marginBottom: 1,
    },
});
