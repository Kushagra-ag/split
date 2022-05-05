import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import { View, Modal, ScrollView, StyleSheet, Pressable } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import { PrimaryBtn } from '../components/buttons';
import { checkNewGuestUser } from '../methods/user';
import { Textfield, Layout, Utility } from '../styles';

export default NewContactModal = ({
    visible,
    setVisible,
    name,
    themeColor,
    selectedUsers,
    setSelectedUsers,
    geoInfo
}) => {
    const [userDetails, setUserDetails] = useState({
        name: name || '',
        contact: '',
        email: ''
    });
    const [mode, setMode] = useState('email');
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback((e, key) => {
        setErr(null);

        if (key === 'contact') {
            e = e.replace(/ /g, '');
            e = e.replace(/[^0-9\+]/g, '');

            // if (e.length === 1) {
            //     e !== '+' ? (e = `+${e}`) : null;
            // }
        }
        setUserDetails(userDetails => ({ ...userDetails, [key]: e }));
    });

    const phoneFieldFocus = useCallback(() => {
        if (!userDetails.contact) {
            setUserDetails(userDetails => ({ ...userDetails, contact: geoInfo.phoneCode }));
        }
    });

    const duplicateCheck = (c, m) => {
        if (c) {
            const cDuplicate = selectedUsers.filter(u => u.contact === c);

            if (cDuplicate.length) {
                //duplicate number found
                setErr('This number is already added');
                return true;
            }
        }

        if (m) {
            const mDuplicate = selectedUsers.filter(u => u.email === m);

            if (mDuplicate.length) {
                //duplicate email found
                setErr('This email is already added');
                return true;
            }
        }

        return false;
    };

    const changeMode = useCallback(() => {
        mode === 'phone'
            ? setUserDetails(userDetails => ({ ...userDetails, contact: '' }))
            : setUserDetails(userDetails => ({ ...userDetails, email: '' }));
        setMode(mode === 'phone' ? 'email' : 'phone');
    });

    const savephone = async () => {
        const n = selectedUsers.length;

        if (n === 25) {
            setErr('Maximum 25 users allowed in a group');
            return;
        }

        // Check whether the relevant chosen fields aren't empty
        if (
            !(
                userDetails.name &&
                ((mode === 'phone' && userDetails.contact) || (mode === 'email' && userDetails.email))
            )
        ) {
            setErr('Both fields are required');
            return;
        }

        // Email validation
        if (mode === 'email' && !userDetails.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            setErr('Invalid email format');
            return;
        }

        if (auth().currentUser.phoneNumber === userDetails.contact.replace(/ /g, '')) {
            setErr('You are added to the group by default :)');
            return;
        }

        if (duplicateCheck(userDetails.contact, userDetails.email)) {
            return;
        }

        setLoading(true);

        const user = await checkNewGuestUser(userDetails, true);

        if (!user) {
            setErr('Cannot save user. Try again later');
            setLoading(false);
            return;
        }

        // if(auth().currentUser.uid === user._id) {
        //     setErr('You are added to the group by default :)')
        //     setLoading(false);
        //     return
        // }

        setUserDetails({
            name: '',
            contact: '',
            email: ''
        });
        setLoading(false);
        setVisible(false);
        setSelectedUsers(selectedUsers => [...selectedUsers, user]);
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={[Layout.modal.modalView]}>
                <View
                    style={[
                        Layout.modal.modalChildView,
                        {
                            backgroundColor:
                                themeColor.bg === Utility.Colors.dark.bg
                                    ? Utility.Colors.light.bg
                                    : Utility.Colors.dark.bg
                        }
                    ]}
                >
                    <View style={[Layout.pageHeader, { width: '100%' }]}>
                        <MyText text="Add new contact" bodyTitle style={{ fontFamily: 'PlayfairDisplay-Bold' }} />
                        <Pressable onPress={() => setVisible(false)}>
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </Pressable>
                    </View>
                    {/*<MyText text="Name" opacity="low" bodySubTitle />*/}
                    <MyTextInput
                        style={[Textfield.field, { width: '100%' }]}
                        clearButtonMode="while-editing"
                        placeholder="Add name"
                        value={userDetails.name}
                        onChangeText={e => handleChange(e, 'name')}
                    />
                    {/*<MyText text="Mobile contact (without country code)" opacity="low" style={{marginTop:20}} bodySubTitle />*/}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            maxWidth: '100%'
                        }}
                    >
                        {mode === 'phone' && (
                            <MyTextInput
                                keyboardType="phone-pad"
                                style={[Textfield.field, { maxWidth: '75%', minWidth: '75%' }]}
                                clearButtonMode="while-editing"
                                placeholder="Mobile (with country code)"
                                value={userDetails.contact}
                                onChangeText={e => handleChange(e, 'contact')}
                                onFocus={phoneFieldFocus}
                            />
                        )}
                        {mode === 'email' && (
                            <MyTextInput
                                keyboardType="email-address"
                                style={[Textfield.field, { maxWidth: '75%', minWidth: '75%' }]}
                                clearButtonMode="while-editing"
                                placeholder="Enter your email"
                                value={userDetails.email}
                                onChangeText={e => handleChange(e, 'email')}
                            />
                        )}
                        <Pressable
                            onPress={changeMode}
                            style={({ pressed }) => [
                                pressed ? { opacity: 0.6 } : {},
                                { padding: 8, backgroundColor: '#00000022', borderRadius: 4 }
                            ]}
                        >
                            <MyText text={`Use ${mode === 'phone' ? 'email' : 'phone'}`} subTitle />
                        </Pressable>
                    </View>
                    {err && <MyText text={err} red />}
                    <View style={{ width: '100%', marginTop: 30 }}>
                        <PrimaryBtn title="Save" onPress={savephone} loading={loading} disabled={loading} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
