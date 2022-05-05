import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Default from './default';
// import AddExpense from './addExpense';
import ExpenseDistribution from './expenseDistribution';

const newExpenseStack = createNativeStackNavigator();

export default Settings = ({ navigation }) => {
    return (
        <newExpenseStack.Navigator initialRouteName="default" screenOptions={{ headerShown: false }}>
            {/*<newExpenseStack.Screen name="default">{props => <Default {...props} />}</groupStack.Screen>*/}
            <newExpenseStack.Screen name="default" component={Default} />
            <newExpenseStack.Screen name="expenseDistribution" component={ExpenseDistribution} />
        </newExpenseStack.Navigator>
    );
};
