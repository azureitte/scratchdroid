import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChangeAppStateOnFocus } from "@/hooks/useChangeAppStateOnFocus";
import { useL10n } from "@/hooks/useL10n";

import Select from "@/components/general/Select";

const SettingsPage = () => {

    const insets = useSafeAreaInsets();
    const { languages, locale, setLocale } = useL10n();

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
            paddingTop: insets.top + 80,
            paddingBottom: insets.bottom,
            paddingHorizontal: 16,
        }}>
            <Select 
                label="Language" 
                items={languages} 
                value={locale} 
                onChange={setLocale}
            />
        </View>
    );
};

export default SettingsPage;
