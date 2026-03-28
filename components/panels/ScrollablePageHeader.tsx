import {} from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Heading from '../general/Heading';

type ScrollablePageHeaderProps = {
    scrollY: SharedValue<number>;
    headerStick: number;
    title: string;
    children?: React.ReactNode|React.ReactNode[];
};

const ScrollablePageHeader = ({
    scrollY,
    headerStick,
    title,
    children,
}: ScrollablePageHeaderProps) => {

    const insets = useSafeAreaInsets();
    
    const headerStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value, 
            [0, headerStick], 
            [0, -headerStick],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }],
        };
    });

    const headerContentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value, 
            [0, headerStick], 
            [1, 0],
            Extrapolate.CLAMP
        );

        return {
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.pageStart, { 
            paddingTop: insets.top + 82 
        }, headerStyle]}>
            <Animated.View style={[styles.pageStartContent, headerContentStyle]}>
                <Heading>{title}</Heading>
            </Animated.View>
            {children}
        </Animated.View>
    );
};

export default ScrollablePageHeader;

const styles = StyleSheet.create({
    pageStart: {
        backgroundColor: '#1d2b4d',
        padding: 16,
        zIndex: 2,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    },
    pageStartContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
});
