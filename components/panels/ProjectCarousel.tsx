import { PROJECT_CARD_THUMBNAIL_HEIGHT } from '@/util/constants';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFonts } from '@expo-google-fonts/dela-gothic-one/useFonts';
import { DelaGothicOne_400Regular } from '@expo-google-fonts/dela-gothic-one/400Regular';

import { FONTS } from '@/util/assets';

type ProjectCarouselProps = {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode|React.ReactNode[];
};

const Carousel = ({
    title,
    subtitle,
    children,
}: ProjectCarouselProps) => {
    const [fontsLoaded] = useFonts({ DelaGothicOne_400Regular });

    return (<View style={styles.container}>
        { !!title && fontsLoaded && <Text style={styles.title}>{title}</Text> }
        { !!subtitle && <Text style={styles.subtitle}>{subtitle}</Text> }
        <ScrollView style={styles.carousel} horizontal contentContainerStyle={{ paddingHorizontal: 6 }}>
            { children }
        </ScrollView>
    </View>);
};

export default Carousel;

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'column',
        gap: 10,
    },
    carousel: {
        flex: 0,
        maxHeight: PROJECT_CARD_THUMBNAIL_HEIGHT + 70,
    },
    title: {
        color: '#fff',
        paddingHorizontal: 16,
        fontSize: 24,
        fontWeight: 400,
        fontFamily: FONTS.delaGothicOne,
    },
    subtitle: {
        color: '#888888',
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: 600,
    },
});
