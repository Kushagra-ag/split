import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    Pressable,
    ActivityIndicator,
    FlatList,
    RefreshControl
} from 'react-native';
import Pie from 'react-native-pie';
import Icon from 'react-native-vector-icons/Ionicons';
// import auth from '@react-native-firebase/auth';
import { ThemeContext } from '../../../../themeContext';
import MyText from '../../../../components/myText';
import { getUsers } from '../../../../methods/user';
import { testF } from '../../../../methods/misc';
import { settleBalance } from '../../../../methods/expenses';
import { PrimaryBtn } from '../../../../components/buttons';
import { SettleBalanceModal } from '../../../../modals';
import { Misc, Utility, Textfield } from '../../../../styles';

export default Balances = ({ _id, users, currency, cashFlowArr, netBal, balanceInfo, relUserId, navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [settleBalanceModal, setSettleBalanceModal] = useState({
        visible: false,
        grpId: null,
        balance: null
    });
    const [members, setMembers] = useState(null);
    const [balance, setBalance] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [sections, setSections] = useState([
        {
            percentage: 100,
            color: '#E5DCCD'
        }
    ]);
    const [noExpense, setNoExpense] = useState(true);
    const [err, setErr] = useState(null);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await getGrpMembers();
        setRefreshing(false);
    }, []);

    const getGrpMembers = async () => {
        let m = await getUsers(users),
            slices = [],
            b = [...balanceInfo],
            othersPercent = 100;

        if (m?.error) {
            setErr(m.msg);
            return;
        }

        const n = users.length;

        let numbers = Array(15)
            .fill()
            .map((_, index) => index);
        numbers.sort(() => Math.random() - 0.5);

        m = m.map((member, idx) => {
            const relId = relUserId[member._id];
            let slice = {},
                i = 0;
            slice.percentage = Math.ceil(((netBal / n + cashFlowArr[relId]) / netBal) * 100) || 0;

            if (slices.length < 5) {
                slice.color = Utility.Colors.palletes[numbers[idx]];
                slices = [...slices, slice];
            } else {
                slice.color = '#000000';
            }

            // member = { ...member, ...slice, amtSpent: (netBal / n + cashFlowArr[relId]).toFixed(2) };

            while (i !== n) {
                if (b[i]._id === member._id) {
                    let amtSpent = member.groups[_id].amtSpent || 0;
                    console.log('gg', member, member.groups)
                    b[i] = { ...b[i], ...slice, amtSpent };
                    member = { ...member, amtSpent };
                    break;
                }
                i = i + 1;
            }

            console.log('slcie', slice);

            slice.percentage && setNoExpense(false);

            // slices = [...slices, slice];
            return member;
        });

        setBalance(b);

        slices.forEach(s => {
            othersPercent -= s.percentage;
        });

        othersPercent = othersPercent < 0 ? 0 : othersPercent;

        slices = [...slices, { color: '#000000', percentage: parseInt(othersPercent.toFixed(2)) }];
        // console.log('ss', slices);

        setSections(slices);

        m.sort((a, b) => b.percentage - a.percentage);
        console.log(m);

        // setTopPayee(m[hIdx]);
        setMembers(m);
        // balances && calcBal(m);
    };

    useEffect(() => {
        balanceInfo && getGrpMembers();
    }, [balanceInfo]);

    return (
        <View style={styles.container}>
            {err ? (
                <MyText text={err} error />
            ) : noExpense ? (
                <View style={[Misc.rows.container, { justifyContent: 'center' }]}>
                    <MyText text="No expenses" body />
                </View>
            ) : (
                <>
                    <View style={[Misc.rows.containerStart, { paddingTop: 0 }]}>
                        <View style={[{ marginRight: 25 }]}>
                            <Pie radius={60} innerRadius={45} sections={sections} strokeCap={'butt'} />
                        </View>
                        <View style={Misc.rows.itemLeftGrow}>
                            <MyText text="Top contributor" bodyTitle />
                            {members && (
                                <>
                                    <View style={[Misc.rows.container, { paddingVertical: 15 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                {...(members[0].photoURL
                                                    ? { source: { uri: members[0].photoURL } }
                                                    : {
                                                          source: require('../../../../assets/images/profile-default.png')
                                                      })}
                                                resizeMode="cover"
                                                resizeMethod="scale"
                                                style={[
                                                    Misc.rows.profilePhotoSmall,
                                                    { marginRight: 10, borderWidth: 1, borderColor: members[0].color }
                                                ]}
                                            />
                                            {/*<View style={[styles.legendDot, {backgroundColor: members[0].color, marginRight: 5
                                                    }]}>
                                                        
                                                    </View>*/}

                                            <View style={Misc.rows.itemLeftGrow}>
                                                <MyText
                                                    text={members[0].name}
                                                    style={Misc.width[85]}
                                                    opacity="med"
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    label
                                                />
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MyText text={currency} opacity="low" />
                                            <MyText
                                                text={members[0].amtSpent}
                                                style={{ textAlign: 'right' }}
                                                subTitle
                                            />
                                        </View>
                                    </View>

                                    {members.length > 5 && (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                flexWrap: 'wrap',
                                                maxWidth: '100%',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[styles.legendDot, { backgroundColor: '#000' }]}></View>
                                                <MyText
                                                    text={'Others'}
                                                    opacity="low"
                                                    style={{ maxWidth: 100 }}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    subTitle
                                                />
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </View>

                    {balance && (
                        <FlatList
                            data={balance}
                            renderItem={({ item }) => (
                                <BalanceItem
                                    grpId={_id}
                                    item={item}
                                    currency={currency}
                                    setSettleBalanceModal={setSettleBalanceModal}
                                    theme={theme}
                                />
                            )}
                            keyExtractor={item => item._id}
                            showsVerticalScrollIndicator={false}
                            // ListFooterComponent={}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        />
                    )}
                </>
            )}
            {settleBalanceModal.visible && (
                <SettleBalanceModal
                    visible={settleBalanceModal.visible}
                    setVisible={v => setSettleBalanceModal(visible => ({ ...visible, visible: v }))}
                    {...settleBalanceModal}
                />
            )}
        </View>
    );
};

const BalanceItem = ({ grpId, item, currency, setSettleBalanceModal, theme }) => {
    const [collapse, setCollapse] = useState(true);
    // console.log('ii', item)

    useEffect(() => {
        console.log('ii', item.balSummary.length);
    }, []);

    return (
        <View style={[styles.balanceCard, { borderColor: item.color }]}>
            <Pressable
                style={[Misc.rows.container, { flex: 1, paddingVertical: 0 }]}
                onPress={() => {
                    setCollapse(collapse => !collapse);
                    testF();
                }}
            >
                <Image
                    {...(item.photoURL
                        ? { source: { uri: item.photoURL } }
                        : { source: require('../../../../assets/images/profile-default.png') })}
                    resizeMode="cover"
                    resizeMethod="scale"
                    style={[Misc.rows.profilePhoto, { marginRight: 10 }]}
                />
                <View style={Misc.rows.itemLeftGrow}>
                    <MyText
                        text={item.bal.title}
                        style={Misc.width[85]}
                        opacity="med"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        label
                        {...item.bal.color}
                    />
                    <MyText text={`Total amount spent - ${currency}${item.amtSpent}`} opacity="low" bodySubTitle dark />
                </View>
                <Icon
                    name={collapse ? 'chevron-down-outline' : 'chevron-up-outline'}
                    color={Utility.Colors[theme === 'light' ? 'dark' : 'light'].low}
                    size={16}
                    style={{ paddingRight: 1 }}
                />
            </Pressable>
            <View>
                {!collapse &&
                    (item.balSummary.length > 0 ? (
                        item.balSummary.map((balance, idx) => (
                            <Pressable
                                style={[
                                    Misc.rows.container,
                                    {
                                        flex: 1
                                    }
                                ]}
                                key={idx}
                                onPress={() => {
                                    console.log('frm bal screen', balance);
                                    setSettleBalanceModal({
                                        visible: true,
                                        grpId,
                                        balance
                                    });
                                }}
                            >
                                <MyText
                                    style={[{ marginVertical: 3, maxWidth: '80%' }, idx ? {} : { marginTop: 15 }]}
                                    text={balance.msg}
                                    key={idx}
                                    opacity="low"
                                    subTitle
                                    dark
                                />
                                <View>
                                    <Icon
                                        name="checkmark-circle"
                                        color={Utility.Colors[theme === 'light' ? 'dark' : 'light'].med}
                                        size={20}
                                        style={{ paddingRight: 1 }}
                                    />
                                </View>
                            </Pressable>
                        ))
                    ) : (
                        <MyText text="No pending balances" style={{ paddingVertical: 20 }} subTitle />
                    ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        flex: 1,
        justifyContent: 'flex-start'
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
        overflow: 'hidden'
    },
    balanceCard: {
        // backgroundColor: '#fefefe',
        marginVertical: 10,
        paddingVertical: 20,
        paddingLeft: 20,
        paddingRight: 5,
        // borderRadius: 30,
        borderLeftWidth: 4,
        borderColor: '#e9e9e9'
        // width: '100%',
        // flex: 1
    }
});
