import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useSession } from "../../hooks/useSession";
import { apiReq } from "../../util/api";

const MessagesPage = () => {
    const [ debugTextMessages, setDebugTextMessages ] = useState('...');

    const { isLoading, session } = useSession();

    useEffect(() => {
        if (isLoading || !session) return;
        (async () => {

            const { user } = session;
            if (!user) return;

            const messagesRes = await apiReq({
                host: 'https://api.scratch.mit.edu',
                path: '/users/' + user.username + '/messages',
                params: { limit: 10, offset: 0 },
                auth: user.token,
                responseType: 'json',
            });
            if (!messagesRes.success) return;

            const messages = messagesRes.data;
            setDebugTextMessages(JSON.stringify(messages, null, 2));
        })();
    }, [isLoading, session]);

    return (
        <View style={styles.container}>

            <ScrollView style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>
                    {debugTextMessages}
                </Text>
            </ScrollView>
        </View>
    );
};

export default MessagesPage;

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
