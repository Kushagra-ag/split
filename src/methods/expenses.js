import 'react-native-get-random-values';
import { nanoid } from 'nanoid';
import { database, firebase } from './config';
import { calcNewExpense, sanitizeObject, addNullTx } from './misc';

/**
 *  Method to get details of a particular expense
 *
 *  @param {string} grpId - The group id for the expense
 *  @param {string} expId - The expense Id
 *  @returns {object | void}
 */

export const getExpense = async (grpId, expId) => {
    const res = await database
        .ref(`/expenses/${grpId}/${expId}`)
        .once('value')
        .then(snap => {
            if (snap.exists()) {
                let e = snap.val();
                e._id = snap.key;
                return e;
            }

            return {
                error: true,
                msg: 'Please check your internet connection',
                e: `The expense ${expId} does not exist`
            };
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return res;
};

/**
 *  Method to get expense details of a group
 *
 *  @param {string} grpId - The group id for the expense
 *  @param {number} startAt - Timestamp of the first expense
 *  @returns {object | void}
 */

export const getExpenses = async (grpId, endAt) => {
    //Uncomment below line if using 'on'
    // const detachExpenseListener = () => database.ref(`/expenses/${grpId}`).off('value', res);
    const endDate = endAt ? endAt - 1 : new Date(8640000000000000).getTime();

    const res = await database
        .ref(`/expenses/${grpId}`)
        .orderByChild('ts')
        .startAt(0)
        .endAt(endDate)
        .limitToLast(8)
        .once('value')
        .then(snap => {
            // snap = snap.val();
            console.log('rfom getExpenses', snap.val());
            let orderedExp = [];

            if (snap.exists()) {
                snap.forEach(expense => {
                    let e = expense.val();
                    e._id = expense.key;
                    orderedExp.push(e);
                });
                orderedExp = orderedExp.reverse();
            }

            // const r = {
            //     orderedExp: orderedExp.reverse(),
            //     detachExpenseListener
            // };

            return orderedExp;
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return res;
};

/**
 *  Method to add new expense to firebase
 *
 *  @param {string} date - The timestamp of the expense
 *  @param {string} grpId - The group id for the expense
 *  @param {number} amt - The expense amount
 *  @param {string} title - The expense title
 *  @param {string} desc - The expense description
 *  @param {array} cashFlowArr - The cashFlowArr array for the expense
 *  @param {object} relUserId - The relUserId object for the expense
 *  @param {object} usersPaid - The object containing people who paid for the expense
 *  @param {object} usersSplit - The object containing people among whom the expense would be split
 *  @param {string} type - Enum('standard', 'recurring')
 *  @param {string} uid - Current user uid
 *  @returns {(object | void)}
 *  donee
 */

export const addExpense = async ({
    date = Date.now(),
    grpId,
    amt,
    cashFlowArr,
    relUserId,
    title,
    usersPaid,
    usersSplit,
    desc = '',
    type = 'standard',
    uid
}) => {
    cashFlowArr = JSON.parse(cashFlowArr);
    let paidBy = {},
        splitBet = {},
        distFlowArr = Array(cashFlowArr.length).fill(0),
        e;

    console.log('aa', cashFlowArr, cashFlowArr.length, distFlowArr);

    usersPaid.forEach(u => {
        console.log('df', relUserId[u._id], -parseFloat(u.val));
        paidBy[relUserId[u._id]] = parseFloat(u.val);
        distFlowArr[relUserId[u._id]] = -parseFloat(u.val);
    });

    usersSplit.forEach(u => {
        console.log('fd', relUserId[u._id], u.val);
        splitBet[relUserId[u._id]] = parseFloat(u.val);
        !distFlowArr[relUserId[u._id]] && (distFlowArr[relUserId[u._id]] = parseFloat(u.val));
    });

    console.log(paidBy, splitBet, distFlowArr);

    let exp = {
        sum: amt,
        paid_by: paidBy,
        between: splitBet
    };

    let involved = Array.from(new Set([...Object.keys(paidBy), ...Object.keys(splitBet)]));
    console.log('involved ppl - ', involved);

    const groupParams = calcNewExpense(exp, cashFlowArr);
    console.log('ab', groupParams);

    let members = {},
        arr = Object.keys(groupParams.indBalance);
    involved.forEach(person => {
        if (involved.indexOf(person) === -1) {
            return;
        }

        if (arr.indexOf(person) === -1) {
            members[person] = 'payee';
        } else {
            members[person] = 'receiver';
        }
    });

    console.log('involved ', members, date);
    const _id = nanoid();

    const newExpense = {
        ts: date,
        title,
        desc,
        type,
        amt,
        members,
        relUserId,
        distFlowArr: JSON.stringify(distFlowArr),
        bal: JSON.stringify(groupParams.indBalance)
    };

    let updates = {};
    updates[`/groups/${grpId}/cashFlowArr`] = JSON.stringify(groupParams.newCashFlowArr);
    updates[`/groups/${grpId}/balances`] = JSON.stringify(groupParams.grpBalance);
    updates[`/groups/${grpId}/netBal`] = firebase.database.ServerValue.increment(amt);
    updates[`/groups/${grpId}/lastActive`] = Date.now();
    updates[`/users/${uid}/lastActive`] = Date.now();
    updates[`/expenses/${grpId}/${_id}`] = newExpense;

    usersPaid.forEach(p => {
        updates[`/users/${p._id}/groups/${grpId}/amtSpent`] = firebase.database.ServerValue.increment(
            parseFloat(p.val)
        );
    });

    console.log('upd', updates);

    e = await database
        .ref()
        .update(updates)
        .then(() => ({error: false, msg: 'Expense added'}))
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return e;
};

// not completed, added individual checks in the backend repo
export const editExpense = async ({ expId, grpId, expense }) => {
    const res = await database
        .ref(`/expenses/${grpId}/${expId}`)
        .update(expense)
        .then(() => ({error: false, msg: 'Expense added'}))
        .catch(() => ({ error: true, msg: 'Please check your internet connection', e }));
};

/**
 *  Method to delete expense
 *
 *  @param {string} grpId - The group id for the expense
 *  @param {string} expId - The expense Id
 *  @returns {(object | void)}
 *  donee
 */

export const deleteExpense = async (grpId, expId, uid) => {
    let grpBal,
        expBal,
        cashFlowArr,
        expAmt,
        relUserId,
        updates = {};

    const res = await database
        .ref(`/groups/${grpId}`)
        .once('value')
        .then(async snap => {
            snap = snap.val();
            grpBal = JSON.parse(snap.balances);
            cashFlowArr = JSON.parse(snap.cashFlowArr);
            relUserId = snap.relUserId;

            const expRes = await database
                .ref(`/expenses/${grpId}/${expId}`)
                .once('value')
                .then(async snap => {
                    console.log('ss', snap);
                    snap = snap.val();
                    const distFlowArr = JSON.parse(snap.distFlowArr);
                    expBal = JSON.parse(snap.bal);
                    expAmt = snap.amt;

                    for (let payee in expBal) {
                        for (let rec in expBal[payee]) {
                            console.log('rec- ', rec, ' payee- ', payee);

                            // Calculating updated amtSpent
                            // const _id = Object.keys(relUserId).find(id => relUserId[id] == rec);
                            // if (!amtSpentArr[`/users/${_id}/groups/${grpId}/amtSpent`]) amtSpentArr[`/users/${_id}/groups/${grpId}/amtSpent`] = 0;
                            // amtSpentArr[`/users/${_id}/groups/${grpId}/amtSpent`] -= expBal[payee][rec];
                            // console.log('amtSpentArr', amtSpentArr);

                            let amtPrev = grpBal[payee] && grpBal[payee][rec] ? grpBal[payee][rec] : 0,
                                amtNet;
                            console.log('amtPrev ', amtPrev);

                            amtNet = amtPrev - expBal[payee][rec];
                            console.log('amtNett ', amtNet);

                            grpBal[payee] = grpBal[payee] ? grpBal[payee] : {};
                            grpBal[payee][rec] = amtNet;

                            // let amtNet = amtPrev - expBal[rec][payee];
                            // console.log('amtNet ', amtNet);
                            // grpBal[payee][rec] = amtNet;

                            // Updating the cashflowarr array
                            cashFlowArr[payee] = parseFloat((cashFlowArr[payee] + expBal[payee][rec]).toFixed(2));
                            cashFlowArr[rec] = parseFloat((cashFlowArr[rec] - expBal[payee][rec]).toFixed(2));

                            if (amtNet == 0) {
                                console.log('deleted');
                                delete grpBal[payee][rec];
                            } else if (amtNet < 0) {
                                console.log('deleted!');
                                delete grpBal[payee][rec];

                                grpBal[rec] = grpBal[rec] ? grpBal[rec] : {};
                                grpBal[rec][payee] = -amtNet;
                            }
                        }
                    }

                    distFlowArr.forEach((amount, idx) => {
                        const _id = Object.keys(relUserId).find(id => relUserId[id] == idx);
                        if (amount < 0) {
                            updates[`/users/${_id}/groups/${grpId}/amtSpent`] =
                                firebase.database.ServerValue.increment(amount);
                        }
                    });

                    console.log('after del', grpBal, cashFlowArr, distFlowArr);

                    // A null tx to optimize the distribution further (if possible)
                    const groupParams = addNullTx(cashFlowArr);

                    updates[`/groups/${grpId}/cashFlowArr`] = JSON.stringify(groupParams.newCashFlowArr);
                    updates[`/groups/${grpId}/balances`] = JSON.stringify(groupParams.grpBalance);
                    updates[`/groups/${grpId}/netBal`] = firebase.database.ServerValue.increment(-expAmt);
                    updates[`/users/${uid}/groups/${grpId}/amtSpent`] = firebase.database.ServerValue.increment(
                        -expAmt
                    );
                    updates[`/groups/${grpId}/lastActive`] = Date.now();
                    updates[`/users/${uid}/lastActive`] = Date.now();
                    updates[`/expenses/${grpId}/${expId}`] = null;

                    // let netSum = 0;
                    // Object.keys(amtSpentArr).forEach(key => {
                    //     netSum += amtSpentArr[key];
                    //     updates[key] = firebase.database.ServerValue.increment(amtSpentArr[key]);
                    // });

                    // netSum = -netSum;

                    // if(netSum != expAmt) {
                    //     updates[`/users/${uid}/groups/${grpId}/amtSpent`] = firebase.database.ServerValue.increment((amtSpentArr[`/users/${uid}/groups/${grpId}/amtSpent`] || 0) - parseFloat((expAmt - netSum).toFixed(2)))
                    // }

                    console.log(updates);

                    const e = await database
                        .ref()
                        .update(updates)
                        .then(() => console.log('Updated!'))
                        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

                    return e;
                })
                .catch(e => {
                    console.log('err from deleteExpense inner ', e);
                    return { error: true, msg: 'Please check your internet connection', e };
                });

            return expRes;
        })
        .catch(e => {
            console.log('err from deleteExpense outer ', e);
            return { error: true, msg: 'Please check your internet connection', e };
        });

    if (res) {
        console.log('res', res);
        return res;
    }
};

/**
 *  Method to settle balances
 *
 *  @param {string} grpId - The group id for the expense
 *  @param {object} expense - The expense object
 *  @returns {(object | void)}
 */

export const settleBalance = async (grpId, expense) => {
    // update balance
    let e = await database
        .ref(`/groups/${grpId}`)
        .once('value')
        .then(async snap => {
            snap = snap.val();
            console.log('slk', snap);
            let grpBal = JSON.parse(snap.balances);
            let cashFlowArr = JSON.parse(snap.cashFlowArr);
            let amt = parseFloat(expense.amt);

            grpBal[expense.payee.relId][expense.receivor.relId] -= amt;
            cashFlowArr[expense.payee.relId] += amt;
            cashFlowArr[expense.receivor.relId] -= amt;

            console.log('cfa ', cashFlowArr, grpBal);

            cashFlowArr = sanitizeObject(cashFlowArr);
            grpBal = sanitizeObject(grpBal);
            console.log(cashFlowArr, grpBal);

            // update the grp object
            let e = await database
                .ref(`/groups/${grpId}`)
                .update({
                    cashFlowArr: JSON.stringify(cashFlowArr),
                    balances: JSON.stringify(grpBal)
                })
                .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

            if (e?.error) return e;
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    if (e?.error) return e;

    // create a new expense (type != standard")
    const _id = nanoid();
    const newExpense = {
        ts: Date.now(),
        type: 'settle',
        title: `${expense.payee.name.split(' ')[0]} paid ${expense.receivor.name.split(' ')[0]} ${expense.currency}${
            expense.amt
        }`,
        amt: expense.amt
        // members,
        // relUserId,
        // bal: JSON.stringify(groupParams.indBalance)
    };

    e = await database
        .ref(`/expenses/${grpId}/${_id}`)
        .update(newExpense)
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    if (e?.error) return e;
};
