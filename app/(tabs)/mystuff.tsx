import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useSession } from "../../hooks/useSession";
import { apiReq } from "../../util/api";

const MyStuffPage = () => {
    const [ debugTextProjects, setDebugTextProjects ] = useState("...");

    const { isLoading, session } = useSession();

    useEffect(() => {
        if (isLoading || !session) return;
        (async () => {
            const { user } = session;
            if (!user) return;

            const projectsRes = await apiReq({
                path: "/site-api/projects/all/",
                params: { limit: 10, offset: 0 },
                responseType: "json",
            });
            if (!projectsRes.success) return;

            const projects = projectsRes.data;
            setDebugTextProjects(JSON.stringify(projects, null, 2));
        })();
    }, [isLoading, session]);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.codeBlock}>
                <Text style={styles.codeBlockText}>{debugTextProjects}</Text>
            </ScrollView>
        </View>
    );
};

export default MyStuffPage;

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
