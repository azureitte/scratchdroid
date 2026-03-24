import { useState, useRef } from "react";
import { StyleSheet, Image, Text, Pressable, KeyboardAvoidingView } from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import FormInput, { FormInputRef } from "../../components/FormInput";

import { IMAGES } from "../../util/assets";
import { apiReq } from "../../util/api";

const LoginPage = () => {
    
    const router = useRouter();

    const usernameInputRef = useRef<FormInputRef>(null);
    const passwordInputRef = useRef<FormInputRef>(null);

    const [ error, setError ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);

    const handleLogin = async () => {
        
        setIsLoading(true);
        setError('');

        const response = await apiReq({
            path: '/accounts/login/',
            method: 'POST',
            body: {
                username: usernameInputRef.current?.getValue() ?? '',
                password: passwordInputRef.current?.getValue() ?? '',
                useMessages: true,
            },
            responseType: 'json',
            useCrsf: true,
        });

        setIsLoading(false);

        if (response.success) {
            const isLoginAttemptSuccessful = response.data?.[0]?.success === 1;
            if (isLoginAttemptSuccessful) {
                router.navigate("/home");
                return;
            } else {
                if (response.data?.[0]?.redirect)
                    setError('Too many login attempts. Please try again later.');
                else 
                    setError(response.data?.[0]?.msg);
            }
        } else {
            setError('An unknown error occurred.');
        }
    };

    return (
        <SafeAreaProvider>
        <SafeAreaView style={styles.wrapper}>
        <KeyboardAvoidingView 
            style={styles.container}
            behavior="padding"
            keyboardVerticalOffset={16}
        >
            <Image source={IMAGES.logo} style={styles.logo} />

            <FormInput
                ref={usernameInputRef}
                label="Username"
                placeholder="Username" 
                type="text"
                autoComplete="username"
                next={passwordInputRef}
            />
            <FormInput
                ref={passwordInputRef}
                label="Password"
                placeholder="Password" 
                type="password"
                autoComplete="current-password"
                next={passwordInputRef}
            />

            { error && <Text style={styles.errorText}>{error}</Text> }

            <Pressable 
                onPress={handleLogin}
                style={[
                    styles.button,
                    { marginTop: 'auto' },
                    isLoading && styles.buttonDisabled,
                ]} 
                android_ripple={{ color: "#fff3", foreground: true }}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>Sign in</Text>
            </Pressable>
        </KeyboardAvoidingView>
        </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default LoginPage;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#121212",
        padding: 24,
        height: "100%",
    },
    container: {
        width: "100%",
        height: "100%",
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
    },

    logo: {
        marginTop: 32,
        marginBottom: 50,
        height: 50,
        objectFit: "contain",
    },

    button: {
        width: "100%",
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: "#4177FF",
        borderRadius: 12,
        overflow: "hidden",
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 20,
        fontWeight: 600,
    },
    buttonDisabled: {
        opacity: 0.5,
        pointerEvents: "none",
    },

    errorText: {
        color: "#fff",
        backgroundColor: "#c40",
        width: "100%",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
});
