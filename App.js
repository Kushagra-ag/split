/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { GOOGLE_WEB_CLIENT_ID } from '@env';
import React, { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Splash from './src/screens/splash';
import Onboarding from './src/screens/onboarding';
import Registration from './src/screens/registration';
import Main from './src/screens/main';
import ThemeProvider from './src/themeContext';

GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false
});

const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: 'transparent'
    }
};

const linking = {
    prefixes: ['split://', 'https://split.com', 'https://unigma.page.link'],
    config: {
        screens: {
            default: {
                screens: {
                    groups: {
                        path: 'group',
                        screens: {
                            index: 0,
                            joinGroup: {
                                path: 'join/:grpId'
                            }
                        }
                    }
                }
            }
        }
    }
};

const Stack = createNativeStackNavigator();

const App = () => {
    // const [initCondition, setInitCondition] = useState(false);
    // const [groupId, setGroupId] = useState(null);

    // const useLinking = async (link) => {console.log('in uselinking', link);
    //     link = link ? link.url : await Linking.getInitialURL();
    //     console.log('from linking method- ', link);

    //     if (link) {
    //         setInitCondition(true);
    //         setGroupId('123');
    //     } else {
    //         setInitCondition(false);
    //     }
    // };

    return (
        <ThemeProvider>
            <NavigationContainer theme={navTheme} linking={linking}>
                <Stack.Navigator initialRouteName="splash" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="onboarding" component={Onboarding} />
                    <Stack.Screen name="splash" component={Splash} />
                    <Stack.Screen name="registration" component={Registration} />
                    <Stack.Screen name="default" component={Main} />
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
};

export default App;
