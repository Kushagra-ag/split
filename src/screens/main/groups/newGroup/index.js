import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Default from './default';
import AddMembers from './addMembers';
import VerifyMembers from './verifyMembers';
// import JoinGroup from './joinGroup';

const newGroupStack = createNativeStackNavigator();

export default Settings = ({ navigation }) => {
    return (
        <newGroupStack.Navigator initialRouteName="default" screenOptions={{ headerShown: false }}>
            {/*<newGroupStack.Screen name="default">{props => <Default {...props} />}</groupStack.Screen>*/}
            <newGroupStack.Screen name="default" component={Default} />
            <newGroupStack.Screen name="addMembers" component={AddMembers} />
            <newGroupStack.Screen name="verifyMembers" component={VerifyMembers} />
            {/*<newGroupStack.Screen name="joingroup" component={JoinGroup} />*/}
        </newGroupStack.Navigator>
    );
};
