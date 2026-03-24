import React from "react";
import { StyleSheet, Text, View } from "react-native";

const MessagesPage = () => {
    return (
        <View style={styles.container}>
            <Text>Messages</Text>
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
});
