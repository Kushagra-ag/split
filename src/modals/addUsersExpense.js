import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
    View,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    useWindowDimensions,
    Alert,
    ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import { Utility, Layout, Misc } from '../styles';

export default AddUsersExpenseModal = ({
    visible,
    setVisible,
    allUsers,
    updateUsers,
    users,
    themeColor,
    addAllUsers,
    ...rest
}) => {
    // console.log('ss',allUsers)
    const { height } = useWindowDimensions();

    const duplicateCheck = userId => {
        const duplicate = users.filter(u => u._id === userId);

        if (duplicate.length) {
            //duplicate number found
            DuplicateAlert();
            // showToast('User already added')
            return true;
        }

        return false;
    };

    const addUser = newUser => {
        if (duplicateCheck(newUser._id)) return;

        let u = [...users, { ...newUser, val: '0' }];
        updateUsers(u);
        console.log(u);
        showToast(`Added ${newUser.name}`);
    };

    const showToast = (msg, duration = 'SHORT') => {
        ToastAndroid.show(msg, ToastAndroid[duration]);
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true} {...rest}>
            <View style={[Layout.modal.modalView]}>
                <ScrollView
                    style={[
                        {
                            backgroundColor:
                                themeColor.bg === '#272727' ? Utility.Colors.light.bg : Utility.Colors.dark.bg,
                            maxHeight: height / 2,
                            borderTopRightRadius: 20,
                            borderTopLeftRadius: 20
                        }
                    ]}
                    contentContainerStyle={Layout.modal.modalChildView}
                >
                    <View style={[Layout.pageHeader, { width: '100%' }]}>
                        <MyText text="Choose a member" bodyTitle style={{ fontFamily: 'PlayfairDisplay-Bold' }} />
                        <TouchableOpacity
                            onPress={() => {
                                setVisible(false);
                            }}
                        >
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={Misc.rows.container} onPress={addAllUsers}>
                        <View style={Misc.rows.itemLeftGrow}>
                            <MyText
                                text="Add all users"
                                style={{ maxWidth: '75%' }}
                                opacity="med"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                bodyTitle
                            />
                        </View>
                    </TouchableOpacity>
                    {allUsers.length > 0 ? (
                        allUsers.map(user => (
                            <TouchableOpacity style={Misc.rows.container} key={user._id} onPress={() => addUser(user)}>
                                <Image
                                    {...(user.photoURL
                                        ? { source: { uri: user.photoURL } }
                                        : { source: require('../assets/images/profile-default.png') })}
                                    resizeMode="cover"
                                    resizeMethod="scale"
                                    style={[Misc.rows.profilePhotoSmall, { marginRight: 15 }]}
                                />

                                <View style={Misc.rows.itemLeftGrow}>
                                    <MyText
                                        text={user.name}
                                        style={{ maxWidth: '75%' }}
                                        opacity="med"
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        bodyTitle
                                    />
                                </View>

                                {/*<View>
                                            <MyTextInput
                                                style={[Textfield.field, {flexGrow:0, maxWidth: 75}]}
                                                clearButtonMode="while-editing"
                                                placeholder=""
                                                value={user.val}
                                                onChangeText={e => onChangeVal(e, user._id)}
                                            />
                                        </View>*/}
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View>
                            <MyText text="No other users in this group" />
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const DuplicateAlert = () => Alert.alert('', 'User already added', [{ text: 'OK', onPress: () => null }]);
