import React from "react";
import { StyleSheet, Image, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";

import { IMAGES } from "../util/assets";

const Header = ({
    layout,
    options,
    route,
    navigation,
}: BottomTabHeaderProps) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.headerContainer, { top: insets.top }]}>
            <Image source={IMAGES.logo} style={styles.logo} />
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4177FF",
        position: "absolute",
        left: 8,
        right: 8,
        transform: [{ translateY: 8 }],
        height: 52,
        borderRadius: 12,
    },

    logo: {
        height: 34,
        objectFit: "contain",
    },
});
