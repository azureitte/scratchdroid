import { Image, Text, View } from "react-native";

import { useChangeAppStateOnFocus } from "@/hooks/useChangeAppStateOnFocus";
import { IMAGES } from "@/util/assets";

const NewsPage = () => {

    useChangeAppStateOnFocus({
        headerVisible: true,
        footerVisible: false,
        primaryColor: 'regular',
    });

    return (
        <View style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
        }}>
            <Image source={IMAGES.art.scratchNews} style={{
                width: '80%',
                objectFit: 'contain',
                marginTop: 60,
            }} />
        </View>
    );
};

export default NewsPage;
