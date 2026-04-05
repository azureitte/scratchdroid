import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { ForwardedRef, forwardRef, RefObject, useImperativeHandle, useRef, useState } from "react";

type TextAreaProps = {
    label?: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (value: string) => void;
    maxLength?: number;
    autoFocus?: boolean;
};

export type TextAreaRef = {
    focus: () => void;
    blur: () => void;
    getValue: () => string;
};

const TextArea = forwardRef(({
    label,
    placeholder,
    value = '',
    onChangeText,
    maxLength,
    autoFocus = false,
}: TextAreaProps, ref: ForwardedRef<TextAreaRef>) => {

    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        getValue: () => value,
        setValue: (value: string) => onChangeText?.(value),
    }));

    return (
        <>
            { label && <Text style={styles.inputLabel}>{label}</Text> }
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocus
            ]}>
                <TextInput 
                    ref={inputRef}
                    value={value}
                    multiline={true}
                    autoFocus={autoFocus}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#a4a4a4" 
                    style={styles.input} 
                    maxLength={maxLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
        </>
    );
});

export default TextArea;

const styles = StyleSheet.create({
    inputWrapper: {
        flex: 1,
        minHeight: 120,
        width: "100%",
        borderColor: "#3D3D3D",
        backgroundColor: "#272727",
        borderWidth: 2,
        borderRadius: 8,
    },
    inputWrapperFocus: {
        borderColor: "#4177FF",
        boxShadow: "0 0 0 5px #4177ff3d",
    },
    input: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 16,
        color: "#fff",
        fontSize: 18,
        fontWeight: 400,
        textAlignVertical: 'top',
    },
    inputLabel: {
        color: "#fff",
        width: "100%",
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 10,
        paddingHorizontal: 16,
    },
});
