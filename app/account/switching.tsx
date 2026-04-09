import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IMAGES } from '@/util/assets';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';

const SwitchingAccountsPage = () => {

    useChangeAppStateOnFocus({
        headerVisible: false,
        footerVisible: false,
    });

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
            <Text style={styles.title}>Switching Accounts...</Text>
            <Text style={styles.text}>This should take a few seconds.</Text>
        </View>
    );
};

export default SwitchingAccountsPage;

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