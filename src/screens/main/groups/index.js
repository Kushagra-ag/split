import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Default from './default';
import NewGroup from './newGroup';
import Expenses from './expenses';
import JoinGroup from './joinGroup';

const groupStack = createNativeStackNavigator();

export default Settings = ({ navigation }) => {
    return (
        <groupStack.Navigator initialRouteName="default" screenOptions={{ headerShown: false }}>
            <groupStack.Screen name="default">{props => <Default {...props} />}</groupStack.Screen>
            <groupStack.Screen name="newGroup" component={NewGroup} />
            <groupStack.Screen name="expenses" component={Expenses} />
            <groupStack.Screen name="joinGroup" component={JoinGroup} />
        </groupStack.Navigator>
    );
};
