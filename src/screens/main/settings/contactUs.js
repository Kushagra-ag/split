import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    Switch,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView
} from 'react-native';
import { Layout, Textfield, Utility, Misc, Button } from '../../../styles';
import { PrimaryBtn } from '../../../components/buttons';

export default ContactUs = ({ navigation }) => {
    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <KeyboardAvoidingView behavior="position"></KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
};
