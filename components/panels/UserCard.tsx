import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { DEFAULT_RIPPLE_CONFIG, USER_CARD_THUMBNAIL_HEIGHT } from '@/util/constants';
import { $u } from '@/util/thumbnailCaching';

type UserCardProps = {
    id: number;
    username: string;
    image?: string;
    onPress?: () => void;
};

const UserCard = ({
    id,
    username,
    image,
    onPress,
}: UserCardProps) => {
    const router = useRouter();

    const pfp = image ?? `https://cdn2.scratch.mit.edu/get_image/user/${id}_60x60.png`;

    return (
        <Pressable 
            style={styles.container}
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
        height: USER_CARD_THUMBNAIL_HEIGHT + 64,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        paddingVertical: 8,
        paddingHorizontal: 12,
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
