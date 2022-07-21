import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Default from './default';
import ContactUs from './contactUs';
import PaymentMethods from './paymentMethods';

const settingStack = createNativeStackNavigator();

export default Settings = ({ navigation }) => {
    return (
        <settingStack.Navigator initialRouteName="home" screenOptions={{ headerShown: false }}>
            <settingStack.Screen name="default" component={Default} />
            <settingStack.Screen name="contactUs" component={ContactUs} />
            <settingStack.Screen name="paymentMethods" component={PaymentMethods} />
        </settingStack.Navigator>
    );
};
