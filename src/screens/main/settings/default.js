import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    Switch,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { CountryPicker } from 'react-native-country-codes-picker/components/CountryPicker';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../../../components/myText';
import MyTextInput from '../../../components/myTextInput';
import { MobileSaveOTP, CountrySelectModal } from '../../../modals';
import { removeItemLocal, setItemLocal, getItemLocal } from '../../../methods/localStorage';
import { Layout, Textfield, Utility, Misc, Button } from '../../../styles';
import { ThemeContext } from '../../../themeContext';
import { PrimaryBtn } from '../../../components/buttons';
import Divider from '../../../components/divider';

export default SettingHome = ({ navigation }) => {
    const { theme, setTheme, geoInfo, setGeoInfo } = useContext(ThemeContext);
    const user = auth().currentUser;
    const [savedUser] = useState({
        name: user.displayName,
        contact: user.phoneNumber,
        country: `${geoInfo.name} (${geoInfo.phoneCode})`
    });
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [loading, setLoading] = useState({
        loading: false,
        otp: false
    });
    const [newUser, setNewUser] = useState({
        name: user.displayName,
        contact: user.phoneNumber || null,
        country: `${geoInfo.name} (${geoInfo.phoneCode})`
    });
    const [fieldsUpdated, setFieldsUpdated] = useState([]);
    const [phoneErr, setPhoneErr] = useState(false);
    const [otpModal, showOTPModal] = useState(false);
    const [countryModal, showCountryModal] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [otpSuccess, setOtpSuccess] = useState(false);
    const phoneRef = useRef();

    useFocusEffect(
        React.useCallback(() => {
            setLoading(loading => ({ ...loading, logout: false }));
        }, [])
    );

    function updateUser(val, key) {
        setOtpSuccess(false);
        setPhoneErr(false);

        if (key === 'contact') {
            val = val.replace(/[^0-9\+]/g, '');
            if (val.length > 1) {
                val.slice(0, 1) !== '+' ? (val = `+${val}`) : null;
            }
        }

        setNewUser(newUser => ({ ...newUser, [key]: val }));
        setBtnDisabled(false);
        setFieldsUpdated(fieldsUpdated => Array.from(new Set([...fieldsUpdated, key])));
    }

    const saveNewUser = () => {};

    const toggleTheme = () =>
        setTheme(previousState => {
            let t;
            if (theme === 'light') t = 'dark';
            else t = 'light';
            setItemLocal({
                key: 'uiMode',
                value: t
            });
            return t;
        });

    const themeColor = useMemo(() => {
        const currentTheme = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;
        return currentTheme;
    }, [theme]);

    const phoneFieldFocus = () => {
        if (!newUser.contact) {
            setNewUser(newUser => ({ ...newUser, contact: geoInfo.phoneCode }));
        }
    };

    const signInWithPhoneNumber = (phoneNumber) => {
        setLoading(loading => ({ ...loading, otp: true }));

        auth()
            .verifyPhoneNumber(phoneNumber)
            .then(confirmation => {
                console.log(confirmation);
                setConfirm(confirmation);
                setPhoneErr(false);
                setLoading(loading => ({ ...loading, otp: false }));
                showOTPModal(true);
                console.log('confiremed');
            })
            .catch(e => {
                console.log('eeeeeee', e.code);
                setLoading(loading => ({ ...loading, otp: false }));
                if (e.code === 'auth/invalid-phone-number') {
                    setPhoneErr('Invalid format. The correct format is +<Country_code>Number');
                } else {
                    setPhoneErr('Some unexpected error occured. Please check your internet connection');
                }
            });
    }

    const signOut = async () => {
        setLoading(loading => ({ ...loading, logout: true }));
        await removeItemLocal('userFriends');
        await GoogleSignin.revokeAccess();
        await auth().signOut();
        console.log('from signout ', auth().currentUser);
        navigation.reset({
            index: 0,
            routes: [{ name: 'registration' }]
        });
        // navigation.navigate('registration');
    };

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <KeyboardAvoidingView behavior="position">
                    <View style={[styles.photo, { borderColor: themeColor.high }]}>
                        <Image
                            source={{ uri: user.photoURL }}
                            resizeMode="cover"
                            resizeMethod="scale"
                            style={[styles.img]}
                        />
                    </View>
                    <MyText text="My account" bigTitle />
                    <View style={{ paddingTop: 15 }}>
                        <View style={Misc.rows.container}>
                            <MyText text="Dark theme" bodyTitleGilroy />
                            <Switch
                                onValueChange={toggleTheme}
                                value={theme === 'dark' ? true : false}
                                trackColor={{ false: themeColor.low, true: themeColor.low }}
                                thumbColor={themeColor.high}
                            />
                        </View>
                        <Divider />
                        <View style={Misc.rows.container}>
                            <View style={{ flexGrow: 1 }}>
                                <MyText text="Name" opacity="low" bodySubTitle />
                                <MyTextInput
                                    style={Textfield.field}
                                    clearButtonMode="while-editing"
                                    value={newUser.name}
                                    onChangeText={e => updateUser(e, 'name')}
                                />
                            </View>
                        </View>
                        <View style={Misc.rows.container}>
                            <View style={{ flexGrow: 1 }}>
                                <MyText text="E-mail" opacity="low" bodySubTitle />
                                <MyText text={user.email} opacity="low" bodyTitleGilroy />
                            </View>
                        </View>
                        <View style={Misc.rows.container}>
                            <View style={{ flexGrow: 1, maxWidth: '70%' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <MyText text="Phone number" opacity="low" bodySubTitle />
                                    {user.phoneNumber ? null : <View style={styles.notif}></View>}
                                </View>
                                <MyTextInput
                                    // ref={phoneRef}
                                    keyboardType="phone-pad"
                                    style={[Textfield.field]}
                                    clearButtonMode="while-editing"
                                    value={newUser.contact ?? ''}
                                    placeholder="Mobile Number"
                                    onFocus={phoneFieldFocus}
                                    onChangeText={e => updateUser(e, 'contact')}
                                />
                                {phoneErr && <MyText text={phoneErr} red />}
                            </View>
                            {newUser.contact != user.phoneNumber ? (
                                <Pressable
                                    onPress={() => {
                                        signInWithPhoneNumber(newUser.contact);
                                    }}
                                    disabled={loading.otp}
                                    style={({ pressed }) => [
                                        pressed ? { opacity: 0.6, backgroundColor: '#00000022' } : {},
                                        { padding: 5 }
                                    ]}
                                >
                                    {loading.otp ? (
                                        <ActivityIndicator size="small" color={themeColor.high} />
                                    ) : (
                                        <MyText text="Send OTP" />
                                    )}
                                </Pressable>
                            ) : null}
                            {otpSuccess ? <MyText text="Saved" green /> : null}
                        </View>
                        <Pressable style={Misc.rows.container} onPress={() => showCountryModal(true)}>
                            <View>
                                <MyText text="Country" opacity="low" bodySubTitle />
                                <MyText text={newUser.country} bodyTitleGilroy />
                            </View>
                        </Pressable>
                        <Divider />
                        <View style={Misc.rows.container}>
                            <Pressable onPress={signOut}>
                                <MyText
                                    text={loading.logout ? 'Logging out' : 'Log out'}
                                    opacity="low"
                                    bodyTitleGilroy
                                    red
                                />
                            </Pressable>
                            {loading.logout && (
                                <View>
                                    <ActivityIndicator size="small" color={themeColor.high} />
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={[Button.bottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                        <PrimaryBtn title="Save" onPress={null} disabled={btnDisabled} />
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
            <MobileSaveOTP
                visible={otpModal}
                setVisible={showOTPModal}
                newUser={newUser}
                setNewUser={setNewUser}
                confirm={confirm}
                themeColor={themeColor}
                setOtpSuccess={setOtpSuccess}
            />
            <CountrySelectModal
                visible={countryModal}
                setVisible={showCountryModal}
                updateUser={updateUser}
                themeColor={themeColor}
                geoInfo={geoInfo}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    photo: {
        height: 150,
        width: 150,
        marginBottom: 20,
        borderRadius: 75,
        overflow: 'hidden',
        borderColor: '#272727',
        borderWidth: 2
    },
    img: {
        flex: 1
    },
    notif: {
        marginLeft: 5,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: Utility.Colors.red
    }
});
