import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../../../themeContext';
import MyText from '../../../../components/myText';
import MyTextInput from '../../../../components/myTextInput';
import { PrimaryBtn } from '../../../../components/buttons';
import { Layout, Utility, Typography, Textfield, Misc } from '../../../../styles';
import PaidBy from './sections/paidBy';
import SplitBetween from './sections/splitBetween';

const Tab = createMaterialTopTabNavigator();

export default ExpenseDistribution = ({ route, navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [amt, setNewAmt] = useState(route.params.group.amt);
    // const [group, setGroup] = useState(null);
    // const [members, setMembers] = useState(null);
    const [usersPaid, setUsersPaid] = useState(route.params.group.usersPaid || []);
    const [usersSplit, setUsersSplit] = useState(route.params.group.usersSplit || []);
    const [paidSettled, setPaidSettled] = useState(true);
    const [splitSettled, setSplitSettled] = useState(true);

    const parseAmt = e => {
        const txt = e.nativeEvent.text;
        if (txt) {
            setNewAmt(parseFloat(amt || 0).toFixed(2));
        }
    };

    const saveDistribution = () => {
        navigation.navigate({
            name: 'default',
            params: { usersPaid, usersSplit, amt, flag: true },
            merge: true
        });
    };

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <View style={Layout.scrollViewContainer}>
                <View style={Layout.pageHeader}>
                    <MyText text="Distribution" ellipsizeMode="tail" numberOfLines={1} style={Misc.width[80]} title />
                    <TouchableOpacity
                        onPress={saveDistribution}
                        style={[paidSettled && splitSettled ? {} : { display: 'none' }]}
                    >
                        <Icon
                            name="checkmark"
                            color={Utility.Colors[theme === 'dark' ? 'light' : 'dark'].high}
                            size={40}
                        />
                    </TouchableOpacity>
                </View>
                <View style={[Misc.rows.container, { paddingTop: 0, paddingBottom: 20 }]}>
                    <MyText text="Total amount" opacity="low" style={Misc.rows.itemLeftGrow} bodyTitle />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MyText text={route.params.group?.currency} opacity="low" />
                        <MyTextInput
                            style={[Textfield.field, { textAlign: 'right', flexGrow: 0 }]}
                            clearButtonMode="while-editing"
                            keyboardType="phone-pad"
                            selectTextOnFocus={true}
                            placeholder=""
                            value={amt}
                            onChangeText={e => setNewAmt(e.replace(/[^0-9/.]/g, '') || '0')}
                            onEndEditing={e => parseAmt(e)}
                        />
                    </View>
                </View>
                {/*<MyText text={expenseStat.statement} {...(expenseStat.color === 'green' ? { green: true } : { red: true })} bodyTitleGilroy style={{paddingBottom: 30}} />*/}
                <View style={{ flex: 1 }}>
                    <GroupTabs
                        theme={theme}
                        group={route.params.group}
                        amt={amt}
                        paidSettled={paidSettled}
                        setPaidSettled={setPaidSettled}
                        splitSettled={splitSettled}
                        setSplitSettled={setSplitSettled}
                        usersPaid={usersPaid}
                        setUsersPaid={setUsersPaid}
                        usersSplit={usersSplit}
                        setUsersSplit={setUsersSplit}
                        // members={[...members]}
                    />
                </View>
                {/*<PrimaryBtn title="Save" disabled={paidSettled && splitSettled} onPress={saveDistribution} style={{marginBottom: 50}}/>*/}
            </View>
        </SafeAreaView>
    );
};

const GroupTabs = ({
    group,
    amt,
    paidSettled,
    setPaidSettled,
    splitSettled,
    setSplitSettled,
    usersPaid,
    setUsersPaid,
    usersSplit,
    setUsersSplit,
    // members,
    theme
}) => {
    const [members, setMembers] = useState(null);

    return (
        <Tab.Navigator
            initialRouteName="expensePaidBy"
            // style={{height: '100%', flex: 1, overflow:'visible'}}
            screenOptions={{
                tabBarActiveTintColor:
                    Utility.Colors[theme].high === '#272727' ? Utility.Colors.light.bg : Utility.Colors.dark.bg,
                tabBarIndicatorStyle: {
                    backgroundColor:
                        Utility.Colors[theme].high === '#272727' ? Utility.Colors.light.bg : Utility.Colors.dark.bg
                },
                tabBarIndicatorContainerStyle: { backgroundColor: 'transparent', zIndex: 1 },
                tabBarItemStyle: {
                    backgroundColor: Utility.Colors[theme].bg
                },
                tabBarStyle: { elevation: 0 },
                tabBarPressColor: 'transparent',
                tabBarLabelStyle: Typography.tabs.title
            }}
        >
            {/*<Tab.Screen name="expenses" component={Expenses} />*/}
            {console.log('expDist ', usersPaid, members)}
            <Tab.Screen
                name="expensePaidBy"
                options={{ tabBarLabel: 'Paid By', tabBarBadge: paidSettled ? null : () => <NotifDot /> }}
            >
                {props => (
                    <PaidBy
                        currency={group.cur}
                        // members={members}
                        users={Object.keys(group.members)}
                        amt={amt}
                        usersPaid={usersPaid}
                        setUsersPaid={setUsersPaid}
                        setPaidSettled={setPaidSettled}
                        {...props}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen
                name="expenseSplitBet"
                options={{ tabBarLabel: 'Split Between', tabBarBadge: splitSettled ? null : () => <NotifDot /> }}
            >
                {props => (
                    <SplitBetween
                        currency={group.cur}
                        // members={members}
                        users={Object.keys(group.members)}
                        amt={amt}
                        usersSplit={usersSplit}
                        setUsersSplit={setUsersSplit}
                        setSplitSettled={setSplitSettled}
                        {...props}
                    />
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

const NotifDot = () => {
    return <View style={[styles.notifDot, { backgroundColor: Utility.Colors.red }]}></View>;
};

const styles = StyleSheet.create({
    notifDot: {
        width: 6,
        height: 6,
        borderRadius: 3
    }
});
