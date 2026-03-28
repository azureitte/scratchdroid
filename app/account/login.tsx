import { useState, useRef } from 'react';
import { StyleSheet, Image, Text, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import { IMAGES } from '@/util/assets';
import { useSession } from '@/hooks/useSession';
import FormInput, { FormInputRef } from '@/components/general/FormInput';
import Button from '@/components/general/Button';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';

const LoginPage = () => {

    const { login, isLoading } = useSession();
    const [ error, setError ] = useState('');

    const usernameInputRef = useRef<FormInputRef>(null);
    const passwordInputRef = useRef<FormInputRef>(null);
    
    useChangeAppStateOnFocus({
        headerVisible: false,
        footerVisible: false,
    });

    const handleLogin = async () => {
        try {
            setError('');
            passwordInputRef.current?.blur();
            usernameInputRef.current?.blur();
            await login(
                usernameInputRef.current?.getValue() ?? '',
                passwordInputRef.current?.getValue() ?? ''
            );
        } catch (e: any) {
            setError(e.message);
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

            <Button 
                text="Sign In" 
                onPress={handleLogin} 
                role="primary" variation="big" 
                fullWidth
                isLoading={isLoading}
                style={{ marginTop: 'auto' }} 
            />
        </KeyboardAvoidingView>
        </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default LoginPage;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#121212',
        padding: 24,
        height: '100%',
    },
    container: {
        width: '100%',
        height: '100%',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    logo: {
        marginTop: 32,
        marginBottom: 50,
        height: 50,
        objectFit: 'contain',
    },

    errorText: {
        color: '#fff',
        backgroundColor: '#c40',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
});
