import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeContext } from '../../themeContext';
import { Utility } from '../../styles';
import Home from './home';
import Settings from './settings';
import Groups from './groups';

const mainStack = createNativeStackNavigator();

const Main = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <View
            style={[
                styles.mainContainer,
                { backgroundColor: theme === 'dark' ? Utility.Colors.dark.high : Utility.Colors.light.bg }
            ]}
        >
            <mainStack.Navigator initialRouteName="home" screenOptions={{ headerShown: false }}>
                <mainStack.Screen name="home" component={Home} />
                <mainStack.Screen name="settings" component={Settings} />
                <mainStack.Screen name="groups" component={Groups} />
            </mainStack.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    }
});

export default Main;
