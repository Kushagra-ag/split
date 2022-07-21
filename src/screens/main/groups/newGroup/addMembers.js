import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
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
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Contacts from 'react-native-contacts';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import reqHandler from '../../../../methods/reqHandler';
import MyText from '../../../../components/myText';
import MyTextInput from '../../../../components/myTextInput';
import { PrimaryBtn } from '../../../../components/buttons';
import { getUserFriends } from '../../../../methods/user';
import { NewContactModal } from '../../../../modals';
import { Layout, Utility, Typography, Textfield, Misc, Button } from '../../../../styles';
import { ThemeContext } from '../../../../themeContext';
import { getItemLocal, setItemLocal } from '../../../../methods/localStorage';

export default AddMembers = ({ route, navigation }) => {
    const { theme, geoInfo } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);
    const [contactPerm, setContactPerm] = useState(false);
    const [err, setErr] = useState({
        friendsList: null,
        contactsList: null,
        global: null
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, updateUsers] = useState({
        friends: [],
        contacts: []
    });
    const [query, updateQuery] = useState(null);
    const [addContactModal, setAddContactModal] = useState(false);
    const [themeColor] = useState(theme === 'dark' ? 'light' : 'dark');
    const memberView = useRef(null);

    const handleSearch = async e => {
        updateQuery(e);

        setErr({ friendsList: null, contactsList: null, global: null });

        // get matching friends list from local storage
        const friends = await getUserFriends(e);

        if (!friends?.error) updateUsers(users => ({ ...users, friends }));

        if (e.length < 3) return;

        // get users from contacts
        contactPerm &&
            Contacts.getContactsMatchingString(e)
                .then(res => {
                    updateUsers(users => ({ ...users, contacts: res }));
                })
                .catch(error => {
                    console.log('from handlesearch-addMember.js ', error);
                    setErr(err => ({ ...err, contacts: true }));
                });
    };

    const duplicateCheck = (c, m) => {
        if (c) {
            const cDuplicate = selectedUsers.filter(u => u.contact === c);

            if (cDuplicate.length) {
                //duplicate number found
                ErrorAlert('This number is already added');
                return true;
            }
        }

        if (m) {
            const mDuplicate = selectedUsers.filter(u => u.email === m);

            if (mDuplicate.length) {
                //duplicate email found
                ErrorAlert('This email is already added');
                return true;
            }
        }

        return false;
    };

    const handleClick = (user, cat) => {
        let n = selectedUsers.length,
            u = [...selectedUsers];

        // remove if already selected
        while (n--) {
            if (u[n]._id === user._id) {
                return ErrorAlert('This contact is already added');
            }
        }

        if (n === 25) {
            ErrorAlert('Maximum 25 users allowed in a group');
            return;
        }

        if (user.contact && duplicateCheck(user.contact?.replace(/ /g, ''), user.email)) {
            return;
        }

        if (user.contact && auth().currentUser.phoneNumber === user.contact?.replace(/ /g, '')) {
            ErrorAlert('You are added to the group by default :)');
            return;
        }

        return setSelectedUsers([
            ...selectedUsers,
            {
                type: cat,
                _id: user._id,
                name: user.name,
                photoURL: user.photoURL,
                email: user.email,
                contact: user.contact?.replace(/ /g, '')
            }
        ]);

        // const type = cat === 'friends' ? '_id' : 'rawContactId';

        //     let n = users[cat].length;
        //     while(n--) {
        //         if(users[cat][n][type] === _id) {
        //             let usersCpy = users;
        //             usersCpy[cat][n].checked = !usersCpy[cat][n].checked;
        //             updateUsers(users => ({...users, ...usersCpy}));
        //             return
        //         }
        //     }
    };

    const skipMembers = async () => {
        setLoading(true);
        setErr(err => ({ ...err, global: null }));

        const { title, desc, defaultGrp } = route.params.details,
            userId = auth().currentUser.uid,
            { currencySymbol } = await getItemLocal('userGeo');

        let res = await reqHandler({
            action: 'createGroup',
            apiUrl: 'groups',
            method: 'POST',
            params: {
                name: title,
                desc,
                ownerId: userId,
                users: [userId],
                newUsersData: [],
                currency: currencySymbol,
                defaultGrp
            }
        });

        // const res = await createGroup(title, userId, [userId], [], null, defaultGrp, 'active', 0);
        setLoading(false);

        if (res?.error || res?.errorMessage) {
            console.log(res);
            setErr(err => ({ ...err, global: res.msg }));
            return;
        }

        const { _id, fLocalNew } = res;
        console.log('iddd', _id);

        // updating local friends
        let localFriends = await getItemLocal('userFriends');
        const newLocalFriends = localFriends.concat(fLocalNew);
        
        setItemLocal({
            key: 'userFriends',
            value: newLocalFriends
        });

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

    const removeMember = member => {
        let arr = [...selectedUsers],
            i = selectedUsers.length;
        while (i--) {
            if (arr[i]._id === member._id) {
                arr.splice(i, 1);
                setSelectedUsers(arr);
                break;
            }
        }
    };

    const askPermission = () => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: 'Contacts',
            message: 'This app would like to view your contacts.'
        })
            .then(r => {
                // console.log(r)
                if (r === 'granted') {
                    setContactPerm(true);
                }
            })
            .catch(e => null);
    };

    useEffect(() => {
        askPermission();
        getUserFriends()
            .then(f => updateUsers(users => ({ ...users, friends: f })))
            .catch(e => null);
    }, []);

    useFocusEffect(
        useCallback(() => {
            console.log('kj', route.params, route.params.members);
            setSelectedUsers(route.params.members || []);
        }, [route])
    );

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleFixedBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <MyText text="Add Members" style={Layout.pageHeader} title />
                <View style={[Misc.search.searchBar, { borderColor: Utility.Colors[themeColor].med }]}>
                    <Icon name="search" color={Utility.Colors[themeColor].low} size={24} />
                    <MyTextInput
                        placeholder="Start typing to search"
                        style={[Misc.search.searchField, Misc.width[85]]}
                        value={query}
                        onChangeText={e => handleSearch(e)}
                    />
                    <Pressable onPress={() => setAddContactModal(true)}>
                        <Icon name="person-add" color={Utility.Colors[themeColor].med} size={24} />
                    </Pressable>
                </View>
                {selectedUsers.length > 0 && (
                    <View style={Layout.horizontalScrollMemeberView.container}>
                        <FlatList
                            data={selectedUsers}
                            renderItem={({ item }) => (
                                <MemberItem
                                    member={item}
                                    removeMember={removeMember}
                                    themeColor={Utility.Colors[themeColor]}
                                />
                            )}
                            keyExtractor={item => item._id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            ref={memberView}
                        />
                    </View>
                )}
                <View style={styles.memberView}>
                    {users.friends?.length > 0 ? (
                        <>
                            <MyText
                                text="Friends on Split"
                                bodyTitle
                                style={[styles.listTitle, { fontFamily: 'Urbanist-Bold' }]}
                                letterSpacing={0}
                            />
                            {users.friends.map((friend, idx) => (
                                <Pressable
                                    key={friend._id}
                                    style={({ pressed }) => [
                                        Misc.rows.containerStart,
                                        { paddingVertical: 15 },
                                        pressed ? { opacity: 0.6 } : {}
                                    ]}
                                    onPress={() =>
                                        handleClick(
                                            {
                                                _id: friend._id,
                                                name: friend.name,
                                                photoURL: friend.photoURL,
                                                email: friend.email,
                                                contact: friend.contact
                                            },
                                            friend.type
                                            // 'friend'
                                        )
                                    }
                                >
                                    <View style={[Misc.rows.profilePhotoSmall, { marginRight: 15 }]}>
                                        <Image
                                            source={{ uri: friend.photoURL }}
                                            {...(friend.photoURL
                                                ? { source: { uri: friend.photoURL } }
                                                : { source: require('../../../../assets/images/profile-default.png') })}
                                            // source={require('../../../../assets/images/logo-dark.png')}
                                            resizeMode="cover"
                                            resizeMethod="scale"
                                            style={Misc.rows.profilePhotoSmall}
                                        />
                                    </View>
                                    <View style={{ flexGrow: 1 }}>
                                        <MyText
                                            text={friend.name}
                                            style={[Misc.width[80], { paddingBottom: 5 }]}
                                            bodyTitle
                                            ellipsizeMode="tail"
                                            numberOfLines={1}
                                        />
                                        <MyText
                                            text={friend.email || friend.contact}
                                            bodySubTitle
                                            ellipsizeMode="tail"
                                            numberOfLines={1}
                                            style={Misc.width[80]}
                                        />
                                    </View>
                                    {/*friend.checked ? (
                                        <View>
                                            <Icon name="checkmark-circle" color={Utility.Colors[themeColor].high} size={28} />
                                        </View>
                                    ) : null*/}
                                </Pressable>
                            ))}
                        </>
                    ) : null}
                    {contactPerm ? (
                        users.contacts?.length > 0 ? (
                            <>
                                <MyText
                                    text="My contacts"
                                    bodyTitle
                                    style={[styles.listTitle, { fontFamily: 'Urbanist-Bold' }]}
                                />
                                {users.contacts.map((contact, idx) => (
                                    <Pressable
                                        key={contact.rawContactId}
                                        style={({ pressed }) => [
                                            Misc.rows.containerStart,
                                            { paddingVertical: 15 },
                                            pressed ? { opacity: 0.6 } : {},
                                            contact.phoneNumbers[0]?.number ? null : styles.dNone
                                        ]}
                                        onPress={() =>
                                            handleClick(
                                                {
                                                    _id: contact.rawContactId,
                                                    name: contact.displayName,
                                                    email: contact.emailAddresses[0]?.email,
                                                    contact: contact.phoneNumbers[0]?.number
                                                },
                                                'contact'
                                            )
                                        }
                                    >
                                        <View style={{ marginRight: 15 }}>
                                            <Icon
                                                name="person-circle-outline"
                                                color={Utility.Colors[themeColor].low}
                                                size={30}
                                            />
                                        </View>
                                        <View style={Misc.rows.itemLeftGrow}>
                                            <MyText
                                                text={contact.displayName}
                                                style={[Misc.width[80], { paddingBottom: 5 }]}
                                                bodyTitle
                                                ellipsizeMode="tail"
                                                numberOfLines={1}
                                            />
                                            <MyText
                                                text={
                                                    contact.emailAddresses[0]?.email || contact.phoneNumbers[0]?.number
                                                }
                                                bodySubTitle
                                                ellipsizeMode="tail"
                                                numberOfLines={1}
                                                style={Misc.width[80]}
                                            />
                                        </View>
                                        {/*{contact.checked ? (
                                        <View>
                                            <Icon name="checkmark-circle" color={Utility.Colors[themeColor].high} size={28} />
                                        </View>
                                    ) : null}*/}
                                    </Pressable>
                                ))}
                            </>
                        ) : null
                    ) : (
                        <View style={styles.listTitle}>
                            <MyText
                                text="My contacts"
                                bodyTitle
                                style={[styles.listTitle, { fontFamily: 'Urbanist-Bold' }]}
                            />
                            <MyText text={'Contacts permission not given'} style={{ paddingBottom: 20 }} />
                        </View>
                    )}
                </View>
            </ScrollView>
            {selectedUsers.length === 0 && (
                <View style={[Button.fixedBottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                    {err.global && <MyText text={err.global} error />}
                    <PrimaryBtn
                        title={contactPerm ? (route.params.mode === 'modify' ? 'Back' : 'Skip') : 'Authorize Split'}
                        onPress={
                            contactPerm
                                ? route.params.mode === 'modify'
                                    ? () => navigation.goBack()
                                    : skipMembers
                                : askPermission
                        }
                        loading={loading}
                        disabled={loading}
                    />
                </View>
            )}
            <NewContactModal
                visible={addContactModal}
                setVisible={setAddContactModal}
                name={query}
                themeColor={Utility.Colors[themeColor]}
                setSelectedUsers={setSelectedUsers}
                selectedUsers={selectedUsers}
                geoInfo={geoInfo}
            />
            {selectedUsers.length > 0 ? (
                <Pressable
                    onPress={() =>
                        navigation.navigate('verifyMembers', {
                            members: selectedUsers,
                            details: { ...route.params.details, grpId: route.params.grpId },
                            mode: route.params.mode
                        })
                    }
                    style={[Misc.fab.container, { backgroundColor: Utility.Colors[themeColor].bg }]}
                >
                    <Icon name="arrow-forward-outline" color={Utility.Colors[theme].high} size={32} />
                </Pressable>
            ) : null}
        </SafeAreaView>
    );
};

const MemberItem = ({ member, removeMember, themeColor }) => {
    return (
        <Pressable onPress={() => removeMember(member)}>
            <View style={Layout.horizontalScrollMemeberView.user}>
                <View>
                    <Image
                        source={{ uri: member.photoURL }}
                        style={Layout.horizontalScrollMemeberView.userImg}
                        {...(member.photoURL
                            ? { source: { uri: member.photoURL } }
                            : { source: require('../../../../assets/images/profile-default.png') })}
                        resizeMode="cover"
                        resizeMethod="scale"
                    />
                    <Icon
                        name="close-circle"
                        style={Layout.horizontalScrollMemeberView.userCross}
                        color={themeColor.med}
                        size={12}
                    />
                </View>
                <MyText
                    text={member.name}
                    style={Layout.horizontalScrollMemeberView.userText}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    bodySubTitle
                />
            </View>
        </Pressable>
    );
};

const ErrorAlert = msg => Alert.alert('', msg, [{ text: 'OK', onPress: () => null }]);

const styles = StyleSheet.create({
    memberView: {
        paddingBottom: 50
    },
    listTitle: {
        paddingBottom: 10,
        paddingTop: 20
    },
    dNone: {
        display: 'none'
    }
});
