import { JSX } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FormattedMessage } from 'react-intl';

import { useFonts } from '@expo-google-fonts/dela-gothic-one/useFonts';
import { DelaGothicOne_400Regular } from '@expo-google-fonts/dela-gothic-one/400Regular';

import { PROJECT_CARD_THUMBNAIL_HEIGHT } from '@/util/constants';
import { FONTS } from '@/util/assets';
import { Link } from 'expo-router';

type CarouselProps = {
    title?: string;
    count?: number;
    capCountAt?: number;
    subtitle?: string;
    href?: string;
    items: any[];
    render: (item: any) => JSX.Element;
};

const Carousel = ({
    title,
    count,
    capCountAt = 100,
    subtitle,
    href,
    items,
    render,
}: CarouselProps) => {
    const [fontsLoaded] = useFonts({ DelaGothicOne_400Regular });

    return (<View style={styles.container}>
        <View style={styles.titleWrap}>
            { !!title && fontsLoaded && <Text style={styles.title}>{title}</Text> }
            { count !== undefined && <Text style={styles.count}>
                    ({count}{ count >= capCountAt ? '+' : ''})
            </Text>}
        </View>
        { !!subtitle && <Text style={styles.subtitle}>{subtitle}</Text> }
        { !!href && <Link href={href} style={styles.link}>
            <FormattedMessage id="project.viewAllInList" />
        </Link> }
        <FlatList 
            data={items}
            renderItem={({ item }) => render(item)}
            keyExtractor={(item) => item?.username ?? item?.id.toString()}
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
        position: 'relative',
    },
    carousel: {
        flex: 0,
        maxHeight: PROJECT_CARD_THUMBNAIL_HEIGHT + 70,
    },
    titleWrap: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 10,
        paddingHorizontal: 16,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 400,
        fontFamily: FONTS.delaGothicOne,
    },
    count: {
        color: '#888888',
        fontSize: 20,
        fontWeight: 500,
    },
    subtitle: {
        color: '#888888',
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: 600,
    },
    link: {
        position: 'absolute',
        top: 0,
        right: 0,
        color: "#93C0FF",
        fontWeight: 600,
        fontSize: 14,
        paddingHorizontal: 16,
        paddingVertical: 4,
        fontStyle: 'normal',
    }
});
