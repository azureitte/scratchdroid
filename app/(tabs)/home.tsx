import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { apiReq } from '@/util/api';
import { useSession } from '@/hooks/useSession';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import Button from '@/components/general/Button';

const HomePage = () => {

    const [debugTextLoves, setDebugTextLoves] = useState('...');
    const [debugTextActivity, setDebugTextActivity] = useState('...');

    const { isLoading, session, logout } = useSession();
    const router = useRouter();

    const handleLogout = () => {
        logout().then(() => router.replace('/'));
    };

    useEffect(() => {
        if (isLoading || !session) return;
        (async () => {

            const { user } = session;
            if (!user) return;

            const lovesRes = await apiReq({
                host: 'https://api.scratch.mit.edu',
                path: '/users/' + user.username + '/following/users/loves',
                auth: user.token,
                responseType: 'json',
            });
            if (!lovesRes.success) return;

            const loves = lovesRes.data;
            setDebugTextLoves(JSON.stringify(loves, null, 2));

            const activityRes = await apiReq({
                host: 'https://api.scratch.mit.edu',
                path: '/users/' + user.username + '/following/users/activity',
                params: { limit: 3 },
                auth: user.token,
                responseType: 'json',
            });
            if (!activityRes.success) return;

            const activity = activityRes.data;
            setDebugTextActivity(JSON.stringify(activity, null, 2));
        })();
    }, [isLoading, session]);
    
    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: true,
        primaryColor: 'regular',
    });

    return (
        <View style={styles.container}>

            <Link href="https://scratch.mit.edu">Web Scratch</Link>

            <ScrollView style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>
                    {debugTextLoves}
                </Text>
            </ScrollView>

            <ScrollView style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>
                    {debugTextActivity}
                </Text>
            </ScrollView>

            <Button text="Logout" onPress={handleLogout} />
        </View>
    );
};

export default HomePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
    },

    codeBlock: {
        backgroundColor: '#000',
        maxHeight: 256,
        width: '100%',
        overflow: 'scroll',
        padding: 8,
        borderRadius: 12,
        marginBottom: 12,
    },
    codeBlockText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
    },
});
