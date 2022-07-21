import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    Switch,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../../themeContext';
import { Layout, Textfield, Utility, Misc, Button } from '../../../styles';
import { PrimaryBtn } from '../../../components/buttons';
import MyText from '../../../components/myText';
import MyTextInput from '../../../components/myTextInput';

export default PaymentMethods = ({ navigation, route }) => {
    const { theme } = useContext(ThemeContext);
    const [modeUpi, updateModeUpi] = useState();
    const [modeWallet, updateModeWallet] = useState();

    const themeColor = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;

    const walletLogos = {
        paytm: require('../../../assets/images/merchants/paytm.png'),
        phonepe: require('../../../assets/images/merchants/phonepe.png'),
        gpay: require('../../../assets/images/merchants/paytm.png')
    }

    const addUpi = () => {
        updateModeUpi(modeUpi => [...modeUpi, { upi: '', isNewlyAdded: true}]);
    }

    const handleUpiChange = (e, idx) => {
        updateModeUpi(modeUpi => {
            let upiMethods = [...modeUpi];
            upiMethods[idx].upi = e;
            return upiMethods;
        })
    }

    const removeUpi = (upi, idx, cancel=false) => {

        const confirmRemoveUpi = () => {
            let upiMethods = [...modeUpi];
            upiMethods.splice(idx, 1);
            updateModeUpi(upiMethods);
        };

        // if the upi field is empty, no need for confirmaiton
        if(cancel || !Boolean(upi.upi.trim())) {
            confirmRemoveUpi();
            return
        }

        Alert.alert(
            '',
            `Are you sure you want to delete this upi method?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => null
                },
                { text: 'Yes', onPress: confirmRemoveUpi }
            ]
        );
    }
    
    const handleWalletChange = (e, wallet) => {
        updateModeWallet(modeWallet => {
            let modeWalletCpy = [...modeWallet];
            modeWalletCpy.forEach((w, i) => {
                if(w.merchant === wallet.merchant) {
                    modeWalletCpy[i].contact = e;
                }
            });

            return modeWalletCpy;
        })
    }

    useEffect(() => {
        let paymentMethods = route.params.paymentMethods;
        const wallets = paymentMethods?.wallets || [];
        const vendors = Object.keys(walletLogos);
        const userSetVendors = paymentMethods?.wallets?.map(w => w.merchant) || [];

        updateModeUpi(paymentMethods?.upi.map(upi => ({upi, isNewlyAdded: false})));

        vendors.forEach(vendor => {
            if(!(userSetVendors.indexOf(vendor) !== -1)) {
                wallets.push({
                    merchant: vendor
                })
            }
        });
        updateModeWallet(wallets)
    }, [])

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <KeyboardAvoidingView behavior="position">
                    <View style={Layout.pageHeader}>
                        <MyText text="Payment modes" title ellipsizeMode="tail" numberOfLines={1} />
                    </View>
                    <MyText
                        text="Set your preferred payment methods. These will be visible to others when they want to settle expenses with you"
                        subTitle
                        style={{ paddingBottom: 30 }}
                    />
                    <View style={[Misc.rows.container, styles.listTitle]}>
                        <MyText
                            text="UPI"
                            bodyTitle
                            style={[{ fontFamily: 'Urbanist-Bold' }]}
                            letterSpacing={0}
                        />
                        {(!modeUpi || modeUpi.length < 3) && <PrimaryBtn title="Add" size="small" onPress={addUpi} />}
                    </View>
                    {modeUpi?.length > 0 && modeUpi.map((upi, idx) => <View key={idx} style={[Misc.rows.container, {paddingVertical: 5}]}>
                        <MyTextInput
                                    style={[Textfield.smallField]}
                                    value={upi.upi}
                                    placeholder="Add new UPI method"
                                    onChangeText={(e) => handleUpiChange(e, idx)}
                                    editable={Boolean(upi.isNewlyAdded)}
                                />
                        {!upi.isNewlyAdded ? <TouchableOpacity onPress={() => removeUpi(upi, idx)}>
                            <View>
                                <Icon
                                    name="close-circle-outline"
                                    color={themeColor.med}
                                    size={28}
                                    style={{ paddingRight: 1 }}
                                />
                            </View>
                        </TouchableOpacity>: 
                        <TouchableOpacity onPress={() => removeUpi(upi, idx, true)} style={{backgroundColor: '#00000022', padding: 5}}>
                            <MyText text="Cancel" bodySubTitle />
                        </TouchableOpacity>}
                    </View>)}
                    <View style={[Misc.rows.container, {paddingTop: 40}]}>
                        <MyText
                            text="Wallets"
                            bodyTitle
                            style={[{ fontFamily: 'Urbanist-Bold' }]}
                            letterSpacing={0}
                        />
                    </View>
                    {
                        modeWallet?.length > 0 && modeWallet.map(wallet => <View key={wallet.merchant} style={[Misc.rows.container, {paddingVertical: 5}]}>
                            <View style={[Misc.rows.profilePhotoSmall, { marginRight: 15, borderWidth: 1, borderColor: themeColor.bg }]}>
                                <Image
                                    source={walletLogos[wallet.merchant]}
                                    resizeMode="cover"
                                    resizeMethod="scale"
                                    style={Misc.rows.profilePhotoImg}
                                />
                            </View>
                            <View style={Misc.rows.itemLeftGrow}>
                                    <MyTextInput
                                        keyboardType="phone-pad"
                                        style={[Textfield.field]}
                                        value={wallet.contact}
                                        placeholder={`${wallet.merchant} mobile here`}
                                        onChangeText={e => handleWalletChange(e, wallet)}
                                    />
                            </View>
                        </View>)
                    }
                </KeyboardAvoidingView>
                <View style={[Button.bottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                    <PrimaryBtn
                        title="Save"
                        onPress={() => null
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    listTitle: {
        // paddingBottom: 10,
        paddingVertical: 10
    }
});
