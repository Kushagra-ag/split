import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    Pressable,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import auth from '@react-native-firebase/auth';
import { getUsers } from '../../../methods/user';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../../../components/myText';
import { Layout, Utility, Typography, Misc } from '../../../styles';
import { ThemeContext } from '../../../themeContext';
import { getGroupDetails } from '../../../methods/groups';
import { calcBalanceDist } from '../../../methods/misc';
import Expenses from './sections/expenses';
import Balances from './sections/balances';
import { GroupSettingsModal, GroupMemberInfoModal } from '../../../modals';

const Tab = createMaterialTopTabNavigator();

export default Default = ({ route, navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [group, updateGroup] = useState(null);
    const [expenses, updateExpenses] = useState([]);
    const [members, setMembers] = useState([]);
    const [settingsModal, showSettingsModal] = useState(false);
    const [memberInfoModal, setMemberInfoModal] = useState({
        visible: false,
        balanceInfo: null,
        member: null
    });
    const [balanceInfo, setBalanceInfo] = useState(null);

    // const height = Dimensions.get('window').height;
    // const width = Dimensions.get('window').width;

    const themeColor = useMemo(() => {
        const currentTheme = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;
        return currentTheme;
    }, [theme]);

    const getMembers = async group => {
        const usersArr = Object.keys(group.members);
        let m = await getUsers(usersArr);

        group.balances && calcBal(m, group.balances, group.relUserId, group.cashFlowArr, group.cur);

        m.push({ _id: 'addMember' });

        // m = [...m, ...m, ...m];
        setMembers(m);
        // console.log('members', members, usersArr);
    };

    const getGroupInfo = async () => {
        let g = await getGroupDetails(route.params._id);
        g._id = route.params._id;
        // console.log('frn default ', g)
        updateGroup(g);
        // setMemberInfoModal(memberInfoModal => ({...memberInfoModal, relUserId: g.relUserId}));
        getMembers(g);
    };

    const calcBal = (m, balances, relUserId, cashFlowArr, currency) => {
        let i = m.length,
            // relIdUser = relUserId[userId],
            cashFlowArrJSON = JSON.parse(cashFlowArr),
            balancesJSON = JSON.parse(balances),
            userArr = [...m],
            temp;

        // Interchanging current user position
        while (i--) {
            if (userArr[i]._id === auth().currentUser.uid) {
                break;
            }
        }

        temp = userArr[i];
        userArr[i] = userArr[0];
        userArr[0] = temp;

        setBalanceInfo(calcBalanceDist(userArr, balancesJSON, relUserId, cashFlowArrJSON, currency));
    };

    const addMembersModalNavigate = () => {
        navigation.navigate('newGroup', { screen: 'addMembers', params: { mode: 'modify', grpId: route.params._id } });
    };

    const homeNavigate = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'home'
                }
            ]
        });
    };

    const updateMembersAfterDelete = id => {
        let m = [...members],
            n = members.length,
            i = 0;

        while (i !== n) {
            let member = members[i];
            if (member._id === id) {
                m.splice(i, 1);
                break;
            }
            i = i + 1;
        }

        setMembers(m);
    };

    useEffect(() => {
        getGroupInfo();

        // navigation.navigate('expenses')
    }, []);

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <View style={[Layout.scrollViewContainer]}>
                <View style={Layout.pageHeader}>
                    <MyText text={group?.name} title ellipsizeMode="tail" numberOfLines={1} style={Misc.width[80]} />
                    <TouchableOpacity onPress={() => showSettingsModal(true)}>
                        <Icon name="settings" color={themeColor.med} size={24} />
                    </TouchableOpacity>
                </View>
                <View style={[Layout.horizontalScrollMemeberView.container, { marginBottom: 20 }]}>
                    <FlatList
                        data={members}
                        // extrData={balanceInfo}
                        renderItem={({ item }) => (
                            <MemberItem
                                member={item}
                                themeColor={themeColor}
                                setMemberInfoModal={setMemberInfoModal}
                                balanceInfo={balanceInfo?.filter(b => b._id === item._id)}
                            />
                        )}
                        keyExtractor={item => item._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    {group && (
                        <GroupTabs
                            themeColor={themeColor}
                            currency={group.cur}
                            netBal={group.netBal}
                            balanceInfo={balanceInfo}
                            _id={group._id}
                            relUserId={group.relUserId}
                            users={Object.keys(group.members)}
                            cashFlowArr={group.cashFlowArr}
                        />
                    )}
                </View>
            </View>
            {group && (
                <GroupSettingsModal
                    visible={settingsModal}
                    setVisible={showSettingsModal}
                    addMembersModalNavigate={addMembersModalNavigate}
                    themeColor={themeColor}
                    group={group}
                    updateGroup={updateGroup}
                />
            )}
            {memberInfoModal.visible && (
                <GroupMemberInfoModal
                    setVisible={v => setMemberInfoModal(memberInfoModal => ({ ...memberInfoModal, visible: v }))}
                    themeColor={themeColor}
                    relUserId={group.relUserId}
                    grpId={route.params._id}
                    updateMembersAfterDelete={updateMembersAfterDelete}
                    homeNavigate={homeNavigate}
                    {...memberInfoModal}
                />
            )}
        </SafeAreaView>
    );
};

const MemberItem = ({ member, themeColor, balanceInfo, setMemberInfoModal }) => {
    return (
        <Pressable
            style={Layout.horizontalScrollMemeberView.user}
            onPress={() => setMemberInfoModal({ visible: true, member, balanceInfo })}
        >
            {member._id !== 'addMember' ? (
                <>
                    <Image
                        {...(member.photoURL
                            ? { source: { uri: member.photoURL } }
                            : { source: require('../../../assets/images/profile-default.png') })}
                        style={Layout.horizontalScrollMemeberView.userImg}
                    />
                    <MyText
                        text={member.name}
                        style={Layout.horizontalScrollMemeberView.userText}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        bodySubTitle
                    />
                </>
            ) : (
                <Pressable onPress={() => null}>
                    <Icon name="add-circle-outline" color={themeColor.low} size={40} />
                </Pressable>
            )}
        </Pressable>
    );
};

const GroupTabs = ({ currency, netBal, balanceInfo, themeColor, _id, relUserId, cashFlowArr, users }) => {
    // const crtGrp = props.group;
    return (
        <Tab.Navigator
            initialRouteName="grpExpenses"
            // style={{height: '100%', flex: 1, overflow:'visible'}}
            screenOptions={{
                tabBarActiveTintColor: themeColor.high,
                tabBarIndicatorStyle: { backgroundColor: themeColor.high },
                tabBarIndicatorContainerStyle: { backgroundColor: 'transparent', zIndex: 1 },
                tabBarItemStyle: {
                    backgroundColor: themeColor.high === '#272727' ? Utility.Colors.light.bg : Utility.Colors.dark.bg
                },

                // tabBarContentContainerStyle: {shadowOpacity:0, elevation:0, borderWidth:0},
                tabBarStyle: { elevation: 0 },
                tabBarPressColor: 'transparent',
                tabBarLabelStyle: Typography.tabs.title
            }}
        >
            {/*<Tab.Screen name="expenses" component={Expenses} />*/}
            <Tab.Screen name="grpExpenses" options={{ tabBarLabel: 'expenses' }}>
                {props => <Expenses currency={currency} netBal={netBal} _id={_id} relUserId={relUserId} {...props} />}
            </Tab.Screen>
            <Tab.Screen name="grpBalances" options={{ tabBarLabel: 'balances' }}>
                {props => (
                    <Balances
                        currency={currency}
                        netBal={netBal}
                        balanceInfo={balanceInfo}
                        cashFlowArr={JSON.parse(cashFlowArr)}
                        _id={_id}
                        users={users}
                        relUserId={relUserId}
                        {...props}
                    />
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};
