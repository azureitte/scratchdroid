import { Pressable, StyleProp, Text, StyleSheet, ViewStyle, ActivityIndicator } from "react-native";

import { DEFAULT_RIPPLE_CONFIG } from "@/util/constants";
import { ICONS } from "@/util/assets";

export type ButtonProps = {
    role?: 'primary' | 'secondary' | 'danger';
    variation?: 'regular' | 'big';
    isLoading?: boolean;
    isDisabled?: boolean;
    fullWidth?: boolean;
    square?: boolean;
    style?: StyleProp<ViewStyle>,
    text?: string;
    icon?: keyof typeof ICONS;
    onPress?: () => void;
};

const Button = ({
    role = 'secondary',
    variation = 'regular',
    isLoading = false,
    isDisabled = false,
    fullWidth = false,
    square = false,
    style,
    text,
    icon,
    onPress,
}: ButtonProps) => {
    const Icon = icon && ICONS[icon];

    return (
        <Pressable 
            onPress={onPress}
            style={[
                styles.button,
                styles[role],
                styles[variation],
                style,
                (isLoading || isDisabled) && styles.buttonDisabled,
                fullWidth && styles.buttonFullWidth,
                square && styles.buttonSquare,
            ]} 
            android_ripple={DEFAULT_RIPPLE_CONFIG}
            disabled={isLoading}
        >
            { isLoading 
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    { !!Icon && <Icon style={styles.buttonIcon} height={18} /> }
                    { !!text && <Text style={[
                        styles.buttonText,
                        styles[`${variation}Text`],
                    ]}>
                        {text}
                    </Text> }
                </> }
        </Pressable>
    );
};

export default Button;

const styles = StyleSheet.create({
    button: {
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
        pointerEvents: "none",
    },
    buttonFullWidth: {
        width: '100%',
    },
    buttonSquare: {
        width: 42,
    },

    primary: {
        backgroundColor: "#4177FF",
    },
    secondary: {
        backgroundColor: "#333333",
    },
    danger: {
        backgroundColor: "#c40",
    },

    regular: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    big: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
    },

    
    buttonIcon: {
        width: 18,
        height: 18,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: 600,
    },
    regularText: {
        fontSize: 16,
    },
    bigText: {
        fontSize: 20,
    },
});
