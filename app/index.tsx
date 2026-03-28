import { Text, View } from "react-native";

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
