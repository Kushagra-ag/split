import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { View, Modal, ScrollView, StyleSheet, Pressable, TouchableOpacity, Switch, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import Divider from '../components/divider';
import { removeGroupMember, setDeafultGrp, deleteGroup } from '../methods/groups';
import { Textfield, Layout, Misc, Utility } from '../styles';

export default GroupSettingsModal = ({
    visible,
    setVisible,
    group,
    updateGroup,
    themeColor,
    addMembersToGroup,
    homeNavigate,
    ...rest
}) => {
    const [grpNameEditable, setGrpNameEditable] = useState(false);
    const [grp, setGrp] = useState(group);
    const [loading, setLoading] = useState({
        leaveGrp: false,
        deleteGrp: false
    });
    const [user] = useState(auth().currentUser.uid);
    const [err, setErr] = useState(null);
    const nameFieldRef = useRef(null);

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
        addMembersToGroup();
    };

    const toggleDefaultGroup = async () => {
        let defGrp = true;

        if (grp.defaultGrp && grp.defaultGrp[user]) {
            defGrp = false;
        }
        //call to update firebase
        const e = await setDeafultGrp(user, group._id, defGrp);
        if(e?.error) {
            setErr(e.msg);
            return
        }
        handleChange('defaultGrp', { [user]: defGrp });
    };

    const handleChange = (key, value) => {

        setGrp(grp => ({...grp, [key]: value}))
    }

    const leaveGroup = () => {
        setLoading(loading => ({...loading, leaveGrp: false}));
        setErr(null);

        const leaveGrpConfirm = async () => {
            const e = await removeGroupMember(auth().currentUser.uid, group._id);
            setLoading(loading => ({...loading, leaveGrp: false}));

            if(e?.error) {
                setErr(e.msg);
                return
            }

            homeNavigate();
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

    const deleteGrp = () => {
        setLoading(loading => ({...loading, deleteGrp: true}));
        setErr(null);

        const deleteGroupConfirm = async () => {
            const e = await deleteGroup(grp._id);
            setLoading(loading => ({...loading, deleteGrp: false}));

            if(e?.error) {
                setErr(e.msg);
                return
            }

            homeNavigate();
        };

        const cashFlowArr = JSON.parse(grp.cashFlowArr);
        let mostLentUserId = 0, maxAmt = 0;

        cashFlowArr.forEach((c, relId) => {
            if(c > maxAmt) {
                mostLentUserId = relId;
                maxAmt = c;
            }
        });
        console.log(cashFlowArr, mostLentUserId, maxAmt);
        
        if(grp.relUserId[auth().currentUser.uid] === mostLentUserId) {
            // Current user is the one who lent most
            Alert.alert(
                '',
                'Are you sure you want to delete this group?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => setLoading(loading => ({...loading, deleteGrp: false}))
                    },
                    {
                        text: 'yes',
                        onPress: deleteGroupConfirm
                    }
                ]
            );
        } else {
            Alert.alert(
                '',
                'Only the person who has lent the most can delete a group :)',
                [
                    {
                        text: 'Cancel',
                        onPress: () => setLoading(loading => ({...loading, deleteGrp: false}))
                    }
                ]
            );
        }
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
                        <Pressable onPress={() => {setVisible(false);
                            if(grpNameEditable) {
                                setGrpNameEditable(false);
                                setGrp(grp => ({...grp, name: group.name}))
                            }
                        }}>
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </Pressable>
                    </View>
                    <View style={[Misc.rows.container, styles.menuItem]}>
                        <MyTextInput
                            value={grp.name}
                            ref={nameFieldRef}
                            style={[Textfield.field, { flexGrow: 0 }]}
                            editable={grpNameEditable}
                            clearButtonMode="while-editing"
                            onChangeText={(text) => handleChange('name', text)}
                        />
                        <Pressable
                            onPress={() => {
                                if (!grpNameEditable) {
                                    setGrpNameEditable(true);
                                    nameFieldRef.current.focus();
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
                    
                        <Pressable
                            onPress={addMembers}
                            style={({ pressed }) => [Misc.rows.container, styles.menuItem,
                                pressed ? { opacity: 0.6, backgroundColor: '#00000022' } : {}
                            ]}
                        >
                            <MyText text="Add members" bodyTitle />
                        </Pressable>
                    
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
                    
                        <TouchableOpacity
                            onPress={leaveGroup}
                            style={[Misc.rows.container, styles.menuItem]}
                            disabled={loading.leaveGrp}
                        >
                            <MyText text="Leave group" bodyTitle />
                        </TouchableOpacity>
                    
                    
                        <TouchableOpacity
                            onPress={deleteGrp}
                            style={[Misc.rows.container, styles.menuItem]}
                            disabled={loading.deleteGrp}
                        >
                            <MyText text="Delete group" bodyTitle />
                        </TouchableOpacity>
                    
                    {err && <MyText text={err || ''} error />}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        paddingVertical: 15,
        width: '100%'
    }
});
