import { firebase as fb } from '@react-native-firebase/functions';
import { firebase, database } from './config';
import { setItemLocal, removeItemLocal } from './localStorage';

/**
 *  Method to update each user's unique friends locally and return the object of subsequent updates in firebase
 *
 *  @param {string} ownerId - The user id of the group owner
 *  @param {array} users - The array of all group member ids (make sure to include the ownerId too)
 *  @param {array} removeUsers - The array of obsolete ids that need to be removed from user's friend list
 *  @returns {object} Object of subsequent updates
 */

export const getFriendsData = async (ownerId, users, removeUsers = []) => {
    // removeItemLocal('userFriends');
    let n = users.length,
        fData = [],
        fUpdates = {};
    let i = n,
        f,
        fErr;

    while (n--) {
        let j = users[n];

        fErr = await database
            .ref(`/users/${j}`)
            .once('value')
            .then(snap => {
                snap = snap.val();

                // console.log('tt', snap.friends);
                fData.push({
                    _id: j,
                    type: snap.type,
                    name: snap.name,
                    photoURL: snap.photoURL,
                    email: snap.email,
                    contact: snap.contact,
                    friends: JSON.parse(snap.friends || '[]')
                });
            })
            .catch(e => ({ error: true }));
    }

    if (fErr) return { fUpdates: {}, fErr };

    // console.log('fdata ', fData);
    while (i--) {
        let j = users[i],
            k;
        fData.forEach((d, idx) => {
            if (d._id === j) k = idx;
        });

        // remove obsolete userIds
        if (j === ownerId && removeUsers.length > 0) {
            fData[k].friends.forEach((m, i) => {
                if (removeUsers.indexOf(m) !== -1) {
                    console.log('removed friend-', m);
                    fData[k].friends.splice(i, 1);
                }
            });
        }
        // console.log('crt user ', j);
        // console.log('k user friends', fData[k].friends);
        f = fData.filter((member, idx) => member._id !== j && fData[k].friends?.indexOf(member._id) === -1);
        // console.log('unique fraands', f);

        if (f.length > 0) {
            let originalFriends = fData.filter(m => fData[k].friends.indexOf(m._id) !== -1);
            f = [...originalFriends, ...f];

            // console.log('merged fraands', f);

            // f.forEach(v => delete v.friends);

            fUpdates[`/users/${j}/friends`] = f;
        }
    }

    console.log('before additional loop ', fUpdates);

    for (let update in fUpdates) {
        let fr = fUpdates[update];

        if (update.includes(ownerId)) {
            fr.forEach(v => delete v.friends);
            setItemLocal({
                key: 'userFriends',
                value: fr
            });
        }

        const idArr = fr.map(u => u._id);
        idArr = JSON.stringify(idArr);
        fUpdates[update] = idArr;
    }

    console.log('are now friends deleted? ', fUpdates);

    return { fUpdates, fErr };
};

/**
 *  Method to sync the user's friend list locally from the firebase
 *
 *  @param {string} userId - The user id of the current user
 *  @returns
 */

export const syncFriendsLocal = userId => {
    console.log('in misc');

    let fData = [];

    database
        .ref(`/users/${userId}/friends`)
        .once('value')
        .then(async f => {
            f = JSON.parse(f.val());
            console.log(f);
            if (f && f.length > 0) {
                let n = f.length;

                while (n--) {
                    const friend = f[n];

                    await database
                        .ref(`/users/${friend}`)
                        .once('value')
                        .then(u => {
                            if (u.exists()) {
                                u = u.val();
                                const { photoURL, name, contact, email } = u;

                                fData.push({
                                    photoURL,
                                    name,
                                    contact,
                                    email,
                                    _id: friend
                                });
                            }
                        })
                        .catch(e => null);
                }

                console.log('signin fdata ', fData);

                const item = {
                    key: 'userFriends',
                    value: fData
                };

                setItemLocal(item);
            }
        });
};

/**
 *  Method to find minimum of 2 numbers
 *
 *  @param {number} x - Number 1
 *  @param {number} y - Number 2
 *  @returns {number}
 */

function minOf2(x, y) {
    return x < y ? x : y;
}

/**
 *  Method that calculates the balance object for a transaction
 *
 *  @param {number} bal - The initial balance object
 *  @param {array} cfa - The exisiting cashFlowArr array
 *  @returns {void}
 */

const finalBal = (bal, cfa) => {
    let mxCredit = cfa.indexOf(Math.max(...cfa)),
        mxDebit = cfa.indexOf(Math.min(...cfa));

    if (cfa[mxCredit] == 0 && cfa[mxDebit] == 0) {
        console.log('settled!');
        console.log(bal);
        return;
    }

    let min = parseFloat(minOf2(-cfa[mxDebit], cfa[mxCredit]).toFixed(2));

    cfa[mxCredit] -= min;
    cfa[mxDebit] += min;

    cfa[mxCredit] = parseFloat(cfa[mxCredit].toFixed(2));
    cfa[mxDebit] = parseFloat(cfa[mxDebit].toFixed(2));

    console.log('Person', mxDebit, 'pays', min, ' to Person ', mxCredit);

    bal[mxDebit] ? null : (bal[mxDebit] = {});
    bal[mxDebit][mxCredit] = min;

    finalBal(bal, cfa);
};

/**
 *  Method that calculates the final cashFlowArr after the expense
 *
 *  @param {object} tx - The transaction object
 *  @param {array} cfa - The exisiting cashFlowArr array
 *  @returns {object} - The updated cashFlowArr, updated group balance object and expense balance object
 */

export const calcNewExpense = (tx, cfa) => {
    let expenseArr = Array(cfa.length).fill(0);

    cfa.forEach((val, idx) => {
        if (tx.between[idx]) {
            cfa[idx] -= parseFloat(tx.between[idx].toFixed(2));
            expenseArr[idx] -= parseFloat(tx.between[idx].toFixed(2));
        }

        if (tx.paid_by[idx]) {
            cfa[idx] += parseFloat(tx.paid_by[idx].toFixed(2));
            expenseArr[idx] += parseFloat(tx.paid_by[idx].toFixed(2));
        }
    });

    let newCashFlowArr = [...cfa];

    let grpBalance, indBalance;
    finalBal((grpBalance = {}), cfa);
    finalBal((indBalance = {}), expenseArr);

    newCashFlowArr = newCashFlowArr.map(item => {
        return parseFloat(item.toFixed(2));
    });

    console.log('from addTx- ', grpBalance); // Adjacency list
    return { newCashFlowArr, grpBalance, indBalance };
};

/**
 *  Method to calculate the distribution of expenses
 *
 *  @param {array} userArr - Array of users as returned from getUsers function
 *  @param {object} balancesJSON - JSON object of balances as stored in balance property of a group
 *  @param {array} relUserId - Array of relative user IDs
 *  @param {array} cashFlowArr - Array as stored in the cashFlowArr property of a group
 *  @param {string} currency - The currency of the group
 *  @param {string} uid - Current user uid
 *  @returns {array} - The updated user array
 */

export const calcBalanceDist = (userArr, balancesJSON, relUserId, cashFlowArr, currency, uid) => {
    // let balSummary = [], balances = {};
    // console.log('kk', arguments);

    let userArray = [...userArr];

    // constructing the expense cashFlowArr
    if (!cashFlowArr) {
        
        // Calculating array length
        let max = 0;
        for(let r in relUserId) {
            if(relUserId[r] > max) {
                max = relUserId[r];
            }
        }
        let expCashFlowArr = Array(max+1).fill(0);

        for (let payee in balancesJSON) {
            for (let p in balancesJSON[payee]) { console.log(parseFloat(balancesJSON[payee][p]))
                expCashFlowArr[payee] -= parseFloat(balancesJSON[payee][p]);
                expCashFlowArr[p] += parseFloat(balancesJSON[payee][p]);
                console.log('tt', expCashFlowArr)
            }
        }
        cashFlowArr = expCashFlowArr;
    }
    userArray = userArray.map(item => ({ ...item, balSummary: [] }));

    userArray = userArray.map((item, idx) => {
        const myBal = cashFlowArr[relUserId[item._id]];console.log(myBal, item._id)

        item.bal = {};
        item.bal.figure = myBal ? (myBal > 0 ? myBal : -myBal) : 0;
        item.bal.color = item.bal.figure == 0 ? null : myBal > 0 ? { green: true } : { red: true };
        // item.balSummary = [];

        if (!myBal || myBal === 0) {
            console.log('settled up!');
            item.bal.title = uid !== item._id ? `${item.name.split(' ')[0]} is settled up!` : `I am settled up!`;
        } else if (myBal > 0) {
            console.log(`owed ${item.bal.figure}`);
            item.bal.title =
                uid !== item._id
                    ? `${item.name.split(' ')[0]} is owed ${item.bal.figure}`
                    : `I am owed ${item.bal.figure}`;
        } else {
            item.bal.title =
                uid !== item._id ? `${item.name.split(' ')[0]} owes ${item.bal.figure}` : `I owe ${item.bal.figure}`;
            console.log('ab', item.bal.title);

            // for (let b in balances2) {
            // balances2[relUserId[item._id]].forEach(obj => {
            let user = balancesJSON[relUserId[item._id]];
            for (let obj in user) {
                // for (let o in user[obj]) {
                let name, _id;

                for (let u in relUserId) {
                    if (relUserId[u] == obj) {
                        let i = userArray.length;
                        while (i--) {
                            if (userArray[i]._id === u) {
                                name = userArray[i].name;
                                _id = userArray[i]._id;
                                userArray[i].balSummary.push({
                                    currency,
                                    msg:
                                        uid !== item._id
                                            ? `${name} gets back ${currency}${user[obj]} from ${item.name}`
                                            : `${name} gets back ${currency}${user[obj]} from me`,
                                    payee: {
                                        name: item.name,
                                        relId: relUserId[item._id]
                                    },
                                    receivor: {
                                        name,
                                        relId: relUserId[_id]
                                    },
                                    amt: user[obj]
                                });
                                break;
                            }
                        }
                        break;
                    }
                }
                console.log(`owes ${user[obj]} to ${name}`);
                item.balSummary.push({
                    currency,
                    msg:
                        uid !== item._id
                            ? `${item.name} owes ${currency}${user[obj]} to ${name}`
                            : `I owe ${currency}${user[obj]} to ${name}`,
                    payee: {
                        name: item.name,
                        relId: relUserId[item._id]
                    },
                    receivor: {
                        name,
                        relId: relUserId[_id]
                    },
                    amt: user[obj]
                });
                // }
            }
            // }
        }

        return item;
    });
    return userArray;
};

/**
 *  Method to return various profile field values checks
 *
 *  @returns {object} - Test methods for each user profile field
 */

export const profileChecks = () => {
    const userNameCheck = name => {
        name = name.trim();
        if (!name) return { error: true, msg: 'Name is empty', e: 'User name field is null' };

        /**
         * String length should be between 3 and 50 (inclusive)
         * String should only contain uppercase alphabets, lowercase alphabets and spaces
         */

        const match = name.match(/^[a-zA-Z\x20]{3,50}$/);
        if (!match) return { error: true, msg: 'Name format is invalid', e: 'User name field format is invalid' };
    };

    const userEmailCheck = email => {
        email = email.trim();
        if (!email) return { error: true, msg: 'Email is empty', e: 'User email field is null' };

        /**
         * String should be in valid email format
         */

        const match = email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
        if (!match) return { error: true, msg: 'Email format is invalid', e: 'User email field format is invalid' };
    };

    const userCountryCheck = country => {};

    return { userNameCheck, userEmailCheck, userCountryCheck };
};

export const groupChecks = () => {
    const grpNameCheck = name => {
        name = name.trim();
        if (!name) return { error: true, msg: 'Name is empty', e: 'User name field is null' };

        /**
         * String length should be between 1 and 50 (inclusive)
         * String should only contain uppercase alphabets, lowercase alphabets, numbers, underscore, hyphen, decimal and spaces
         */

        const match = name.match(/^[a-zA-Z0-9\x20]{1,50}$/);
        if (!match) return { error: true, msg: 'Name format is invalid', e: 'Group name field format is invalid' };
    };

    const grpDescCheck = desc => {
        desc = desc.trim();
        if (!desc) desc = null;

        /**
         * String length should be between 0 and 80 (inclusive)
         * String should only contain uppercase alphabets, lowercase alphabets, numbers, underscore, hyphen, decimal and spaces
         */

        const match = desc.match(/^[a-zA-Z0-9\x20]{0,80}$/);
        if (desc && !match) return { error: true, msg: 'Description format is invalid', e: 'Group description field format is invalid' };
    };

    return { grpNameCheck, grpDescCheck };
}

/**
 *  Method to sanitize a JSON object
 *
 *  @param {(object|void)} o - Array or object to be sanitized
 *  @returns {(object|void)} - The updated array or object
 */

export const sanitizeObject = o => {
    // console.log(Array.isArray(o));
    const isArr = Array.isArray(o);
    console.log(isArr);
    let _o = isArr ? [...o] : { ...o };

    if (isArr) {
        _o = _o.map(e => parseFloat(e.toFixed(2)));
    } else {
        for (let i in _o) {
            let u = _o[i];
            for (let j in u) {
                console.log(u[j]);

                if (u[j] != 0) {
                    u[j] = parseFloat(u[j].toFixed(2));
                } else {
                    delete u[j];
                }
            }
            if (!Object.keys(u).length) {
                delete _o[i];
                break;
            }
        }
    }
    return _o;
};

export const addNullTx = cashFlowArr => {
    const nullTx = {
        sum: 0,
        paid_by: {},
        between: {}
    };

    return calcNewExpense(nullTx, cashFlowArr);
};

export const testF = async () => {
    // let updates = {};
    // updates[`/users/tnuPW76MBecpTa6BkQizB4881XJ3/lastActive`] = firebase.database.ServerValue.increment(2);
    // const a = await database
    //     .ref()
    //     .update(updates);
    // console.log('as', a);
    fb.functions().useEmulator('10.0.2.2', 5001);
    const {data} = await fb.functions().httpsCallable('groups-getGrp');
    console.log('bb', data);
};


