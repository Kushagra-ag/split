import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default NextBtn = ({ onPress }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.nxt} onPress={onPress} activeOpacity={0.6}>
                <Icon name="arrow-forward" color="#fff" size={32} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    nxt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        maxHeight: 100,
        backgroundColor: '#272727cc',
        borderRadius: 50
        // padding: 20
    }
});
