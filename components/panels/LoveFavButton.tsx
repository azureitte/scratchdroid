import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shortNumber } from '@/util/functions';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { ICONS } from '@/util/assets';

export type StatProp = {
    count: number;
    active: boolean;
    loading: boolean;
    onPress?: () => void;
}

type LoveFavButtonProps = {
    loves: StatProp;
    favs: StatProp;
}

const LoveFavButton = ({
    loves,
    favs,
}: LoveFavButtonProps) => {
    const LoveIcon = loves.active
        ? ICONS.loveActive
        : ICONS.loveInactive;

    const FavIcon = favs.active
        ? ICONS.favActive
        : ICONS.favInactive;

    return (
        <View style={styles.container}>
            <Pressable 
                onPress={loves.onPress}
                disabled={loves.loading}
                style={[
                    styles.statButton,
                    loves.loading && styles.statButtonDisabled,
                ]}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
            >
                <LoveIcon style={styles.statButtonIcon} />
                <Text style={styles.statButtonText}>
                    { shortNumber(loves.count) }
                </Text>
            </Pressable>

            <View style={styles.sep} />

            <Pressable 
                onPress={favs.onPress}
                disabled={favs.loading}
                style={[
                    styles.statButton,
                    favs.loading && styles.statButtonDisabled,
                ]}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
            >
                <FavIcon style={styles.statButtonIcon} />
                <Text style={styles.statButtonText}>
                    { shortNumber(favs.count) }
                </Text>
            </Pressable>
        </View>
    );
};

export default LoveFavButton;

const styles = StyleSheet.create({
    container: {
        height: 40,
        backgroundColor: '#333',
        borderRadius: 8,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    sep: {
        width: 2,
        height: '100%',
        backgroundColor: '#282828',
    },

    statButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 12,
    },
    statButtonDisabled: {
        opacity: 0.5,
    },

    statButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 500,
    },
    statButtonIcon: {
        width: 28,
        height: 28,
    },
});
