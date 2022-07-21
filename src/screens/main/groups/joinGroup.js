import React, { useState, useEffect, useContext } from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { ThemeContext } from '../../../themeContext';
import MyText from '../../../components/myText';
import { PrimaryBtn } from '../../../components/buttons';
import reqHandler from '../../../methods/reqHandler';
import { getItemLocal } from '../../../methods/localStorage';
import { joinGroupInfo, addGroupMembers } from '../../../methods/groups';
import { Layout, Utility, Button, Misc } from '../../../styles';

export default JoinGroup = ({ navigation, route }) => {
    const { theme } = useContext(ThemeContext);
    const [err, setErr] = useState(null);
    const [grp, setGrp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user] = useState(auth().currentUser.uid);
    // const [theme] = useState(theme === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        console.log(route.params);

        reqHandler({
            action: 'joinGroupInfo',
            apiUrl: 'groups',
            method: 'POST',
            params: {
                encodedGrpId: route.params.grpId,
                userId: user
            }
        }).then(async res => {
                if (res.e === 'Already a member') {
                    navigation.reset({
                        index: 1,
                        routes: [
                            {
                                name: 'home'
                            },
                            {
                                name: 'groups',
                                params: {
                                    screen: 'default',
                                    params: {
                                        _id: res._id
                                    }
                                }
                            }
                        ]
                    });

                    return;
                }

                let users = res.grpMembers;
                const userIds = users.filter(u => u._id);
                
                // calculating common friends
                const userFriends = await getItemLocal('userFriends');
                if (userFriends && userFriends.length > 0) {
                    const userFriendsIds = userFriends.filter(u => u._id);
                    userIds.forEach((u, idx) => {
                        const k = userFriendsIds.indexOf(u);
                        if (k !== -1) {
                            users.splice(idx, 1);
                            users = [userFriends[k], ...users];
                        }
                    });
                }
                console.log('ccccc', users);
                setGrp({...res, commonFriends: users});
            })
            .catch(e => setErr('Something went wrong. Could not join group'));
    }, []);

    const joinGroup = async () => {
        setLoading(true);console.log('kkkkk', grp)
        // const e = await addGroupMembers([user], user, [], grp._id);
        const e = await reqHandler({
            action: 'addGroupMembers',
            apiUrl: 'groups',
            method: 'POST',
            params: {
                users: [user],
                uId: user,
                newUsersData: [],
                grpId: grp._id
            }
        });
        setLoading(false);

        if (e?.error) {
            console.log(e);
            setErr(e.msg);
            return;
        }

        navigation.navigate('groups', {
            screen: 'default',
            params: {
                _id: grp._id
            }
        });
    };

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <MyText text="Join Group" style={Layout.pageHeader} title />

                <View style={styles.joinGrpContainer}>
                    <MyText text={grp?.name} bodyTitle />
                    <View style={[styles.joinGrpMembers]}>
                        {grp &&
                            grp.commonFriends.slice(0, 3).map((user, idx) => (
                                <View style={[styles.userImg, idx ? { marginLeft: -15 } : {}]} key={user._id}>
                                    <Image
                                        {...(user.photoURL
                                            ? { source: { uri: user.photoURL } }
                                            : { source: require('../../../assets/images/profile-default.png') })}
                                        resizeMode="cover"
                                        resizeMethod="scale"
                                        style={[
                                            Misc.rows.profilePhoto,
                                            { borderWidth: 4, borderColor: Utility.Colors[theme].bg }
                                        ]}
                                    />
                                </View>
                            ))}
                    </View>
                    {grp?.commonFriends?.length ? (
                        <MyText
                            text={`${grp.commonFriends[0]?.name.split(' ')[0]}${
                                grp.commonFriends[1] ? `, ${grp.commonFriends[1].name.split(' ')[0]}` : ' is '
                            } ${
                                grp.commonFriends[2]
                                    ? `${grp.commonFriends.length - 2} others `
                                    : grp.commonFriends.length === 1
                                    ? ''
                                    : 'are '
                            }in this group`}
                        />
                    ) : null}
                </View>
                <View style={[Button.bottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                    {err && <MyText text={err} error />}
                    <PrimaryBtn title="Join" onPress={joinGroup} loading={!grp || loading} disabled={!grp || loading} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    joinGrpContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    joinGrpMembers: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    userImg: {
        width: 50,
        height: 65,
        borderRadius: 25,
        overflow: 'hidden'
    }
});
