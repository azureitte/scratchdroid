import React, { useContext, useEffect, useRef } from "react";
import { StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ICONS, IMAGES } from "@/util/assets";
import { AppContext } from "@/context/AppContext";
import { useSession } from "@/hooks/useSession";

const Header = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const pfpCachePrevent = useRef(Math.random());

    const { session } = useSession();
    const { 
        headerVisible, 
        primaryColor, 
        drawerOpen,
        setDrawerOpen,
    } = useContext(AppContext);

    const MenuIcon = ICONS.menu;

    const Y_HIDDEN = -(insets.top + 64);
    const Y_VISIBLE = 0;

    const COLOR_REGULAR = '#4177FF';
    const COLOR_EXPLORE = '#349469';

    const translateY = useSharedValue(Y_HIDDEN);
    const color = useSharedValue(COLOR_REGULAR);

    useEffect(() => {
        translateY.value = withTiming(
            headerVisible ? Y_VISIBLE : Y_HIDDEN, 
            { duration: 300 }
        );
    }, [headerVisible]);

    useEffect(() => {
        color.value = withTiming(
            primaryColor === 'regular' ? COLOR_REGULAR : COLOR_EXPLORE, 
            { duration: 300, easing: Easing.inOut(Easing.cubic) }
        );
    }, [primaryColor]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        backgroundColor: color.value,
    }));

    return (
        <Animated.View style={[
            styles.headerContainer, 
            { top: insets.top }, 
            animatedStyle
        ]}>
            <Pressable 
                style={styles.headerButton}
                onPress={() => setDrawerOpen(!drawerOpen)}
                android_ripple={{ color: "#fff3", foreground: true }}
            >
                <MenuIcon />
            </Pressable>

            <Pressable onPress={() => router.replace('/home')}>
                <Image source={IMAGES.logo} style={styles.logo} />
            </Pressable>

            <Pressable 
                style={styles.headerButton}
                onPress={() => {
                    setDrawerOpen(false);
                    router.push(`users/${session?.user?.username}`)
                }}
                android_ripple={{ color: "#fff3", foreground: true }}
            >
                { session?.user && 
                    <Image 
                        source={{ uri: `https://uploads.scratch.mit.edu/get_image/user/${session.user.id}_32x32.png?a=${pfpCachePrevent.current}` }}
                        style={styles.userAvatar} 
                    /> }
            </Pressable>
        </Animated.View>
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
