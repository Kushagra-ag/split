import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Default from './default';
import ContactUs from './contactUs';

const settingStack = createNativeStackNavigator();

export default Settings = ({ navigation }) => {
    return (
        <settingStack.Navigator initialRouteName="home" screenOptions={{ headerShown: false }}>
            <settingStack.Screen name="default" component={Default} />
            <settingStack.Screen name="contactUs" component={ContactUs} />
        </settingStack.Navigator>
    );
};
