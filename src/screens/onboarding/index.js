import React, { useState, useRef } from 'react';
import { View, SafeAreaView, StyleSheet, Text, FlatList, Animated } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { OnboardingItem, Paginator, NextBtn } from '../../components/onboarding';
import { Layout, Utility } from '../../styles';

const slides = [
    {
        id: 0,
        title: 'Welcome',
        desc: 'This is desc',
        img: require('../../assets/images/logo-dark.png')
    },
    {
        id: 1,
        title: 'Welcome',
        desc: 'This is desc',
        img: require('../../assets/images/logo-dark.png')
    },
    {
        id: 2,
        title: 'Welcome',
        desc: 'This is desc',
        img: require('../../assets/images/logo-dark.png')
    }
];

export default Onboarding = ({ navigation }) => {
    const [index, setIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const itemsChanged = useRef(({ viewableItems }) => {
        setIndex(viewableItems[0].index);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const btnScroll = async () => {
        if (index < slides.length - 1) {
            slidesRef.current.scrollToIndex({ index: index + 1 });
        } else {
            navigation.navigate('registration');
            await EncryptedStorage.setItem('visited', 'yes');
        }
    };

    return (
        <SafeAreaView style={[Layout.safeAreaContainer, styles.container]}>
            <View style={{ flex: 4 }}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={item => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false
                    })}
                    onViewableItemsChanged={itemsChanged}
                    viewabilityConfig={viewConfig}
                    scrollEventThrottle={32}
                    ref={slidesRef}
                />
            </View>
            <Paginator data={slides} scrollX={scrollX} />
            <NextBtn onPress={btnScroll} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Utility.Colors.light.bg,
        color: '#272727'
    }
});
