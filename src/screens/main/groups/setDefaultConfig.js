import React, { useState, useEffect, useContext } from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, Image, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import { ThemeContext } from '../../../themeContext';
import MyText from '../../../components/myText';
import MyTextInput from '../../../components/myTextInput';
import { PrimaryBtn } from '../../../components/buttons';
import reqHandler from '../../../methods/reqHandler';
import { splitEqual } from '../../../methods/misc';
import { Layout, Utility, Button, Misc, Textfield } from '../../../styles';

export default SetDefaultConfig = ({ navigation, route }) => {
    const { theme } = useContext(ThemeContext);
    const [themeColor] = useState(theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark);
    const [config, setConfig] = useState(null);
    const [users, updateUsers] = useState([]);
    const [err, setErr] = useState(null);

    useEffect(() => {
        reqHandler({
            action: 'getGroupDetails',
            apiUrl: 'groups',
            method: 'POST',
            params: {
                grpId: route.params._id
            }
        }).then(grp => {
                if(grp?.error) {
                    setErr(grp.msg);
                    return
                }

                reqHandler({
                    action: 'getUsers',
                    apiUrl: 'users',
                    method: 'POST',
                    params: {
                        users: Object.keys(grp.members)
                    }
                }).then(users => {
                        if(users?.error) {
                            setErr(users.msg);
                            return
                        }
                
                        users = users.userInfo;
                        users = splitEqual(users, 100);
                        console.log('usersss', users);
                        updateUsers(users);
                    })
                    .catch(err => setErr(err.msg));
            })
            .catch(err => setErr(err.msg));
    }, []);

    const onChangeVal = (e, userId) => {
        let n = users.length,
            u = [...users];

        while (n--) {
            if (u[n]._id === userId) {
                e = e.replace(/[^0-9/.]/g, '');
                u[n].val = e || '0';
                updateUsers(u);
                return;
            }
        }
    };

    // Checking the possibilities of only decimal values
    const onBlur = userId => {
        let n = users.length,
            u = [...users],
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
                updateUsers(u);
            }
        }
    };

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <View style={Layout.scrollViewContainer}>
                <MyText text="Set Group Config" style={Layout.pageHeader} title />
                <MyText
                    text="Set the default distribution of every expense added to this group"
                    subTitle
                    style={{ paddingBottom: 30 }}
                />
                <FlatList
                    data={users}
                    renderItem={({ item }) => (
                        <MemberItem
                            user={item}
                            // usersPaidLen={usersPaid.length}
                            // currency={currency}
                            onChangeVal={onChangeVal}
                            onBlur={onBlur}
                            // themeColor={themeColor}
                        />
                    )}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
        </SafeAreaView>
    );
};

const MemberItem = ({ user, onChangeVal, onBlur }) => {
    return (
        <View style={[Misc.rows.container, { paddingVertical: 15 }]}>
            <Image
                {...(user.photoURL
                    ? { source: { uri: user.photoURL } }
                    : { source: require('../../../assets/images/profile-default.png') })}
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
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MyTextInput
                    style={[Textfield.field, Misc.width[75], { flexGrow: 0, maxWidth: 100 }]}
                    selectTextOnFocus={true}
                    keyboardType="phone-pad"
                    value={user.val}
                    onChangeText={e => onChangeVal(e, user._id)}
                    onEndEditing={() => onBlur(user._id)}
                />
                <MyText text="%" opacity="med" />
            </View>
        </View>
    );
};
