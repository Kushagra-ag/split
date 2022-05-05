/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Splash from './src/screens/splash';
import Onboarding from './src/screens/onboarding';
import Registration from './src/screens/registration';
import Main from './src/screens/main';
import ThemeProvider from './src/themeContext';

GoogleSignin.configure({
    webClientId: '339463650314-pi097teo4aho0rshm4ulid1jeoqdp0ek.apps.googleusercontent.com',
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
    prefixes: ['split://', 'https://split.com'],
    config: {
        screens: {
            main: {
                screens: {
                    groups: {
                        path: 'group',
                        screens: {
                            joinGroup: 'join/:grpId'
                        }
                    }
                }
            }
        }
    }
};

const Stack = createNativeStackNavigator();

const App = () => {
    const [initCondition, setInitCondition] = useState(null);
    const [groupId, setGroupId] = useState(null);

    const handleDynamicLink = (link, a = null) => {
        console.log('from handleDynamicLink ', link, a);

        if (link?.url === 'https://unigma.page.link/group/join/123') {
            setInitCondition(true);
            setGroupId('123');
        }
    };

    const useLinking = async () => {
        const link = await Linking.getInitialURL();
        console.log('from linking method- ', link);

        if (link) {
            setInitCondition(true);
            setGroupId('123');
        } else {
            setInitCondition(false);
        }
    };

    useEffect(() => {
        // for links when app is foregrounded
        // const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
        // return () => unsubscribe();
    }, []);

    useEffect(() => {
        // for links when app is backgrounded
        //  dynamicLinks()
        //    .getInitialLink()
        //    .then(link => {Alert.alert(`link is ${link}`);
        //      handleDynamicLink(link, 'tt');
        //      })
        //    .catch(e => {
        //          console.log(e);

        // })

        useLinking();
    }, []);

    return (
        initCondition !== null && (
            <ThemeProvider>
                <NavigationContainer theme={navTheme} linking={linking}>
                    <Stack.Navigator initialRouteName="splash" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="onboarding" component={Onboarding} />
                        <Stack.Screen name="splash">
                            {props => (
                                <Splash
                                    navigation={props.navigation}
                                    initCondition={initCondition}
                                    params={{ groupId }}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="registration" component={Registration} />
                        <Stack.Screen name="default" component={Main} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ThemeProvider>
        )
    );
};

export default App;
