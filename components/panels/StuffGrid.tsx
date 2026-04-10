import { JSX } from 'react';
import { Dimensions, FlatList, RefreshControl, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from 'react-native';

import { useFonts } from '@expo-google-fonts/dela-gothic-one/useFonts';
import { DelaGothicOne_400Regular } from '@expo-google-fonts/dela-gothic-one/400Regular';

import { getProjectsPerRow, getStudiosPerRow, getUsersPerRow } from '@/util/functions';
import { FONTS } from '@/util/assets';

type StuffGridProps = {
    type: 'project' | 'studio' | 'user';
    title?: string;
    count?: number;
    capCountAt?: number;
    subtitle?: string;
    items: any[];
    render: (item: any, columns: number) => JSX.Element;
    refreshable?: boolean;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    topOffset?: number;
};

const StuffGrid = ({
    type,
    title,
    count,
    capCountAt = 100,
    subtitle,
    items,
    render,
    refreshable = false,
    isRefreshing = false,
    onRefresh,
    topOffset = 0,
}: StuffGridProps) => {

    const screen = useWindowDimensions();
    const [fontsLoaded] = useFonts({ DelaGothicOne_400Regular });

    const header = title 
        ? <View style={styles.header}>
            <View style={styles.titleWrap}>
                { !!title && fontsLoaded && <Text style={styles.title}>{title}</Text> }
                { count !== undefined && <Text style={styles.count}>
                    ({count}{ count >= capCountAt ? '+' : ''})
                </Text>}
            </View>
            { !!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> }
        </View>
        : undefined;

    const numColumns =
        type === 'project' ? getProjectsPerRow(screen.width) :
        type === 'studio' ? getStudiosPerRow(screen.width, -10) :
        type === 'user' ? getUsersPerRow(screen.width) :
        1;

    return (<>
        <FlatList 
            data={items}
            key={numColumns}
            numColumns={numColumns}
            renderItem={({ item }) => render(item, numColumns)}
            keyExtractor={(item) => typeof item?.username === 'string' 
                ? item.username 
                : item?.id.toString()}
            style={styles.list} 
            contentContainerStyle={[{
                paddingTop: topOffset 
            }]}
            ListHeaderComponent={header}
            refreshControl={refreshable 
                ? <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    progressViewOffset={topOffset}
                /> 
                : undefined}
        />
    </>);
};

export default StuffGrid;

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 8,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 8,
        gap: 4,
        width: Dimensions.get('window').width,
    },
    titleWrap: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 10,
    },
    title: {
        color: '#fff',
        fontSize: 28,
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
        fontSize: 18,
        fontWeight: 600,
    },
});
