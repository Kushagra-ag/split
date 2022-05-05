import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { View, Modal, ScrollView, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import Divider from '../components/divider';
import { removeGroupMember } from '../methods/groups';
import { Textfield, Layout, Misc, Utility } from '../styles';

export default GroupSettingsModal = ({
    visible,
    setVisible,
    group,
    updateGroup,
    themeColor,
    addMembersModalNavigate,
    ...rest
}) => {
    const [grpNameEditable, setGrpNameEditable] = useState(false);
    const [grp, setGrp] = useState(group);
    const [user] = useState(auth().currentUser.uid);

    const saveNewGrpName = () => {
        if (group.name === grpName) {
            setGrpNameEditable(false);
            return;
        }
        // updateGroupName locally
    };

    const addMembers = () => {
        // console.log('g', group);
        setVisible(false);
        addMembersModalNavigate();
    };

    const toggleDefaultGroup = () => {
        let defGrp = true;

        if (grp.defaultGrp && grp.defaultGrp[user]) {
            defGrp = false;
        }
        //call to update firebase
        setGrp(grp => ({ ...grp, defaultGrp: { [user]: defGrp } }));
    };

    const leaveGroup = () => {
        const leaveGrpConfirm = () => {
            removeGroupMember(auth().currentUser.uid, group._id)
        }

        Alert.alert(
            '',
            `Are you sure you want to leave this group?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => null
                },
                { text: 'Yes', onPress: leaveGrpConfirm }
            ]
        );
    }

    return (
        <Modal visible={visible} animationType="fade" transparent={true} {...rest}>
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
                        <MyText text="Group settings" bodyTitle style={{ fontFamily: 'PlayfairDisplay-Bold' }} />
                        <Pressable onPress={() => setVisible(false)}>
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </Pressable>
                    </View>
                    <View style={[Misc.rows.container, { paddingTop: 0, width: '100%' }]}>
                        <MyTextInput
                            value={group.name}
                            style={[Textfield.field, { flexGrow: 0 }]}
                            editable={grpNameEditable}
                            clearButtonMode="while-editing"
                            onChangeText={text => setGrpName(text)}
                        />
                        <Pressable
                            onPress={() => {
                                if (!grpNameEditable) {
                                    setGrpNameEditable(true);
                                } else {
                                    saveNewGrpName();
                                }
                            }}
                            style={({ pressed }) => [
                                pressed ? { opacity: 0.6, backgroundColor: '#00000022' } : {},
                                { padding: 5 }
                            ]}
                        >
                            {grpNameEditable ? <MyText text="Save" /> : <MyText text="Edit" />}
                        </Pressable>
                    </View>
                    <View style={[Misc.rows.container, styles.menuItem]}>
                        <Pressable
                            onPress={addMembers}
                            style={({ pressed }) => [
                                pressed ? { opacity: 0.6, backgroundColor: '#00000022' } : {},
                                { padding: 5 }
                            ]}
                        >
                            <MyText text="Add members" bodyTitle />
                        </Pressable>
                    </View>
                    <View style={[Misc.rows.container, styles.menuItem]}>
                        <MyText text="Default group" bodyTitle />
                        <Switch
                            onValueChange={toggleDefaultGroup}
                            value={grp.defaultGrp && grp.defaultGrp[user]}
                            trackColor={{ false: themeColor.low, true: themeColor.low }}
                            thumbColor={themeColor.high}
                        />
                    </View>
                    <Divider />
                    <View style={[Misc.rows.container, styles.menuItem]}>
                        <Pressable
                            onPress={leaveGroup}
                            style={({ pressed }) => [
                                pressed ? { opacity: 0.6, backgroundColor: '#00000022' } : {},
                                { padding: 5 }
                            ]}
                        >
                            <MyText text="Leave group" bodyTitle red />
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        paddingTop: 0,
        width: '100%'
    }
});
