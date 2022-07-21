import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    Pressable,
    ActivityIndicator,
    TouchableOpacity,
    FlatList,
    RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { ThemeContext } from '../../../../themeContext';
import MyText from '../../../../components/myText';
import { getExpenses } from '../../../../methods/expenses';
import { PrimaryBtn } from '../../../../components/buttons';
import { Misc, Utility, Button } from '../../../../styles';

export default Expenses = ({ currency, netBal, _id, relUserId, navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [expenses, setExpenses] = useState([]);
    const [noExpense, setNoExpense] = useState(false);
    const [loading, setLoading] = useState(false);
    const [listLoaded, setListLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [err, setErr] = useState(null);

    const themeColor = useMemo(() => {
        const currentTheme = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;
        return currentTheme;
    }, [theme]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await updateExpenseList(true);
        setRefreshing(false);
    }, []);

    const updateExpenseList = async (refreshList = false) => {
        console.log('in updateExpenses', refreshList);
        if (loading || listLoaded) return;

        let exp,
            endAt = null,
            n = expenses.length;

        setLoading(true);

        if (n > 0) {
            endAt = expenses[n - 1].ts;
        }

        exp = await getExpenses(_id, endAt);
        // console.log('ede', exp);
        setLoading(false);

        if (exp?.error) {
            // setNoExpense(true);
            setErr(exp.msg);
            return;
        }

        if (exp.length !== 0) {
            setNoExpense(false);
        } else {
            setListLoaded(true);
            refreshList && setNoExpense(true);
        }

        refreshList ? setExpenses(exp) : setExpenses(expenses => [...expenses, ...exp]);
        return exp.detachExpenseListener;
    };

    useFocusEffect(
        useCallback(() => {
            // updateExpenseList(true);
            setListLoaded(false);
            // console.log('_id  ', auth().currentUser.uid);
        }, [])
    );

    useEffect(() => {
        updateExpenseList(true);
    }, []);

    return (
        <View style={styles.container}>
            {!err ? (
                !noExpense ? (
                    <FlatList
                        data={expenses}
                        renderItem={({ item }) => (
                            <ExpenseItem
                                navigation={navigation}
                                grpId={_id}
                                expense={item}
                                relUserId={relUserId}
                                currency={currency}
                                themeColor={themeColor}
                            />
                        )}
                        keyExtractor={item => item._id}
                        showsVerticalScrollIndicator={false}
                        style={{ marginBottom: 100 }}
                        ListFooterComponent={
                            loading ? <ActivityIndicator size="small" color={themeColor.high} /> : null
                        }
                        onEndReachedThreshold={0.3}
                        onEndReached={() => updateExpenseList(false)}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    />
                ) : (
                    <View style={[Misc.rows.container, { justifyContent: 'center' }]}>
                        <MyText text="No expenses" body />
                    </View>
                )
            ) : (
                <View style={[Misc.rows.container, { justifyContent: 'center' }]}>
                    <MyText text={err} error />
                </View>
            )}
            <View
                style={[
                    Button.fixedBottomBtnContainer,
                    {
                        backgroundColor: Utility.Colors[theme].bg,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 0,
                        borderTopWidth: 1,
                        borderColor: themeColor.med
                    }
                ]}
            >
                <View>
                    <MyText text="Total spendings" style={{ textAlign: 'left' }} subTitle />
                    <MyText
                        text={`${currency} ${netBal}`}
                        opacity="low"
                        style={{ textAlign: 'left', fontWeight: 'bold' }}
                        subTitle
                    />
                </View>
                <PrimaryBtn
                    title="Expense"
                    icon={{ name: 'add' }}
                    size="small"
                    onPress={() =>
                        navigation.navigate('expenses', {
                            screen: 'default',
                            params: {
                                _id
                            }
                        })
                    }
                />
            </View>
        </View>
    );
};

const ExpenseItem = ({ navigation, grpId, expense, relUserId, currency, themeColor }) => {
    const userId = auth().currentUser.uid;
    const [iBal, setIBal] = useState(0.0);
    const [textProps, setTextProps] = useState();
    const [role] = useState(expense.members ? expense.members[relUserId[userId]] : null);

    useEffect(() => {
        if (expense.type === 'standard') {
            const relId = [relUserId[userId]];
            const info =
                role === 'payee'
                    ? { text: 'You get', green: true }
                    : role === 'receiver'
                    ? { text: 'You owe', red: true }
                    : { text: 'Not involved' };

            setTextProps(info);

            const bal = JSON.parse(expense.bal);

            let myBal = 0.0;

            if (role === 'receiver') {
                // bal[relId].forEach(v => {
                //     for (let p in v) {
                //         iBal += parseFloat(v[p]);
                //     }
                // });
                let user = bal[relId];
                for (let p in user) {
                    myBal += parseFloat(user[p]);
                }
            } else if (role === 'payee') {
                for (let p in bal) {
                    // bal[p].forEach(v => {
                    //     if (v[relId]) iBal += parseFloat(v[relId]);
                    // });
                    let user = bal[p];
                    for (let v in user) {
                        myBal += parseFloat(user[v]);
                    }
                }
            }
            setIBal(myBal);
        }
    }, []);

    return (
        <TouchableOpacity
            style={Misc.rows.container}
            {...(expense.type === 'standard'
                ? {
                      onPress: () =>
                          navigation.navigate('expenses', {
                              screen: 'default',
                              params: {
                                  _id: grpId,
                                  expId: expense._id,
                                  mode: 'edit'
                              }
                          })
                  }
                : null)}
        >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.dateContainer}>
                    <MyText
                        text={`${new Date(expense.ts).toString().slice(8, 10)} ${new Date(expense.ts)
                            .toString()
                            .slice(4, 7)}`}
                        opacity="med"
                        style={styles.expenseDate}
                        expenseDate
                    />
                </View>
                <View style={Misc.width[75]}>
                    {expense.type === 'standard' ? (
                        <>
                            <MyText
                                text={expense.title}
                                opacity="med"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ paddingBottom: 5 }}
                                bodyTitle
                            />
                            <MyText text={`${currency}${expense.amt}`} opacity="low" bodySubTitle />
                        </>
                    ) : (
                        <>
                            <MyText
                                text={expense.title}
                                opacity="low"
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                bodySubTitle
                            />
                        </>
                    )}
                </View>
            </View>
            <View>
                {expense.type === 'standard' ? (
                    <>
                        <MyText {...textProps} opacity="low" style={{ paddingBottom: 5 }} bodySubTitle />
                        {role !== 'Not involved' && <SubText role={role} iBal={iBal} currency={currency} />}
                    </>
                ) : (
                    <>
                        <Icon name="checkmark-done" color={themeColor.low} size={30} />
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

const SubText = ({ role, iBal, currency }) => {
    return (
        <>
            <MyText
                text={`${currency}${iBal}`}
                // text="aa"
                opacity="low"
                {...(role === 'payee' ? { green: true } : role === 'receiver' ? { red: true } : null)}
                style={{ textAlign: 'right' }}
                bodyTitle
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        flex: 1
    },
    // rows: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     paddingBottom: 30
    // },
    dateContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 38,
        height: 38,
        backgroundColor: 'rgba(39, 39, 39, .04)',
        paddingHorizontal: 5,
        marginRight: 15,
        marginTop: 10,
        borderRadius: 19
    },
    expenseDate: {
        textAlign: 'center'
    }
});
