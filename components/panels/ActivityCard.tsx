import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ActivityUnit } from '@/util/types/activity.types';
import Button from '../general/Button';
import ActivityRow from './ActivityRow';

type ActivityCardProps = {
    activity: ActivityUnit[];
    title?: string;
    variation?: 'regular'|'full';
    showAvatars?: boolean;
    linkActor?: boolean;
    expandHeight?: boolean;
    href?: string;
    onPress?: () => void;
}

const ActivityCard = ({
    activity,
    title,
    variation = 'regular',
    showAvatars = false,
    linkActor = true,
    expandHeight = false,
    href,
    onPress,
}: ActivityCardProps) => {
    const router = useRouter();

    return (
        <View style={[
            styles.contentCard, 
            variation === 'full' && styles.contentCardFull,
            expandHeight && styles.contentCardExpand,
        ]}>

            { title && <Text style={[
                styles.contentCardTitle,
                variation === 'full' && styles.contentCardTitleFull,
            ]}>
                {title}
            </Text> }

            <View style={styles.itemsWrapper}>
                { activity.map(unit => <ActivityRow 
                    key={unit.id} 
                    unit={unit} 
                    showAvatars={showAvatars} 
                    linkActor={linkActor}
                    variation={variation}
                />) }
            </View>

            <View style={styles.footer}>
                { href && <Button
                    onPress={() => {
                        router.push(href);
                        onPress?.();
                    }}
                    text="View More"
                    fullWidth
                /> }
            </View>

        </View>
    );
};

export default ActivityCard;

const styles = StyleSheet.create({
    contentCard: {
        marginHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#1C1C1C',
        overflow: 'hidden',
    },
    contentCardFull: {
        marginHorizontal: 0,
        paddingVertical: 16,
        backgroundColor: '#0000',
    },
    contentCardExpand: {
        height: '100%',
    },

    contentCardTitle: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        fontWeight: 600,
        color: '#888',
        marginTop: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#262626",
    },
    contentCardTitleFull: {
        fontSize: 16,
    },

    itemsWrapper: {
        flex: 1,
        overflow: 'hidden',
    },

    footer: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    }
});
