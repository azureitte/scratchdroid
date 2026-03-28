import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

import { useFonts } from '@expo-google-fonts/dela-gothic-one/useFonts';
import { DelaGothicOne_400Regular } from '@expo-google-fonts/dela-gothic-one/400Regular';

import { FONTS } from '@/util/assets';

type HeadingProps = {
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
};

const Heading = ({ 
    children, 
    style
}: HeadingProps) => {
    const [fontsLoaded] = useFonts({ DelaGothicOne_400Regular });

    return (
        <Text style={[
            styles.heading, 
            style,
            fontsLoaded && { 
                fontFamily: FONTS.delaGothicOne, 
                fontWeight: 400 
            },
        ]}>{children}</Text>
    );
};

export default Heading;

const styles = StyleSheet.create({
    heading: {
        color: '#fff',
        fontSize: 28,
    },
});
