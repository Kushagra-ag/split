import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { Alert, ActivityIndicator, View, Modal, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import { PrimaryBtn, RedBtn } from '../components/buttons';
import { settleBalance } from '../methods/expenses';
import { removeGroupMember } from '../methods/groups';
import { Textfield, Layout, Utility, Misc } from '../styles';

export default groupMemberInfoModal = ({
    visible,
    setVisible,
    themeColor,
    balanceInfo,
    member,
    relUserId,
    grpId,
    updateMembersAfterDelete,
    homeNavigate
}) => {
    const [err, setErr] = useState(null);
    const [u] = useState(auth().currentUser.uid);
    const [b, setB] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trashBtnLoading, setTrashBtnLoading] = useState(false);
    const [settleUpInput, setSettleUpInput] = useState({
        collapsed: true,
        value: null
    });

    const handleAmtChange = e => {
        setErr(null);

        e = e.replace(/[^0-9/.]/g, '');

        if (e > settleUpInput.value) {
            e = b.amt.toString();
            setErr(`Max amount that can be paid is ${b.amt}`);
        }

        setSettleUpInput(settleUpInput => ({ ...settleUpInput, value: e }));
    };

    const savePayment = () => {
        const bal = { ...b };
        bal.amt = parseFloat(settleUpInput.value).toFixed(2);

        const e = settleBalance(grpId, bal);

        if (e?.error) {
            setErr('Could not complete request. Please check your internet connection');
            return;
        }

        setVisible(false);
    };

    const delMember = (self = false) => {
        setTrashBtnLoading(true);
        setLoading(true);

        let unresolved = false;

        balanceInfo &&
            balanceInfo[0].balSummary.forEach(item => {
                if (item.amt != 0) unresolved = true;
            });

        const deleteConfirm = async () => {
            const e = await removeGroupMember(member._id, grpId);
            setTrashBtnLoading(false);
            setLoading(false);

            if (e?.error) {
                setErr(e.msg);
                return;
            }

            if (self) {
                setVisible(false);
                homeNavigate();
                return;
            }

            updateMembersAfterDelete(member._id);
            setVisible(false);
        };

        if (unresolved) {
            Alert.alert('', 'Cannot delete user as they have unresolved balances', [
                {
                    text: 'OK',
                    onPress: () => {
                        setTrashBtnLoading(false);
                        setLoading(false);
                    }
                }
            ]);
            return;
        }

        Alert.alert(
            '',
            `Are you sure you want to ${u === member._id ? 'leave this group' : `remove ${member.name}`}?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => {
                        setTrashBtnLoading(false);
                        setLoading(false);
                    }
                },
                { text: 'Yes', onPress: deleteConfirm }
            ]
        );
    };

    useEffect(() => {
        console.log(balanceInfo, member, relUserId, visible);

        balanceInfo &&
            balanceInfo[0].balSummary.forEach(item => {
                if (item.payee.relId === relUserId[u] || item.receivor.relId === relUserId[u]) {
                    console.log('bbingo!', item);
                    setB(item);
                    setSettleUpInput(settleUpInput => ({ ...settleUpInput, value: item.amt.toString() }));
                }
            });
    }, []);

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
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ marginRight: 15 }}>
                                <Image
                                    source={{ uri: member.photoURL }}
                                    {...(member.photoURL
                                        ? { source: { uri: member.photoURL } }
                                        : { source: require('../assets/images/profile-default.png') })}
                                    // source={require('../../../../assets/images/logo-dark.png')}
                                    resizeMode="cover"
                                    resizeMethod="scale"
                                    style={Misc.rows.profilePhotoSmall}
                                />
                            </View>
                            <MyText
                                text={member.name}
                                bodyTitle
                                style={[Misc.width[75], { fontFamily: 'PlayfairDisplay-Bold', flexGrow: 1 }]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            />
                        </View>
                        <Pressable onPress={() => setVisible(false)}>
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </Pressable>
                    </View>
                    {b ? (
                        <>
                            <View style={[Misc.rows.container, { width: '100%', paddingBottom: 10, paddingTop: 0 }]}>
                                <MyText text={b.msg} style={Misc.width[80]} bodySubTitle />
                                <Pressable
                                    style={({ pressed }) => [
                                        pressed ? { opacity: 0.6 } : {},
                                        { padding: 5, marginLeft: 10, backgroundColor: '#00000022' }
                                    ]}
                                    onPress={() => {
                                        setErr(null);
                                        setSettleUpInput(settleUpInput => ({
                                            ...settleUpInput,
                                            collapsed: !settleUpInput.collapsed
                                        }));
                                    }}
                                >
                                    <MyText text="Settle" />
                                </Pressable>
                            </View>
                            {!settleUpInput.collapsed && (
                                <MyTextInput
                                    value={settleUpInput.value}
                                    style={[Textfield.field, { width: '100%' }]}
                                    clearButtonMode="while-editing"
                                    keyboardType="phone-pad"
                                    onChangeText={handleAmtChange}
                                />
                            )}
                        </>
                    ) : u === member._id ? (
                        <MyText text="Hey there! You don't owe yourself anything :P" />
                    ) : (
                        <MyText text={`You are settled up with ${member.name}!`} />
                    )}

                    <View style={[{ width: '100%', marginTop: 30 }]}>
                        {err && <MyText text={err || ''} style={{ textAlign: 'left' }} error />}
                        {settleUpInput.collapsed ? (
                            <RedBtn
                                title={u === member._id ? 'Leave group' : 'Remove Member'}
                                onPress={() => delMember(u === member._id)}
                                loading={loading}
                                disabled={loading}
                            />
                        ) : (
                            <View style={[Misc.rows.container, { paddingVertical: 0 }]}>
                                <PrimaryBtn
                                    title="Confirm"
                                    style={{ flexGrow: 1 }}
                                    onPress={savePayment}
                                    loading={loading}
                                    disabled={trashBtnLoading || loading}
                                />
                                <Pressable
                                    style={[styles.iconBg, { backgroundColor: Utility.Colors.red, marginLeft: 20 }]}
                                    onPress={delMember}
                                    disabled={trashBtnLoading || loading}
                                >
                                    {trashBtnLoading ? (
                                        <ActivityIndicator
                                            size="small"
                                            // style={{ paddingVertical: 11 }}
                                            color={Utility.Colors.light.bg}
                                        />
                                    ) : (
                                        <Icon name="trash" color={Utility.Colors.light.bg} size={28} />
                                    )}
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    iconBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden'
    }
});
