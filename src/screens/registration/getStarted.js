import React, { useState, useContext } from 'react';
import { View, SafeAreaView, StyleSheet, Image, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ThemeContext } from '../../themeContext';
import { PrimaryBtn } from '../../components/buttons';
import { MyText } from '../../components/myText';
import { userSignIn } from '../../methods/user';
import { Layout, Utility } from '../../styles';

const GetStarted = ({ navigation }) => {
    const { geoInfo, setGeoInfo } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            setLoading(false);
            setErr(null);
        }, [])
    );

    async function onGoogleButtonPress() {
        console.log('in onGooglebtnpress');
        setLoading(true);
        try {
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            return auth().signInWithCredential(googleCredential);
        } catch (e) {
            console.log('eee- ', JSON.stringify(e));
            setLoading(false);
            setErr('Could not login. Please try again later');
        }
    }

    const signIn = async () => {
        // console.log(auth().currentUser);
        const e = await userSignIn(auth().currentUser, setGeoInfo);

        if (e?.error) {
            setErr(e.msg);
            setLoading(false);
            return;
        }

        navigation.replace('default', { screen: 'home' });
    };

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <View style={[styles.container]}>
                <Image source={require('../../assets/images/logo-dark.png')} resizeMode="center" />
                {loading ? (
                    <ActivityIndicator size="large" color="#272727" />
                ) : (
                    <PrimaryBtn
                        title="Sign in with Google"
                        onPress={() => onGoogleButtonPress().then(() => signIn())}
                        icon={{ name: 'logo-google', color: Utility.Colors.light.high }}
                        splash
                    />
                )}
                {err ? <MyText text={err} /> : null}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Utility.Colors.light.bg,
        color: '#272727'
    }
});

export default GetStarted;
