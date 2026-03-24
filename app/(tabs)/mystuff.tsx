import React from "react";
import { StyleSheet, Text, View } from "react-native";

const MyStuffPage = () => {
    return (
        <View style={styles.container}>
            <Text>My Stuff</Text>
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
});
