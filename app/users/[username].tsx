import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { apiReq } from '@/util/api';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';

const UserPage = () => {

    const { username } = useLocalSearchParams<{ username: string }>();
    const insets = useSafeAreaInsets();

    useChangeAppStateOnFocus({
        footerVisible: false,
        primaryColor: 'regular',
    });

    const {
        data: user,
        isLoading,
        isError,
        error,
    } = useQuery<any>({
        queryKey: ['user', username],
        queryFn: async () => {
            if (!username) return;

            const userRes = await apiReq<any>({
                host: 'https://api.scratch.mit.edu',
                path: `/users/${username}/`,
                responseType: 'json',
            });
            if (!userRes.success) throw new Error(userRes.error);

            return userRes.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    if (isError) return <Text>{error.message}</Text>;
    if (isLoading || !user) return <ActivityIndicator />;

    return (
        <View style={styles.container}>
            <View style={{ marginTop: insets.top + 60 }} />
            <Text style={styles.userTitle}>{user.username}</Text>
            <Image
                source={{
                    uri: `https://uploads.scratch.mit.edu/get_image/user/${user.id}_60x60.png`,
                }}
                style={{ width: 60, height: 60, borderRadius: 12 }}
            />
        </View>
    );
    
};

export default UserPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
        padding: 8,
    },
    userTitle: {
        fontSize: 28,
        padding: 4,
        marginVertical: 8,
        fontWeight: 900,
        color: '#fff',
        width: '100%',
    },
});
