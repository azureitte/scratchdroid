import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ExplorePage = () => {
    return (
        <View style={styles.container}>
            <Text>Explore</Text>
        </View>
    );
};

export default ExplorePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
    },
});
