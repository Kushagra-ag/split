import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStarted from './getStarted';

const regStack = createNativeStackNavigator();

const Registration = ({ navigation }) => {
    return (
        <regStack.Navigator initialRouteName="getStarted" screenOptions={{ headerShown: false }}>
            <regStack.Screen name="getStarted" component={GetStarted} />
        </regStack.Navigator>
    );
};

export default Registration;
