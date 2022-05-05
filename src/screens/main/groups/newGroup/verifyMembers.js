import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Image,
    PermissionsAndroid,
    KeyboardAvoidingView,
    FlatList,
    BackHandler
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../../../themeContext';
import MyText from '../../../../components/myText';
import MyTextInput from '../../../../components/myTextInput';
import { PrimaryBtn } from '../../../../components/buttons';
import { Layout, Utility, Typography, Textfield, Misc, Button } from '../../../../styles';
import { createGroup, addGroupMembers } from '../../../../methods/groups';

export default VerifyMembers = ({ navigation, route }) => {
    const { theme } = useContext(ThemeContext);
    const [mode] = useState(route.params.mode || 'add');
    const [members, setMembers] = useState(route.params.members);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    // console.log('from verify members', route.params.members);

    const [themeColor] = useState(theme === 'dark' ? 'light' : 'dark');

    const removeMember = member => {
        let arr = [...members],
            i = members.length;
        while (i--) {
            if (arr[i]._id === member._id) {
                arr.splice(i, 1);
                setMembers(arr);
                break;
            }
        }

        if (arr.length === 0) {
            navigation.goBack();
        }
    };

    // const changeName = (_id, e) => {
    //     let arr = [...members],
    //         i = members.length;

    //     while (i--) {
    //         if (arr[i]._id === _id) {
    //             arr[i].name = e;
    //             setMembers(arr);
    //             break;
    //         }
    //     }
    // };

    const createNewGroup = async () => {
        setLoading(true);
        setErr(false);
        const { title, desc, defaultGrp } = route.params.details;

        let newUsersData = members.filter(m => {
            if (m.type === 'friend' || m.type === 'standard') {
                return false;
            } else {
                return true;
            }
        });
        console.log('new users', newUsersData);

        let users = members.map(m => m._id);
        users.push(auth().currentUser.uid);
        console.log('all users', users);

        const res = await createGroup(
            title,
            auth().currentUser.uid,
            users,
            newUsersData,
            null,
            defaultGrp,
            'active',
            0
        );
        setLoading(false);

        if (res?.error) {
            setErr(res.msg);
            return;
        }

        const { _id } = res;

        // navigation.reset({
        //     index: 0,
        //     routes: {
        //         name: 'home'
        //     }
        // })

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
                            _id
                        }
                    }
                }
            ]
        });
    };

    const addMembers = async () => {
        setLoading(true);
        setErr(false);

        const { grpId } = route.params.details;
        console.log('grpid from VerifyMembers', grpId);

        let newUsersData = members.filter(m => {
            if (m.type === 'friend' || m.type === 'standard') {
                return false;
            } else {
                return true;
            }
        });
        console.log('new users', newUsersData);

        let users = members.map(m => m._id);

        const res = await addGroupMembers(users, auth().currentUser.uid, newUsersData, grpId);
        setLoading(false);

        if (res?.error) {
            console.log(res);
            setErr(res.msg);
            return;
        }

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
                            _id: grpId
                        }
                    }
                }
            ]
        });
    };

    const goBack = () => {
        navigation.navigate({
            name: 'addMembers',
            params: { members },
            merge: true
        });

        return true;
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', goBack);

        return () => backHandler.remove();
    }, []);

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleFixedBtnBottom}
                keyboardShouldPersistTaps="handled"
            >
                <MyText text="Confirm Members" style={Layout.pageHeader} title />
                {members.map(member => (
                    <View style={Misc.rows.container} key={member._id}>
                        <View style={[Misc.rows.profilePhotoSmall, { marginRight: 15 }]}>
                            {member.photoURL ? (
                                <Image
                                    source={{ uri: member.photoURL }}
                                    resizeMode="cover"
                                    resizeMethod="scale"
                                    style={Misc.rows.profilePhotoImg}
                                />
                            ) : (
                                <Icon name="person-circle-outline" color={Utility.Colors[themeColor].low} size={30} />
                            )}
                        </View>
                        <View style={Misc.rows.itemLeftGrow}>
                            <MyText
                                text={member.name}
                                style={[
                                    // Textfield.field,
                                    Misc.width[80],
                                    { textAlign: 'left', flexGrow: 0, marginBottom: 5 }
                                ]}
                                // onChangeText={e => changeName(member._id, e)}
                                bodyTitle
                            />
                            <MyText
                                text={member.email || member.contact}
                                opacity="low"
                                style={Misc.width[80]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                bodySubTitle
                            />
                        </View>

                        <Pressable onPress={() => removeMember(member)}>
                            <View>
                                <Icon
                                    name="close-circle-outline"
                                    color={Utility.Colors[themeColor].med}
                                    size={28}
                                    style={{ paddingRight: 1 }}
                                />
                            </View>
                        </Pressable>
                    </View>
                ))}

                <Pressable onPress={goBack} style={styles.addMember}>
                    <Icon name="add-circle" color={Utility.Colors[themeColor].high} size={48} />
                </Pressable>
            </ScrollView>
            <View style={[Button.fixedBottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                {err && <MyText text={err} error />}
                <PrimaryBtn
                    title={mode === 'add' ? 'Create Group' : 'Add members'}
                    onPress={mode === 'add' ? createNewGroup : addMembers}
                    loading={loading}
                    disabled={loading}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    addMember: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30
    }
});
