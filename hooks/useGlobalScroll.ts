import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

export const useGlobalScroll = ({
    scrollStick = Infinity,
}: {
    scrollStick?: number;
}) => {
    const scroll = useSharedValue(0);
    
    const handleScrollChange = (newScroll: number) => {
        const newVal = Math.min(newScroll, scrollStick);

        scroll.value = Math.min(scroll.value, scrollStick);
        scroll.value = withTiming(
            newVal,
            { duration: 300, easing: Easing.inOut(Easing.cubic) }
        );
    }

    return { scroll, handleScrollChange };
}