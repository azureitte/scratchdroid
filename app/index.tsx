import { StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import { apiReq } from "../util/api";

const Entry = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiReq({
            path: '/session',
        }).then(response => {
            if (!response.success) {
                setIsLoggedIn(false);
                setIsLoading(false);
                return;
            }
            setIsLoggedIn(!!response.data?.user);
            setIsLoading(false);
        });
    }, []);

    if (!isLoading && !isLoggedIn) {
        return <Redirect href="/account/login" />;
    }

    if (!isLoading && isLoggedIn) {
        return <Redirect href="/home" />;
    }

    return (
        <View>
            <Text>...</Text>
        </View>
    );
};

export default Entry;
