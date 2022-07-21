import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
    View,
    Modal,
    ScrollView,
    useWindowDimensions,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Switch,
    Share,
    Alert
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import reqHandler from '../methods/reqHandler';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import Divider from '../components/divider';
import { removeGroupMember, deleteGroup } from '../methods/groups';
import { Textfield, Layout, Misc, Utility } from '../styles';

export default GroupSettingsModal = ({
    visible,
    setVisible,
    group,
    updateGroup,
    themeColor,
    addMembersToGroup,
    navigate,
    ...rest
}) => {
    const [grpNameEditable, setGrpNameEditable] = useState(false);
    const [grp, setGrp] = useState(group);
    const [loading, setLoading] = useState({
        leaveGrp: false,
        deleteGrp: false
    });
    const [user] = useState(auth().currentUser.uid);
    const { height } = useWindowDimensions();
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
        let e = await reqHandler({
            action: 'setDeafultGrp',
            apiUrl: 'groups',
            method: 'POST',
            params: {
                grpId: group._id,
                user,
                defGrp
            }
        });

        if (e?.error) {
            setErr(e.msg);
            return;
        }
        handleChange('defaultGrp', { [user]: defGrp });
    };

    const handleChange = (key, value) => {
        setGrp(grp => ({ ...grp, [key]: value }));
    };

    const shareInviteLink = async () => {
        console.log('in share func', grp.inviteLink);

        try {
            const result = await Share.share(
                {
                    title: 'Share the invite code with your friends',
                    message: `Join my group on Split. Click here - https://unigma.page.link/group/join/${grp.inviteLink}`
                },
                {
                    dialogTitle: 'Invite link'
                }
            );
            console.log('aa', result);
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log(result);
                } else if (result.action === Share.dismissedAction) {
                    console.log('dismissed', result);
                }
            }
        } catch (e) {
            console.log(e);
            setErr('Cannot share link. Please try again later.');
        }
    };

    const leaveGroup = () => {
        setLoading(loading => ({ ...loading, leaveGrp: true }));
        setErr(null);

        // Variable to delete group if the user is the sole member left
        const delGrp = Object.keys(grp.members).length === 1 ? true : false;

        const leaveGrpConfirm = async () => {
            const e = await reqHandler({
                action: 'removeGroupMember',
                apiUrl: 'groups',
                method: 'POST',
                params: {
                    grpId: group._id,
                    userId: auth().currentUser.uid
                }
            });

            setLoading(loading => ({ ...loading, leaveGrp: false }));

            if (e?.error) {
                setErr(e.msg);
                return;
            }

            navigate(
                {
                    index: 0,
                    routes: [
                        {
                            name: 'home'
                        }
                    ]
                },
                'reset'
            );

            if (delGrp) {
                const e = await reqHandler({
                    action: 'deleteGroup',
                    apiUrl: 'groups',
                    method: 'POST',
                    params: {
                        grpId: grp._id,
                    }
                });

                if(e?.error) {
                    // fail silently
                }
            }
        };

        Alert.alert(
            '',
            `Are you sure you want to leave this group? ${
                delGrp ? "Since you're the only member, the group will be deleted" : ''
            }`,
            [
                {
                    text: 'Cancel',
                    onPress: () => null
                },
                { text: 'Yes', onPress: leaveGrpConfirm }
            ]
        );
    };

    const deleteGrp = () => {
        setLoading(loading => ({ ...loading, deleteGrp: true }));
        setErr(null);

        const deleteGroupConfirm = async () => {
            const e = await reqHandler({
                action: 'deleteGroup',
                apiUrl: 'groups',
                method: 'POST',
                params: {
                    grpId: grp._id,
                }
            });
            setLoading(loading => ({ ...loading, deleteGrp: false }));

            if (e?.error) {
                console.log(e);
                setErr(e.msg);
                return;
            }

            navigate(
                {
                    index: 0,
                    routes: [
                        {
                            name: 'home'
                        }
                    ]
                },
                'reset'
            );
        };

        const cashFlowArr = JSON.parse(grp.cashFlowArr);
        let mostLentUserId = 0,
            maxAmt = 0,
            noExpense = true;

        cashFlowArr.forEach((c, relId) => {
            if (c) noExpense = false;
            if (c > maxAmt) {
                mostLentUserId = relId;
                maxAmt = c;
            }
        });
        console.log(cashFlowArr, mostLentUserId, maxAmt);

        if ((noExpense && group.ownerId === user) || grp.relUserId[user] === mostLentUserId) {
            // Current user is the one who lent most
            Alert.alert('', 'Are you sure you want to delete this group?', [
                {
                    text: 'Cancel',
                    onPress: () => setLoading(loading => ({ ...loading, deleteGrp: false }))
                },
                {
                    text: 'yes',
                    onPress: deleteGroupConfirm
                }
            ]);
        } else {
            Alert.alert('', 'Only the person who has lent the most can delete a group :)', [
                {
                    text: 'Cancel',
                    onPress: () => setLoading(loading => ({ ...loading, deleteGrp: false }))
                }
            ]);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true} {...rest}>
            <View style={[Layout.modal.modalView]}>
                <ScrollView
                    style={[
                        {
                            backgroundColor:
                                themeColor.bg === Utility.Colors.dark.bg
                                    ? Utility.Colors.light.bg
                                    : Utility.Colors.dark.bg,
                            maxHeight: height / 2,
                            borderTopRightRadius: 20,
                            borderTopLeftRadius: 20
                        }
                    ]}
                    contentContainerStyle={Layout.modal.modalChildView}
                >
                    <View style={[Layout.pageHeader, { width: '100%' }]}>
                        <MyText text="Group settings" bodyTitle style={{ fontFamily: 'PlayfairDisplay-Bold' }} />
                        <Pressable
                            onPress={() => {
                                setVisible(false);
                                if (grpNameEditable) {
                                    setGrpNameEditable(false);
                                    setGrp(grp => ({ ...grp, name: group.name }));
                                }
                            }}
                        >
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </Pressable>
                    </View>
                    <View style={[Misc.rows.container, styles.menuItem]}>
                        <MyTextInput
                            value={grp.name}
                            ref={nameFieldRef}
                            style={[Textfield.field, { flexGrow: 0 }]}
                            editable={grpNameEditable}
                            onChangeText={text => handleChange('name', text)}
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
                        style={({ pressed }) => [
                            Misc.rows.container,
                            styles.menuItem,
                            pressed ? { opacity: 0.6, backgroundColor: '#00000022' } : {}
                        ]}
                    >
                        <MyText text="Add members" menuItem />
                    </Pressable>

                    <View style={[Misc.rows.container, styles.menuItem]}>
                        <MyText text="Default group" menuItem />
                        <Switch
                            onValueChange={toggleDefaultGroup}
                            value={grp.defaultGrp && grp.defaultGrp[user]}
                            trackColor={{ false: themeColor.low, true: themeColor.low }}
                            thumbColor={themeColor.high}
                        />
                    </View>
                    <TouchableOpacity onPress={shareInviteLink} style={[Misc.rows.container, styles.menuItem]}>
                        <MyText text="Share invite link" menuItem />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            navigate(
                                {
                                    _id: grp._id
                                },
                                'navigate',
                                'setDefaultConfig'
                            )
                        }
                        style={[Misc.rows.container, styles.menuItem]}
                    >
                        <MyText text="Set default distribution" menuItem />
                    </TouchableOpacity>
                    <Divider />

                    <TouchableOpacity
                        onPress={leaveGroup}
                        style={[Misc.rows.container, styles.menuItem]}
                        disabled={loading.leaveGrp}
                    >
                        <MyText text="Leave group" menuItem />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={deleteGrp}
                        style={[Misc.rows.container, styles.menuItem]}
                        disabled={loading.deleteGrp}
                    >
                        <MyText text="Delete group" menuItem />
                    </TouchableOpacity>

                    {err && <MyText text={err || ''} error />}
                </ScrollView>
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
