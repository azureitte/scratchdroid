import { StyleSheet, Text, ScrollView, TextStyle } from 'react-native';
import React from 'react';

type ScrollableTextProps = {
    children: React.ReactNode|React.ReactNode[];
    style?: TextStyle;
};

const ScrollableText = ({
    children,
    style,
}: ScrollableTextProps) => {
    return (
        <ScrollView 
            horizontal 
            nestedScrollEnabled={true} 
            showsHorizontalScrollIndicator={false}
            style={styles.container}
        >
            <Text style={style} numberOfLines={1}>
                {children}
            </Text>
        </ScrollView>
    );
};

export default ScrollableText;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
