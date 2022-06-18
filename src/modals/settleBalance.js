import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import { View, Modal, ScrollView, StyleSheet, Pressable } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import { PrimaryBtn } from '../components/buttons';
import { ThemeContext } from '../themeContext';
import { settleBalance } from '../methods/expenses';
import { Textfield, Layout, Utility } from '../styles';

export default SettleBalanceModal = ({ visible, setVisible, grpId, balance, ...rest }) => {
    const { theme } = useContext(ThemeContext);
    const [amt, setAmt] = useState(balance.amt.toString());
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [themeColor] = useState(theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark);
    console.log('bbb', themeColor, theme);

    const handleChange = useCallback(e => {
        setErr(null);

        e = e.replace(/^0+/, '').replace(/[^0-9/.]/g, '');

        if (e > balance.amt) {
            e = balance.amt.toString();
            setErr(`Max amount that can be paid is ${balance.amt}`);
        }

        setAmt(e);
    });

    const phoneFieldFocus = useCallback(() => {
        if (!userDetails.contact) {
            setUserDetails(userDetails => ({ ...userDetails, contact: geoInfo.phoneCode }));
        }
    });

    const savePayment = () => {
        const bal = { ...balance };
        bal.amt = parseFloat(amt).toFixed(2);

        const e = settleBalance(grpId, bal);

        if (e?.error) {
            setErr('Could not save transaction. Please cheack your internet connection');
            return;
        }

        setVisible(false);
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true} {...rest}>
            <View style={[Layout.modal.modalView]}>
                <View
                    style={[
                        Layout.modal.modalChildView,
                        { backgroundColor: themeColor.bg === Utility.Colors.dark.bg ? Utility.Colors.light.bg : Utility.Colors.dark.bg }
                    ]}
                >
                    <View style={[Layout.pageHeader, { width: '100%' }]}>
                        <MyText text="Settle Balance" bodyTitle style={{ fontFamily: 'PlayfairDisplay-Bold' }} />
                        <Pressable onPress={() => setVisible(false)}>
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </Pressable>
                    </View>
                    <MyText
                        text={`${balance.payee.name} paid ${balance.currency}${amt} to ${balance.receivor.name}`}
                        opacity="low"
                        bodySubTitle
                    />
                    <MyTextInput
                        style={[Textfield.field, { width: '100%' }]}
                        clearButtonMode="while-editing"
                        placeholder="Add amount"
                        keyboardType="phone-pad"
                        value={amt}
                        defaultValue={balance.amt.toString()}
                        onChangeText={e => handleChange(e)}
                    />
                    {/*<MyText text="Mobile contact (without country code)" opacity="low" style={{marginTop:20}} bodySubTitle />*/}
                    {/*<View
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
                    </View>*/}
                    <MyText text={err || ''} red />
                    <View style={{ width: '100%', marginTop: 30 }}>
                        <PrimaryBtn title="Confirm" onPress={savePayment} loading={loading} disabled={loading} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
