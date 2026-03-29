import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';

const ListLoading = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#71A3FF" />
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