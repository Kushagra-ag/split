import React, { useState, useEffect, useContext } from 'react';
import { View, SafeAreaView, StyleSheet, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import EncryptedStorage from 'react-native-encrypted-storage';
import MyText from '../components/myText';
import { Layout } from '../styles';
import { getUserGroups } from '../methods/user';
import { ThemeContext } from '../themeContext';

const Splash = ({ navigation, initCondition, params }) => {
    const [redirectTo, setRedirectTo] = useState(null);
    // const [err, setErr] = useState(false);
    // const uiMode = useContext(ThemeContext);
    let DebounceDueTime = 200,
        debounceTimeout;

    const checkFirstTime = async () => {
        let visited = await EncryptedStorage.getItem('visited');
        return visited;
    };

    const debounce = user => {
        if (debounceTimeout) clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            debounceTimeout = null;
            onAuthStateChanged(user);
        }, DebounceDueTime);
    };

    async function onAuthStateChanged(user) {
        console.log('state changed- ', user);
        console.log('initCondition detected - ', params);
        // await EncryptedStorage.clear()

        if (user) {
            if (initCondition) {
                navigate('default', {
                    screen: 'groups',
                    params: {
                        screen: 'joinGroup',
                        params: {
                            grpId: params.groupId
                        }
                    }
                });
            } else {
                console.log('settimg redirect to main');
                navigate('default');
            }
        } else {
            console.log('no user found -Splash.js - onAuthStateChanged');
            const visited = await checkFirstTime();
            visited ? navigate('registration') : navigate('onboarding');
        }
    }

    const navigate = async (screen, params = null) => {
        console.log('from navigate - screen - ', screen);

        if (screen === 'default') {
            // Preloading homepage Info ~350ms
            let userGroupInfo = await getUserGroups(auth().currentUser.uid);
            params = params
                ? { ...params, userGroupInfo }
                : {
                      screen: 'home',
                      params: {
                          userGroupInfo
                      }
                  };
        }

        setTimeout(() => {
            navigation.replace(screen, params);
        }, 1000);
    };

    useEffect(() => {
        console.log('from splash useeffect ', initCondition, params);
        const subscriber = auth().onAuthStateChanged(debounce);
        return subscriber;
    }, []);

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <View style={styles.splashContainer}>
                <Image source={require('../assets/images/logo-white.png')} resizeMode="center" />
            </View>
            <View style={styles.unigma}>
                <MyText text="UNIGMA" splashText />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#272727'
    },
    unigma: {
        position: 'absolute',
        bottom: 0
    }
});

export default Splash;
