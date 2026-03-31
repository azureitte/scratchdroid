import { Pressable, StyleProp, Text, StyleSheet, ViewStyle, ActivityIndicator } from "react-native";

import { DEFAULT_RIPPLE_CONFIG } from "@/util/constants";

export type ButtonProps = {
    role?: 'primary' | 'secondary' | 'danger';
    variation?: 'regular' | 'big';
    isLoading?: boolean;
    isDisabled?: boolean;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>,
    text: string;
    onPress?: () => void;
};

const Button = ({
    role = 'secondary',
    variation = 'regular',
    isLoading = false,
    isDisabled = false,
    fullWidth = false,
    style,
    text,
    onPress,
}: ButtonProps) => {
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
            ]} 
            android_ripple={DEFAULT_RIPPLE_CONFIG}
            disabled={isLoading}
        >
            { isLoading 
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={[
                    styles.buttonText,
                    styles[`${variation}Text`],
                ]}>{text}</Text> }
        </Pressable>
    );
};

export default Button;

const styles = StyleSheet.create({
    button: {
        overflow: "hidden",
    },
    buttonDisabled: {
        opacity: 0.5,
        pointerEvents: "none",
    },
    buttonFullWidth: {
        width: "100%",
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
