import React, { useContext, useEffect } from "react";
import { Pressable, StyleSheet, View, Text, DeviceEventEmitter } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { ICONS } from "@/util/assets";
import { DEFAULT_RIPPLE_CONFIG } from "@/util/constants";
import { AppContext } from "@/context/AppContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

export const TAB_BAR_ICONS: Record<string, [any, any]> = {
    home: [ICONS.home, ICONS.homeActive],
    explore: [ICONS.explore, ICONS.exploreActive],
    messages: [ICONS.messages, ICONS.messagesActive],
    mystuff: [ICONS.mystuff, ICONS.mystuffActive],
    create: [ICONS.create, ICONS.create],
};

const TabBar = ({
    state,
    descriptors,
    navigation,
    insets,
}: BottomTabBarProps) => {

    const unreadCount = useUnreadMessages();
    const { footerVisible, primaryColor } = useContext(AppContext);

    const buttons = state.routes.map((route, index) => ({
        key: route.key,
        title: descriptors[route.key].options.title,
        name: route.name,
        idx: index,
        isSpecialCenter: false,
    }));

    // insert a special button in the center
    buttons.splice(Math.round(buttons.length / 2), 0, {
        key: "__create",
        title: "Create",
        name: "create",
        idx: -1,
        isSpecialCenter: true,
    });

    const Y_HIDDEN = (insets.top + 64);
    const Y_VISIBLE = 0;

    const COLOR_REGULAR = '#4177FF';
    const COLOR_EXPLORE = '#349469';

    const translateY = useSharedValue(Y_HIDDEN);
    const color = useSharedValue(COLOR_REGULAR);

    useEffect(() => {
        translateY.value = withTiming(
            footerVisible ? Y_VISIBLE : Y_HIDDEN, 
            { duration: 300 }
        );
    }, [footerVisible]);

    useEffect(() => {
        color.value = withTiming(
            primaryColor === 'regular' ? COLOR_REGULAR : COLOR_EXPLORE, 
            { duration: 300 }
        );
    }, [primaryColor]);

    const animatedStyleContainer = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const animatedStyleButton = useAnimatedStyle(() => ({
        backgroundColor: color.value,
    }));

    return (
        <Animated.View style={[
            styles.tabContainer, 
            { bottom: insets.bottom },
            animatedStyleContainer,    
        ]}>
            {
                buttons.map(button => {
                    const isFocused = state.index === button.idx;
                    const Icon = TAB_BAR_ICONS[button.name][isFocused ? 1 : 0];
                    
                    if (button.isSpecialCenter) return (
                        <Animated.View 
                            style={[
                                styles.tab,
                                styles.tabCenterWrapper,
                                animatedStyleButton,
                            ]}
                            key={button.key}
                        >
                            <Pressable
                                onPress={() => {
                                    console.log("create");
                                }}
                                style={[
                                    styles.tabCenter,
                                ]}

                                android_ripple={DEFAULT_RIPPLE_CONFIG}
                            >
                                <Icon />
                            </Pressable>
                        </Animated.View>
                    );

                    return (
                        <Pressable
                            key={button.key}
                            onPress={() => {
                                navigation.navigate(button.name)
                                DeviceEventEmitter.emit('tab-pressed', button.name);
                                if (state.index === button.idx) DeviceEventEmitter.emit('tab-re-pressed', button.name);
                            }}
                            style={[
                                styles.tab,
                                button.isSpecialCenter && styles.tabCenter,
                            ]}

                            android_ripple={DEFAULT_RIPPLE_CONFIG}
                        >
                            <Icon />
                            { unreadCount > 0 && button.name === 'messages' && <Text style={styles.tabBadge}>{unreadCount}</Text> }
                        </Pressable>
                    );
                })
            }
        </Animated.View>
    );
};

export default TabBar;

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1C1C1C",
        position: "absolute",
        left: 8,
        right: 8,
        transform: [{ translateY: -8 }],
        height: 60,
        borderRadius: 12,
        boxShadow: "0 0 50px #121212",
        overflow: "hidden",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        height: "100%",
        overflow: "hidden",
        position: "relative",
    },
    tabCenterWrapper: {
        backgroundColor: "#4177FF",
        borderRadius: 12,
        marginHorizontal: 16,
        position: "relative",
        flex: 0,
        height: 40,
        width: 64,
    },
    tabCenter: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        overflow: "hidden",
        height: 40,
        width: 64,
    },
    tabLabel: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    tabBadge: {
        position: "absolute",
        top: 10,
        right: 16,
        height: 18,
        paddingHorizontal: 8,
        borderRadius: 16,
        fontSize: 14,
        fontWeight: 600,
        backgroundColor: "#F89915",
    },
});
