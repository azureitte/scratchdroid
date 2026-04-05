import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';

const ListLoading = ({
    marginTop = 0,
}: {
    marginTop?: number;
}) => {
    return (
        <View style={[styles.container, { marginTop }]}>
            <ActivityIndicator size="large" color="#93C0FF" />
        </View>
    );
};

export default ListLoading;

const styles = StyleSheet.create({
    container: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        maxHeight: 200,
        width: '100%',
    },
});