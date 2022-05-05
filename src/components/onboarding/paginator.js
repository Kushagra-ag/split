import React from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

export default Paginator = ({ data, scrollX }) => {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.paginator}>
            {data.map((item, idx) => {
                const iRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
                const dotWidth = scrollX.interpolate({
                    inputRange: iRange,
                    outputRange: [10, 20, 10],
                    extrapolate: 'clamp'
                });

                return <Animated.View style={[styles.dot, { width: dotWidth }]} key={idx.toString()} />;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    paginator: {
        flexDirection: 'row',
        height: 48
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#272727',
        marginHorizontal: 8
    }
});
