import { memo, useContext, useRef } from "react";
import { StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  useDerivedValue,
} from "react-native-reanimated";

import { emit } from "@/util/eventBus";
import { DEFAULT_RIPPLE_CONFIG } from "@/util/constants";
import { ICONS, IMAGES } from "@/util/assets";
import { AppContext } from "@/context/AppContext";
import { useSession } from "@/hooks/useSession";

const Header = memo(() => {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const pfpCachePrevent = useRef(Math.random());

    const { session } = useSession();
    const { 
        headerVisible, 
        primaryColor, 
    } = useContext(AppContext);

    const MenuIcon = ICONS.menu;

    const Y_HIDDEN = -(insets.top + 64);
    const Y_VISIBLE = 0;

    const COLOR_REGULAR = '#4177FF';
    const COLOR_EXPLORE = '#349469';

    const translateY = useDerivedValue(() => {
        return withTiming(
            headerVisible ? Y_VISIBLE : Y_HIDDEN, 
            { duration: 300 }
        );
    }, [headerVisible]);

    const color = useDerivedValue(() => {
        return withTiming(
            primaryColor === 'regular' ? COLOR_REGULAR : COLOR_EXPLORE, 
            { duration: 300, easing: Easing.inOut(Easing.cubic) }
        );
    }, [primaryColor]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        backgroundColor: color.value,
    }));

    const handleToggleDrawer = () => {
        emit('drawer-toggle');
    };

    const handleNavigateHome = () => {
        emit('drawer-close');
        emit('tab-navigate', 'home');
    };

    return (
        <Animated.View style={[
            styles.headerContainer, 
            { top: insets.top }, 
            animatedStyle
        ]}>
            <Pressable 
                style={styles.headerButton}
                onPress={handleToggleDrawer}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
            >
                <MenuIcon />
            </Pressable>

            <Pressable onPress={handleNavigateHome}>
                <Image source={IMAGES.logo} style={styles.logo} />
            </Pressable>

            <Pressable 
                style={styles.headerButton}
                onPress={() => {
                    emit('drawer-close');
                    router.push(`users/${session?.user?.username}`)
                }}
                android_ripple={DEFAULT_RIPPLE_CONFIG}
            >
                { session?.user && 
                    <Image 
                        source={{ uri: `https://uploads.scratch.mit.edu/get_image/user/${session.user.id}_32x32.png?a=${pfpCachePrevent.current}` }}
                        style={styles.userAvatar} 
                    /> }
            </Pressable>
        </Animated.View>
    );
});

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
        zIndex: 5,
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
