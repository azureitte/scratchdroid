import React from "react";
import { StyleSheet, Image, View, Pressable } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import { ICONS, IMAGES } from "../util/assets";
import { useSession } from "../hooks/useSession";

const Header = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const { session } = useSession();

    const MenuIcon = ICONS.menu;

    return (
        <View style={[styles.headerContainer, { top: insets.top }]}>
            <Pressable 
                style={styles.headerButton}
                onPress={() => console.log('Drawer')}
                android_ripple={{ color: "#fff3", foreground: true }}
            >
                <MenuIcon />
            </Pressable>

            <Pressable onPress={() => router.replace('/home')}>
                <Image source={IMAGES.logo} style={styles.logo} />
            </Pressable>

            <Pressable 
                style={styles.headerButton}
                onPress={() => router.push(`users/${session?.user?.username}`)}
                android_ripple={{ color: "#fff3", foreground: true }}
            >
                { session?.user && 
                    <Image 
                        source={{ uri: `https://uploads.scratch.mit.edu/get_image/user/${session.user.id}_32x32.png` }} 
                        style={styles.userAvatar} 
                    /> }
            </Pressable>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#4177FF",
        position: "absolute",
        left: 8,
        right: 8,
        transform: [{ translateY: 8 }],
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 4,
    },

    logo: {
        height: 34,
        objectFit: "contain",
    },

    headerButton: {
        overflow: "hidden",
        borderRadius: 8,
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },

    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 8,
    },
});
