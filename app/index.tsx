import { Text, View } from "react-native";
import { Redirect } from "expo-router";

import { useSession } from "@/hooks/useSession";
import { useChangeAppStateOnFocus } from "@/hooks/useChangeAppStateOnFocus";

const Entry = () => {

    const { isLoggedIn, isLoading } = useSession();

    useChangeAppStateOnFocus({
        headerVisible: false,
        footerVisible: false,
    });

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
