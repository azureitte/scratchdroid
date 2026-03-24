import React from "react";
import { Pressable, StyleSheet, View, Image } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { ICONS } from "../util/assets";
import { DEFAULT_RIPPLE_CONFIG } from "../util/constants";

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

    return (
        <View style={[styles.tabContainer, { bottom: insets.bottom }]}>
            {
                buttons.map(button => {
                    const isFocused = state.index === button.idx;
                    return (
                        <Pressable
                            key={button.key}
                            onPress={() => {
                                if (button.isSpecialCenter) console.log("create");
                                else navigation.navigate(button.name)
                            }}
                            style={[
                                styles.tab,
                                button.isSpecialCenter && styles.tabCenter,
                            ]}

                            android_ripple={DEFAULT_RIPPLE_CONFIG}
                        >
                            {TAB_BAR_ICONS[button.name][isFocused ? 1 : 0]}
                        </Pressable>
                    );
                })
            }
        </View>
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
    },
    tabCenter: {
        backgroundColor: "#4177FF",
        borderRadius: 12,
        height: 40,
        maxWidth: 64,
        marginHorizontal: 16,
    },
    tabLabel: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
});
