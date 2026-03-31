import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScratchMystuffProjectItem, ScratchMystuffStudioItem } from '@/util/types';
import { addPrefixUrl, relativeDate } from '@/util/functions';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';

type MystuffRowProps = {
    type: 'project';
    item: ScratchMystuffProjectItem;
    myUsername?: string;
    onPress?: () => void;
}|{
    type: 'studio';
    item: ScratchMystuffStudioItem;
    myUsername?: string;
    onPress?: () => void;
};

const MystuffRow = memo(({
    type,
    item,
    myUsername,
    onPress,
}: MystuffRowProps) => {
    return (
        <Pressable 
            style={styles.container}
            android_ripple={DEFAULT_RIPPLE_CONFIG}
            onPress={onPress}
        >
            { type === 'project' ? <>
                <Image 
                    source={{ uri: addPrefixUrl(item.fields.uncached_thumbnail_url) }} 
                    style={[styles.thumbnail, styles.projectThumbnail]} 
                />
                <View style={styles.content}>
                    <Text style={styles.title}>{item.fields.title}</Text>
                    <Text style={styles.subtext}>
                        { 
                            item.fields.isPublished ? 'Public' : 'Private' 
                        } • Modified { 
                            relativeDate(new Date(item.fields.datetime_modified)) 
                        }
                    </Text>
                </View>
            </>

            : <>
                <Image 
                    source={{ uri: addPrefixUrl(item.fields.thumbnail_url) }} 
                    style={[styles.thumbnail, styles.studioThumbnail]} 
                />
                <View style={styles.content}>
                    <Text style={styles.title}>{item.fields.title}</Text>
                    <Text style={styles.subtext}>
                        { 
                            item.fields.owner.username === myUsername ? 'Host' : 'Curator' 
                        } • Created { 
                            (new Date(item.fields.datetime_created)).toDateString() 
                        }
                    </Text>
                </View>
            </> }

        </Pressable>
    );
});

export default MystuffRow;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginVertical: -8,
        marginBottom: 8,
        gap: 16,
    },

    content: {
        flex: 1,
        flexDirection: "column",
        gap: 4,
    },

    thumbnail: {
        height: 75,
        borderRadius: 4,
        objectFit: 'fill',
    },
    projectThumbnail: {
        width: 100,
    },
    studioThumbnail: {
        width: 115,
    },

    title: {
        fontSize: 18,
        fontWeight: 600,
        color: '#fff',
    },
    subtext: {
        fontSize: 14,
        fontWeight: 500,
        color: '#888888',
    },
});
