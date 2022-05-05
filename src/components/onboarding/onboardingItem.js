import React from 'react';
import { Text, View, Image, useWindowDimensions, StyleSheet } from 'react-native';

export default OnboardingItem = ({ item }) => {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <Image source={item.img} style={[styles.image, { width, resizeMode: 'contain' }]} />
            <View style={[styles.content]}>
                <Text style={[styles.title]}>{item.title}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        flex: 0.7,
        justifyContent: 'center',
        maxWidth: '80%'
    },
    content: {
        flex: 0.3
    },
    title: {
        color: '#272727'
    }
});
