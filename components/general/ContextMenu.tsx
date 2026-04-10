import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ICONS } from '@/util/assets';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';

export type ContextMenuItem = {
    key: string;
    label: string;
    icon?: keyof typeof ICONS | (string & {}) | { uri: string };
    iconIsPng?: boolean;
    badge?: number;
    collapsible?: boolean;
    isCollapsed?: boolean;
    isBold?: boolean;
    isDanger?: boolean;
    onPress?: () => void;
};

type ContextMenuProps = {
    items: ContextMenuItem[];
};

const ContextMenu = ({
    items,
}: ContextMenuProps) => {
    return (
        <View style={styles.container}>
            { items.map((item, idx) => {
                const Icon = typeof item.icon === 'string' ? (ICONS as any)[item.icon] : item.icon;
                const imgSrc = typeof item.icon === 'string' ? { uri: item.icon } : item.icon;

                const CollapseIcon = ICONS.cardViewMore;

                return (
                    <Pressable
                        key={item.key}
                        style={[
                            styles.item,
                            idx === items.length - 1 && styles.itemLast,
                        ]}
                        onPress={item.onPress}
                        android_ripple={DEFAULT_RIPPLE_CONFIG}
                    >
                        <View style={styles.itemContent}>
                            { item.icon && (item.iconIsPng 
                                ? <Image source={imgSrc} style={[styles.itemIcon, styles.itemIconPng]} />
                                : <Icon style={styles.itemIcon} width={20} />
                            ) }
                            <Text style={[
                                styles.itemLabel,
                                item.isBold && styles.itemLabelBold,
                                item.isDanger && styles.itemLabelDanger,
                            ]}>{item.label}</Text>
                        </View>
                        { !!item.badge && <Text style={styles.itemBadge}>{item.badge}</Text> }
                        { item.collapsible && <View style={[
                            styles.itemCollapser,
                            item.isCollapsed && styles.itemCollapserCollapsed,
                        ]}>
                            <CollapseIcon style={styles.itemCollapserIcon} />
                        </View> }

                    </Pressable>
                );
            }) }
        </View>
    );
};

export default ContextMenu;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1C',
        borderRadius: 12,
        overflow: 'hidden',
    },

    item: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    itemLast: {
        borderBottomWidth: 0,
    },

    itemContent: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    itemIconPng: {
        width: 24,
        height: 24,
        aspectRatio: 1,
        objectFit: 'fill',
        borderRadius: 4,
        marginRight: 0,
    },
    itemLabel: {
        fontSize: 18,
        fontWeight: 400,
        color: '#fff',
    },
    itemLabelBold: {
        fontSize: 18,
        fontWeight: 500,
    },
    itemLabelDanger: {
        color: '#FFC2C2',
    },

    itemBadge: {
        height: 18,
        paddingHorizontal: 8,
        borderRadius: 16,
        fontSize: 14,
        fontWeight: 600,
        backgroundColor: '#F89915',
        color: '#000',
    },

    itemCollapser: {
        transform: [{ rotate: '-90deg' }],
    },
    itemCollapserCollapsed: {
        transform: [{ rotate: '90deg' }],
    },

    itemCollapserIcon: {
        width: 18,
        height: 18,
    },
});
