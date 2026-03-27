import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { ForwardedRef, forwardRef, RefObject, useImperativeHandle, useRef, useState } from "react";

type FormInputProps = {
    label?: string;
    placeholder?: string;
    type: 'text' | 'password';
    defaultValue?: string;
    autoComplete?: TextInputProps['autoComplete'];
    returnKeyType?: 'next' | 'done' | 'go' | 'search' | 'send';
    next?: RefObject<FormInputRef|null>;
    onChangeText?: (value: string) => void;
};

export type FormInputRef = {
    focus: () => void;
    blur: () => void;
    getValue: () => string;
};

const FormInput = forwardRef(({
    label,
    placeholder,
    type,
    defaultValue = '',
    autoComplete,
    returnKeyType,
    next,
    onChangeText,
}: FormInputProps, ref: ForwardedRef<FormInputRef>) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<TextInput>(null);
    const valueRef = useRef(defaultValue);

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        getValue: () => valueRef.current,
        setValue: (value: string) => valueRef.current = value,
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
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    placeholderTextColor="#a4a4a4" 
                    secureTextEntry={type === 'password'}
                    style={styles.input} 
                    autoComplete={autoComplete}
                    returnKeyType={returnKeyType ?? (next ? "next" : "done")}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onSubmitEditing={() => next?.current?.focus()}
                    onChangeText={value => {
                        valueRef.current = value;
                        onChangeText?.(value);
                    }}
                />
            </View>
        </>
    );
});

export default FormInput;

const styles = StyleSheet.create({
    inputWrapper: {
        width: "100%",
        borderColor: "#3D3D3D",
        backgroundColor: "#262727",
        borderWidth: 2,
        marginBottom: 32,
        borderRadius: 12,
    },
    inputWrapperFocus: {
        borderColor: "#4177FF",
        boxShadow: "0 0 0 5px #4177ff3d",
    },
    input: {
        width: "100%",
        paddingHorizontal: 24,
        paddingVertical: 16,
        color: "#fff",
        fontSize: 18,
        fontWeight: 500,
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
