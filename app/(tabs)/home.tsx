import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Button } from "react-native";
import { useRouter } from "expo-router";
import CookieManager from "@preeternal/react-native-cookie-manager";

import { apiReq } from "../../util/api";

const HomePage = () => {

    const [debugTextLoves, setDebugTextLoves] = useState('...');
    const [debugTextActivity, setDebugTextActivity] = useState('...');

    const router = useRouter();

    const handleLogout = () => {
        CookieManager.clearAll().then(() => {
            router.replace('/');
        });
    };

    useEffect(() => {
        (async () => {
            const sessionRes = await apiReq({
                path: '/session',
                responseType: 'json',
            });
            if (!sessionRes.success) return;

            const { user } = sessionRes.data;
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
    }, []);

    return (
        <View style={styles.container}>

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

            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

export default HomePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121212",
    },

    codeBlock: {
        backgroundColor: "#000",
        maxHeight: 256,
        width: "100%",
        overflow: "scroll",
        padding: 8,
        borderRadius: 12,
        marginBottom: 12,
    },
    codeBlockText: {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#fff",
    },
});
