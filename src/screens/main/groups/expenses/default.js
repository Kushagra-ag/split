import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Alert, View, SafeAreaView, ScrollView, StyleSheet, Pressable, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { Layout, Utility, Typography, Textfield, Misc, Button } from '../../../../styles';
import MyText from '../../../../components/myText';
import MyTextInput from '../../../../components/myTextInput';
import { OutlineBtn, PrimaryBtn } from '../../../../components/buttons';
import { ThemeContext } from '../../../../themeContext';
import { addExpense, getExpense, deleteExpense } from '../../../../methods/expenses';
import { getGroupDetails } from '../../../../methods/groups';
import { getUsers } from '../../../../methods/user';
import { calcBalanceDist } from '../../../../methods/misc';

export default Default = ({ route, navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [mode] = useState(route.params.mode || 'add');
    const [expense, setExpense] = useState({
        title: mode === 'add' ? 'Expense 1' : 'loading...',
        desc: mode === 'add' ? '' : 'loading...',
        date: Date.now(),
        amt: '50',
        bal: null
    });

    const [date, setDate] = useState({
        show: false,
        mode: 'spinner',
        date: new Date()
    });
    const [readableDate, setReadableDate] = useState(JSON.stringify(date.date).slice(1, 11).split('-'));
    const [group, setGroup] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    const [themeColor] = useState(theme === 'dark' ? 'light' : 'dark');

    useFocusEffect(
        useCallback(() => {
            console.log('in useFocusEffect', route.params.amt, route.params);

            if (route.params.amt) {
                console.log('inside if');
                setExpense(expense => ({ ...expense, amt: route.params.amt }));
            }
        }, [route])
    );

    const getExpenseDetails = async (grpId, expId) => {
        if (group) {
            let expDetails = await getExpense(grpId, expId);

            if (expDetails?.error) {
                setErr(expDetails.msg);
                return;
            }
            // console.log(expDetails);

            // let group = await getGroupDetails(route.params._id);
            let members = await getUsers(Object.keys(group.members));

            const bal = calcBalanceDist(
                members,
                JSON.parse(expDetails.bal),
                group.relUserId,
                null,
                group.cur,
                auth().currentUser.uid
            );
            console.log('kjh', bal);

            setExpense({
                bal,
                title: expDetails.title,
                desc: expDetails.desc,
                date: expDetails.ts,
                amt: expDetails.amt
            });

            setDate(date => ({ ...date, date: new Date(expDetails.ts) }));
            setReadableDate(JSON.stringify(new Date(expDetails.ts)).slice(1, 11).split('-'));
        }
    };

    const onDateChange = (event, date) => {
        console.log(event, date);

        if (event.type === 'set') {
            setReadableDate(JSON.stringify(date).slice(1, 11).split('-'));
            setExpense(expense => ({ ...expense, date: date.getTime() }));
        }

        setDate(date => ({ ...date, show: false }));
    };

    const handleChange = (e, key) => {
        setErr(null);

        if (key === 'amt') {
            e = e.replace(/^0+/, '').replace(/[^0-9/.]/g, '');
        }

        setExpense(expense => ({ ...expense, [key]: e }));
    };

    const expDistribute = () => {
        navigation.navigate('expenses', {
            screen: 'expenseDistribution',
            params: {
                group: {
                    // ...route.params.group,
                    _id: route.params._id,
                    amt: parseFloat(expense.amt || 0).toFixed(2),
                    usersPaid: route.params.usersPaid || [],
                    usersSplit: route.params.usersSplit || [],
                    cur: group.cur,
                    members: group.members
                }
            }
        });
    };

    const saveExpense = async () => {
        if (!expense.title) {
            setErr('Title is required');
            return;
        }

        setLoading(true);
        let { usersPaid, usersSplit, flag, amt } = route.params;

        const { cashFlowArr, relUserId, netBal, cur } = group;

        console.log(amt, typeof amt, usersPaid, usersSplit);

        // The flag indicates whether the user has distributed the expenses manually
        if (!flag) {
            // Default split
            const user = auth().currentUser,
                _id = auth().currentUser.uid,
                name = user.displayName;
            const { photoURL } = user;

            usersPaid = [{ _id, name, photoURL, val: expense.amt }];
            usersSplit = [{ _id, name, photoURL, val: expense.amt }];
            amt = parseFloat(expense.amt);
        }
        // console.log('afeter flag', amt, typeof amt, usersPaid, usersSplit);

        let split = 0,
            paid = 0,
            e;
        usersPaid.forEach(u => {
            paid += parseFloat(u.val);
        });
        usersSplit.forEach(u => {
            split += parseFloat(u.val);
        });

        console.log(paid, split);
        if (split !== paid) {
            setErr('Distribution is not accurate. Please distribute the expenses again');
            // add an animation effect to highlight the options icon
            return;
        }

        console.log('from saveExpense method ', expense);

        const newExpense = {
            ...expense,
            usersPaid,
            usersSplit,
            relUserId,
            netBal,
            cashFlowArr,
            cur,
            grpId: route.params._id,
            amt: parseFloat(amt),
            uid: auth().currentUser.uid
        };

        console.log(newExpense);

        e = await addExpense(newExpense);
        setLoading(false);

        if (e?.error) {
            console.log(e);
            setErr(e.msg);
            return;
        }

        navigation.goBack();
    };

    const delExpense = () => {
        const deleteConfirm = async () => {
            const e = await deleteExpense(route.params._id, route.params.expId, auth().currentUser.uid);

            if (e?.error) {
                console.log(e);
                setErr(e.msg);
                return;
            }

            navigation.goBack();
        };

        Alert.alert('', `Are you sure you want to delete this expense?`, [
            {
                text: 'Cancel',
                onPress: () => null
            },
            { text: 'Yes', onPress: deleteConfirm }
        ]);
    };

    useEffect(() => {
        getGroupDetails(route.params._id).then(g => {
            setGroup(g);
        });
    }, []);

    useEffect(() => {
        mode === 'edit' && getExpenseDetails(route.params._id, route.params.expId);
    }, [group]);

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={Layout.pageHeader}>
                    <MyText text={mode === 'add' ? 'Add New Expense' : 'Edit expense'} style={styles.head} title />
                    {mode === 'edit' && (
                        <TouchableOpacity onPress={delExpense}>
                            <Icon name="trash" color={Utility.Colors[themeColor].med} size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.viewSection}>
                    <MyText text="Title" opacity="low" bodySubTitle />
                    <MyTextInput
                        style={Textfield.field}
                        clearButtonMode="while-editing"
                        placeholder="Add title here"
                        value={expense.title}
                        onChangeText={e => handleChange(e, 'title')}
                        autoFocus
                    />
                </View>
                <View style={styles.viewSection}>
                    <MyText text="Description" opacity="low" bodySubTitle />
                    <MyTextInput
                        style={Textfield.field}
                        clearButtonMode="while-editing"
                        placeholder="Add description here"
                        value={expense.desc}
                        onChangeText={e => handleChange(e, 'desc')}
                    />
                </View>
                {mode === 'add' && (
                    <View style={[Misc.rows.container, styles.viewSection, { paddingVertical: 0 }]}>
                        <View style={Misc.rows.itemLeftGrow}>
                            <MyTextInput
                                style={Textfield.bigField}
                                clearButtonMode="while-editing"
                                keyboardType="phone-pad"
                                placeholder="0.00"
                                value={expense.amt}
                                onChangeText={e => handleChange(e, 'amt')}
                            />
                        </View>
                        <TouchableOpacity onPress={expDistribute}>
                            <View style={[styles.optionBtn, { backgroundColor: Utility.Colors[themeColor].high }]}>
                                <Icon
                                    name="options"
                                    color={Utility.Colors[theme].high}
                                    size={35}
                                    // style={{ paddingRight: 1 }}
                                />
                            </View>
                        </TouchableOpacity>
                        {/*</View>*/}
                    </View>
                )}
                <Pressable style={styles.viewSection} onPress={() => setDate(date => ({ ...date, show: true }))}>
                    <MyText text="Set date" opacity="low" bodySubTitle />
                    <View style={styles.date}>
                        <MyText text={readableDate[2]} style={[Textfield.field, styles.dateElements]} />
                        <MyText text="-" style={[Textfield.field, styles.dateElements]} />
                        <MyText text={readableDate[1]} style={[Textfield.field, styles.dateElements]} />
                        <MyText text="-" style={[Textfield.field, styles.dateElements]} />
                        <MyText text={readableDate[0]} style={[Textfield.field, styles.dateElements]} />
                    </View>
                    {date.show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date.date}
                            mode="date"
                            is24Hour={true}
                            display="spinner"
                            onChange={onDateChange}
                        />
                    )}
                </Pressable>
                {mode === 'edit' && expense.bal && (
                    <View>
                        {expense.bal.map(item => (
                            <View key={item._id} style={[styles.balanceCard]}>
                                <Pressable
                                    style={[Misc.rows.container, { paddingVertical: 0 }]}
                                    // onPress={() => setCollapse(collapse => !collapse)}
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
                                    </View>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

                <View style={[Button.bottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                    {err && <MyText text={err} error />}
                    <PrimaryBtn title="Save" onPress={mode === 'edit' ? null : saveExpense} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    viewSection: {
        marginBottom: 30
    },
    date: {
        flexDirection: 'row',
        paddingTop: 10
    },
    dateElements: {
        marginRight: 5,
        flexGrow: 0
    },
    optionBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 30
    },
    balanceCard: {
        marginVertical: 15
        // paddingVertical: 20,
        // paddingLeft: 0,
        // paddingRight: 5
        // borderLeftWidth: 4,
        // borderColor: '#e9e9e9',
    }
});
