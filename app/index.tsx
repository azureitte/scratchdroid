import { Text, View } from "react-native";
import { Redirect } from "expo-router";

import { useSession } from "../hooks/useSession";

const Entry = () => {

    const { isLoggedIn, isLoading } = useSession();

    if (!isLoading) {
        return <Redirect href={isLoggedIn ? "/home" : "/account/login"} />;
    }

    return (
        <View>
            <Text>...</Text>
        </View>
    );
};

export default Entry;
