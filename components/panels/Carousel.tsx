import { JSX } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useFonts } from '@expo-google-fonts/dela-gothic-one/useFonts';
import { DelaGothicOne_400Regular } from '@expo-google-fonts/dela-gothic-one/400Regular';

import { PROJECT_CARD_THUMBNAIL_HEIGHT } from '@/util/constants';
import { FONTS } from '@/util/assets';

type CarouselProps = {
    title?: string;
    subtitle?: string;
    items: any[];
    render: (item: any) => JSX.Element;
};

const Carousel = ({
    title,
    subtitle,
    items,
    render,
}: CarouselProps) => {
    const [fontsLoaded] = useFonts({ DelaGothicOne_400Regular });

    return (<View style={styles.container}>
        { !!title && fontsLoaded && <Text style={styles.title}>{title}</Text> }
        { !!subtitle && <Text style={styles.subtitle}>{subtitle}</Text> }
        <FlatList 
            data={items}
            renderItem={({ item }) => render(item)}
            style={styles.carousel} 
            horizontal 
            contentContainerStyle={{ paddingHorizontal: 6 }}
            initialNumToRender={3}
            windowSize={8}
        />
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
