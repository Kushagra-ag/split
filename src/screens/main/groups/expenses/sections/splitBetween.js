import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
    View,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../../../../themeContext';
import MyText from '../../../../../components/myText';
import MyTextInput from '../../../../../components/myTextInput';
import reqHandler from '../../../../../methods/reqHandler';
import { AddUsersExpenseModal } from '../../../../../modals';
import { OutlineBtn, PrimaryBtn } from '../../../../../components/buttons';
import { Layout, Utility, Typography, Textfield, Misc } from '../../../../../styles';
import { splitEqual } from '../../../../../methods/misc';

export default SplitBetween = ({ currency, amt, users, setSplitSettled, usersSplit, setUsersSplit }) => {
    const { theme } = useContext(ThemeContext);
    const [err, setErr] = useState(null);
    const [userModal, showUserModal] = useState(false);
    const [themeColor] = useState(theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark);
    const [members, setMembers] = useState(null);

    const getGrpMembers = async () => {
        let m = await reqHandler({
            action: 'getUsers',
            apiUrl: 'users',
            method: 'POST',
            params: {
                users
            }
        });

        if (m?.error) {
            setErr(m.msg);
            return;
        }
        m = m.userInfo;
        setMembers(m);

        if (usersSplit.length === 0) {
            const _id = auth().currentUser.uid;
            const crtUser = m.filter(m => m._id === _id);

            setUsersSplit(usersSplit => [{ ...crtUser[0], val: amt }]);
        }
    };

    const sum = useMemo(() => {
        let s = 0;

        usersSplit.forEach(u => {
            const v = u.val || 0;
            s += parseFloat(v);
            s = parseFloat(parseFloat(s).toFixed(2));
            // console.log(s, typeof(s))
        });
        return s;
    }, [usersSplit]);

    useEffect(() => {
        getGrpMembers();
    }, []);

    const onChangeVal = (e, userId) => {
        let n = usersSplit.length,
            u = [...usersSplit];

        while (n--) {
            if (u[n]._id === userId) {
                e = e.replace(/[^0-9/.]/g, '');
                u[n].val = e || '0';
                setUsersSplit(u);
                return;
            }
        }
    };

    // Checking the possibilities of only decimal values
    const onBlur = userId => {
        let n = usersSplit.length,
            u = [...usersSplit],
            mulDec = 0;

        while (n--) {
            if (u[n]._id === userId) {
                [...u[n].val].forEach(c => {
                    if (c !== '.') mulDec += 1;
                });
                if (mulDec === 0) {
                    u[n].val = '0';
                } else {
                    u[n].val = parseFloat(u[n].val).toFixed(2);
                }
                setUsersSplit(u);
            }
        }
    };

    const addAllUsers = () => {
        const u = splitEqual(members, amt);
        setUsersSplit(u);
        showUserModal(false);
    };

    const removeUser = userId => {
        let n = usersSplit.length,
            u = [...usersSplit];

        while (n--) {
            if (u[n]._id === userId) {
                u.splice(n, 1);

                if (u.length === 1) {
                    u[0].val = amt;
                }

                setUsersSplit(u);
                return;
            }
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior="height">
                <FlatList
                    data={usersSplit}
                    renderItem={({ item }) => (
                        <MemberItem
                            user={item}
                            usersSplitLen={usersSplit.length}
                            currency={currency}
                            onChangeVal={onChangeVal}
                            onBlur={onBlur}
                            removeUser={removeUser}
                            themeColor={themeColor}
                        />
                    )}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListFooterComponent={
                        <>
                            <SubText amt={amt} sum={sum} currency={currency} setSplitSettled={setSplitSettled} />
                            <View style={styles.buttons}>
                                {usersSplit.length > 1 && (
                                    <OutlineBtn
                                        title="Split equally"
                                        onPress={() => setUsersSplit(splitEqual(usersSplit, amt))}
                                        style={{ flexGrow: 1 }}
                                    />
                                )}
                                <TouchableOpacity onPress={() => showUserModal(true)} style={styles.addMember}>
                                    {usersSplit.length > 1 ? (
                                        <View
                                            style={[styles.iconBg, { backgroundColor: themeColor.bg, marginLeft: 20 }]}
                                        >
                                            <Icon name="add" color={Utility.Colors[theme].high} size={36} />
                                        </View>
                                    ) : (
                                        <View style={[styles.iconBg, { borderColor: themeColor.med, borderWidth: 2 }]}>
                                            <Icon name="add" color={themeColor.med} size={36} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                />
                {err && <MyText text={err} error />}
                {members && (
                    <AddUsersExpenseModal
                        visible={userModal}
                        setVisible={showUserModal}
                        allUsers={members || []}
                        users={usersSplit}
                        updateUsers={setUsersSplit}
                        themeColor={themeColor}
                        addAllUsers={addAllUsers}
                    />
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const MemberItem = ({ user, usersSplitLen, currency, onChangeVal, onBlur, removeUser, themeColor }) => {
    return (
        <View style={[Misc.rows.container, { paddingVertical: 15 }]} key={user._id}>
            <Image
                {...(user.photoURL
                    ? { source: { uri: user.photoURL } }
                    : { source: require('../../../../../assets/images/profile-default.png') })}
                resizeMode="cover"
                resizeMethod="scale"
                style={[Misc.rows.profilePhotoSmall, { marginRight: 15 }]}
            />

            <View style={[Misc.rows.itemLeftGrow, { flexDirection: 'row', alignItems: 'center' }]}>
                <MyText
                    text={user.name}
                    style={Misc.width[75]}
                    opacity="med"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    bodyTitle
                />
                {usersSplitLen > 1 && (
                    <TouchableOpacity onPress={() => removeUser(user._id)}>
                        <Icon name="close-circle" color={themeColor.low} style={{ marginLeft: 15 }} size={22} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MyText text={currency} opacity="low" />
                <MyTextInput
                    style={[Textfield.field, { flexGrow: 0, maxWidth: 100 }]}
                    selectTextOnFocus={true}
                    keyboardType="phone-pad"
                    placeholder=""
                    value={user.val}
                    onChangeText={e => onChangeVal(e, user._id)}
                    onEndEditing={() => onBlur(user._id)}
                />
            </View>
        </View>
    );
};

const SubText = ({ amt, sum, currency, setSplitSettled }) => {
    const [equal, setEqual] = useState(true);
    const [hideSubtext, setHideSubtext] = useState(false);

    useEffect(() => {
        setEqual(amt == sum);
        amt == sum ? setSplitSettled(true) : setSplitSettled(false);
        if (isNaN(amt - sum)) {
            setHideSubtext(true);
        } else {
            setHideSubtext(false);
        }
    }, [sum, amt]);

    return (
        <>
            <MyText
                text={
                    equal
                        ? 'Amount settled up!'
                        : amt > sum
                        ? `Distribution is below by ${currency}${(amt - sum).toFixed(2)}`
                        : `Distribution is over by ${currency}${(sum - amt).toFixed(2)}`
                }
                opacity="low"
                {...(equal ? { green: true } : { red: true })}
                style={[hideSubtext && { display: 'none' }]}
                bodySubTitle
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 30
    },
    iconBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden'
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30
    }
});
