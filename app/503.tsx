import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reloadAsync } from 'expo-updates';

import { IMAGES } from '@/util/assets';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import Button from '@/components/general/Button';

const ServiceUnavailablePage = () => {

    useChangeAppStateOnFocus({
        headerVisible: false,
        footerVisible: false,
    });

    const handleReload = () => {
        reloadAsync();
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Image source={IMAGES.logo} style={[styles.logo, {
                top: insets.top + 16,
            }]} />

            <Image
                source={IMAGES.art.wateringCan}
                style={styles.art}
            />
            <Text style={styles.title}>Service Unavailable</Text>
            <Text style={styles.text}>The Scratch Team is working hard to fix an issue with the Scratch website</Text>
            <Text style={styles.status}>503</Text>
            <Button
                onPress={handleReload}
                text="Reload App"
                role="primary"
            />
        </View>
    );
};

export default ServiceUnavailablePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1d2b4d',
        padding: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: 600,
        color: '#fff',
        marginBottom: 16,
    },
    text: {
        fontSize: 18,
        lineHeight: 28,
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    status: {
        fontSize: 16,
        color: '#ffffff7d',
        marginBottom: 16,
        opacity: 0.5,
        textAlign: 'center',
    },
    art: {
        width: 256,
        height: 150,
        marginBottom: 16,
        objectFit: 'contain',
    },
    logo: {
        position: 'absolute',
        width: '100%',
        height: 40,
        objectFit: 'contain',
    },
});