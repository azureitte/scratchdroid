import { Text, View } from "react-native";
import { Redirect } from "expo-router";

import { useSession } from "@/hooks/useSession";
import { useChangeAppStateOnFocus } from "@/hooks/useChangeAppStateOnFocus";

const Entry = () => {

    useChangeAppStateOnFocus({
        headerVisible: false,
        footerVisible: false,
    });

    return (
        <View>
            <Text>...</Text>
        </View>
    );
};

export default Entry;
