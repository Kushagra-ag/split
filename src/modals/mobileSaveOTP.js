import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { View, Modal, ScrollView, StyleSheet, Pressable } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import { PrimaryBtn } from '../components/buttons';
import { updateUserContact } from '../methods/user';
import { Textfield, Layout, Utility } from '../styles';

export default MobileSaveOTP = ({ visible, setVisible, newUser, setNewUser, confirm, themeColor, setOtpSuccess }) => {
    const [err, setErr] = useState(null);
    const [code, setCode] = useState('');
    const [otpConfirm, setOtpconfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    // const user = auth().currentUser;
    async function confirmCode() {
        try {
            // await confirm.confirm(code);
            let update = 0,
                e;
            setLoading(true);
            console.log(confirm);
            console.log('conf- ', confirm.verificationId, code);

            const credential = auth.PhoneAuthProvider.credential(confirm.verificationId, code);
            console.log('ccc', credential);
            console.log('confirmed!');

            const user = auth().currentUser;
            console.log(user.providerData);

            user.providerData.forEach(provider => {
                if (provider.providerId === 'phone') update = 1;
            });

            const catchFunc = err => {
                setLoading(false);
                console.log('the error is ', err, err.code, err.message, user);

                if (err.code === 'auth/invalid-verification-code') {
                    setErr('Invalid code');
                } else if (err.code === 'auth/credential-already-in-use') {
                    setErr('Number already registered');
                } else {
                    setErr("Couldn't save number");
                }

                // setNewUser(newUser => ({ ...newUser, contact: user.phoneNumber }));
                setOtpconfirm(false);
            };

            const successFunc = async res => {
                console.log('ress ', res);

                const suc = () => {
                    setCode('');
                    setOtpconfirm(true);
                    setLoading(false);
                    setErr(null);
                    setCode('');
                    setNewUser(newUser => ({ ...newUser, contact: auth().currentUser.phoneNumber }));
                    setVisible(false);
                    setOtpSuccess(true);
                };

                const fail = () => {
                    setLoading(false);
                    setErr("Couldn't save number");
                };
                await updateUserContact(user.uid, newUser.contact, suc, fail);
            };

            if (update) {
                await user
                    .updatePhoneNumber(credential)
                    .then(res => successFunc(res))
                    .catch(err => catchFunc(err));

                console.log('after updatePhoneNumber');
                return;
            }

            await user
                .linkWithCredential(credential)
                .then(res => successFunc(res))
                .catch(err => catchFunc(err));
        } catch (error) {
            setLoading(false);
            setErr("Couldn't save number");
        }
    }

    const handleCodeChange = e => {
        e = e.replace(/ /g, '');
        e = e.replace(/[^0-9]/g, '');
        setCode(e);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => {
                !otpConfirm && setNewUser(newUser => ({ ...newUser, contact: auth().currentUser.phoneNumber }));
            }}
        >
            <View style={[Layout.modal.modalView]}>
                <View
                    style={[
                        Layout.modal.modalChildView,
                        {
                            backgroundColor:
                                themeColor.bg === '#272727' ? Utility.Colors.light.bg : Utility.Colors.dark.bg
                        }
                    ]}
                >
                    <View style={[Layout.pageHeader, { width: '100%' }]}>
                        <MyText text="Phone verification" bodyTitle style={{ fontFamily: 'PlayfairDisplay-Bold' }} />
                        <Pressable
                            onPress={() => {
                                !otpConfirm &&
                                    setNewUser(newUser => ({ ...newUser, contact: auth().currentUser.phoneNumber }));
                                setVisible(false);
                            }}
                        >
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </Pressable>
                    </View>
                    <MyText
                        text={`OTP sent to number ending with ${newUser.contact?.slice(-3)}`}
                        opacity="low"
                        bodySubTitle
                    />
                    <MyTextInput
                        value={code}
                        style={[Textfield.field, { width: '100%' }]}
                        clearButtonMode="while-editing"
                        keyboardType="phone-pad"
                        placeholder="Enter OTP"
                        onChangeText={text => handleCodeChange(text)}
                    />
                    {err && <MyText text={err} red />}
                    <View style={{ width: '100%', marginTop: 30 }}>
                        <PrimaryBtn title="Confirm" onPress={confirmCode} loading={loading} disabled={loading} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
