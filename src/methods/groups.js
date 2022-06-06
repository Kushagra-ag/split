import 'react-native-get-random-values';
import { nanoid } from 'nanoid';
import { database } from './config';
import { calcNewExpense } from './expenses';
import { checkNewGuestUser, getUsers } from './user';
import { getFriendsData } from './misc';
import { getItemLocal } from './localStorage';

/**
 *	Method to create a new group and add in firebase - Tasks performed - create group in firebase, check default group collision, update groups and friends attribute of each user
 *
 *	@param {string} name - The group name
 *  @param {string} ownerId - The user id of the group owner
 *  @param {array} users - The array of all group member ids (make sure to include the ownerId too)
 *  @param {object} defaults - The default configuration of splitting of expenses among grp members
 *  @param {boolean} defaultGrp - Whether to mark this grp as default grp
 *  @param {string} status - Enum('active', 'pending_deletion')
 *  @param {number} noOfExp - No of expenses
 *	@returns {(Object | void)}
 */

const createGroup = async (
    name,
    ownerId,
    users = [],
    newUsersData = [],
    defaults = null,
    defaultGrp = false,
    status = 'active',
    noOfExp = 0,
    netBal = 0
) => {
    if (!name || !ownerId) return { error: true, msg: 'Could not complete your request', e: 'Invalid parameters' };

    const n = users.length;
    let e = null;

    // if (!users) users = new Array();
    // if (!newUsersData) newUsersData = new Array();

    // Initializing an array of length n with zeroes
    const cashFlowArr = JSON.stringify(Array(n).fill(0));
    let relUserId = {};
    let members = {};
    // let stdUsers = new Array(), guestUsers = new Array();

    const grpId = nanoid();
    const ts = Date.now();
    const lastActive = ts;
    const { currencySymbol } = await getItemLocal('userGeo');

    // Check default grp collision
    defaultGrp && (e = await setDeafultGrp(ownerId, grpId));
    if (e?.error) return e;
    console.log('afetr collision check', defaultGrp);

    let groupConfig = {
        name,
        ownerId,
        status,
        // defaultConfig: defaults,
        noOfExp,
        netBal,
        ts,
        lastActive,
        cashFlowArr,
        cur: currencySymbol
    };

    let updates = {};
    updates[`/users/${ownerId}/owned_grps/${grpId}`] = true;

    // Update the user object with current grp and vice-versa
    let { u, updatedUsers, removeUserFriends, err } = await addUsersToGroup(users, newUsersData, grpId);
    console.log('updated users', updatedUsers);
    console.log('remove users', removeUserFriends);
    if (err?.error) return err;

    //Generate rel user id and members object
    updatedUsers.forEach((_, i) => {
        updates[`/groups/${grpId}/relUserId/${_}`] = i;
        updates[`/users/${_}/groups/${grpId}/relUserId`] = i;
        updates[`/users/${_}/groups/${grpId}/amtSpent`] = 0;
        // if(!defaults?._) {
        //     defaults[_] = parseFloat((100/n).toFixed(2));
        // }
    });

    // Update the friends attribute
    let { fUpdates, fErr } = await getFriendsData(ownerId, updatedUsers, removeUserFriends);
    // if (fErr?.error) return fErr;

    const finalUpdates = { ...updates, ...u, ...fUpdates };

    // Creating the group
    e = await database
        .ref(`/groups/${grpId}`)
        .set(groupConfig)
        .then()
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    if (e?.error) return e;

    console.log('before sec call- ', finalUpdates);
    e = await database
        .ref()
        .update(finalUpdates)
        .then(() => console.log('sec call complete'))
        .catch(e => {
            console.log('errr', e);
            return { error: true, msg: 'Please check your internet connection', e };
        });

    if (e?.error) return e;

    return {
        _id: grpId
    };
};

/**
 *	Method to add new guest users, existing users to group and vice-versa in firebase
 *
 *	@param {array} users - The array of all user ids to be added to the group
 *  @param {string} grpId - The group id
 *	@returns {object} An object containing the updated user ids list and calculated updates
 */

const addUsersToGroup = async (users, newUsersData, grpId) => {
    if (!users || !grpId) return { error: true, msg: 'Could not complete your request', e: 'Invalid parameters' };

    let u = {},
        updatedUsers = [...users],
        removeUserFriends = [],
        n = users.length,
        k,
        err,
        newUser;
    const newUsers = newUsersData.map(m => m._id);
    // console.log(newUsers)
    console.log('newUsersData', newUsersData);
    while (n--) {
        newUser = null;
        let userId = users[n];
        if (newUsers.indexOf(userId) !== -1) {
            newUsersData.forEach((v, idx) => {
                if (v._id === userId) k = idx;
            });
            console.log('contact detected', userId, newUsersData[k]);

            !newUsersData[k].flag &&
                (newUser = await checkNewGuestUser({
                    name: newUsersData[k].name,
                    contact: newUsersData[k].contact,
                    email: newUsersData[k].email
                }));
            console.log('nn', newUser);

            const finalUser = newUser || newUsersData[k];
            const _id = finalUser._id;
            delete finalUser._id;

            if (finalUser.type === 'friend') removeUserFriends.push(newUsersData[k]._id);

            finalUser.newUser &&
                (err = await database
                    .ref(`/users/${_id}`)
                    .update({
                        friends: '[]',
                        ...finalUser,
                        newUser: null,
                        flag: null
                    })
                    .then(res => console.log('contact added!', res))
                    .catch(e => ({ error: true, msg: 'Please check your internet connection', e })));

            userId = _id;
            updatedUsers.splice(n, 1, _id);
        }
        console.log('userId--', userId);
        // u[`/users/${userId}/groups/${grpId}`] = true;
        u[`/groups/${grpId}/members/${userId}`] = true;
    }

    const res = { u, updatedUsers, removeUserFriends, err };
    return res;
};

/**
 *  Method to set or unset a default group for the user
 *
 *  @param {string} userId - The array of all user ids to be added to the group
 *  @param {string} grpId - The group id
 *  @param {boolean} setDefault - Flag indicating to set or unset a default group for the user
 *  @returns {(object | void)}
 */

const setDeafultGrp = async (userId, grpId, setDefault = true) => {
    if (!userId || !grpId) return { error: true, msg: 'Could not complete your request', e: 'Invalid parameters' };

    let u = await database
        .ref(`/users/${userId}/defaultGrp`)
        .once('value')
        .then(async snap => {
            if(setDefault || (!setDefault && snap.exists())) {
                snap = snap.val();

                let updates = {};
                updates[`/users/${userId}/defaultGrp`] = setDefault ? grpId : null;
                updates[`/groups/${grpId}/defaultGrp/${userId}`] = setDefault ? true : null;
                snap && (updates[`/groups/${snap}/defaultGrp/${userId}`] = null);

                let r = await database
                    .ref()
                    .update(updates)
                    .then(() => console.log('hohoho'))
                    .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));
                return r;
            }
            return {error: true, msg: 'No default group set!', e: 'No default group set!'};
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return u;
};

/**
 *  Method to fetch group details of a particular group
 *
 *  @param {string} grpId - The group id
 *  @returns {(object | void)}
 */

const getGroupDetails = async grpId => {
    if (!grpId) return { error: true, msg: 'Could not complete your request', e: 'Invalid parameters' };

    const group = await database
        .ref(`/groups/${grpId}`)
        .once('value')
        .then(grp => {
            if (grp.exists()) {
                // console.log('grrp', grp);
                return grp.val();
            }
            return { error: true, msg: "The group doesn't exist", e: `The group ${grpId} doesn't exist` };
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return group;
};

/**
 *  Method to update details of a group in firebase
 *
 *  @param {string} grpId - id of the group to be updated
 *  @param {object} newGroup - Object containing updated details of the user
 *  @param {array} updateFields - The fields that actually need to be updated
 *  @returns {(object|undefined)}
 */

 const updateGroupDetails = async (grpId, newGroup, updateFields) => {
    if (!grpId || !newGroup) return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

 }

/**
 *  Method to add users in a particular group in firebase, also performs duplicate check
 *
 *  @param {array} users - User ids of users to be added to the group
 *  @param {string} uId - The user's uid
 *  @param {object} newUsersData - Basic info of new (non-existing) users, if any
 *  @param {string} grpId - The group id
 *  @returns {(object | void)}
 */

const addGroupMembers = async (users, uId, newUsersData, grpId) => {
    if (!users || !uId || !grpId)
        return { error: true, msg: 'Could not complete your request', e: 'Invalid parameters' };

    let n = users.length;

    if (n === 0) return { error: true, msg: 'No users detected', e: 'Users array empty' };

    console.log('in addmembers - methods/groups.js');
    const e = await database
        .ref(`/groups/${grpId}`)
        .once('value')
        .then(async snap => {
            if (snap.exists()) {
                snap = snap.val();
                const relUserId = snap.relUserId,
                    existingMembersId = Object.keys(relUserId);

                let cashFlowArr = JSON.parse(snap.cashFlowArr),
                    i = cashFlowArr.length,
                    updates = {};

                let { u, updatedUsers, removeUserFriends, err } = await addUsersToGroup(users, newUsersData, grpId);
                console.log('uuu', updatedUsers);
                if (err) return err;

                while (n--) {
                    let userId = updatedUsers[n];

                    // duplicate member check
                    if (existingMembersId.indexOf(userId) !== -1) {
                        console.log('duplicate detected', userId);
                        continue;
                    }

                    updates[`/groups/${grpId}/relUserId/${userId}`] = i;
                    // updates[`/groups/${grpId}/members/${userId}`] = true;
                    updates[`/users/${userId}/groups/${grpId}/relUserId`] = i;
                    i = i + 1;

                    // update the friend list
                    let { fUpdates, fErr } = await getFriendsData(
                        userId,
                        Array.from(new Set([uId, ...updatedUsers, ...existingMembersId])),
                        removeUserFriends
                    );
                    console.log('from friend func - ', fUpdates, fErr);
                    updates = { ...updates, ...u, ...fUpdates };
                    // console.log(updates);
                }
                console.log('af loop', i, cashFlowArr.length);
                // No user was added
                if (cashFlowArr.length === i) return;

                cashFlowArr.push(...Array(i - cashFlowArr.length).fill(0));

                updates[`/groups/${grpId}/cashFlowArr`] = JSON.stringify(cashFlowArr);
                updates[`/groups/${grpId}/lastActive`] = Date.now();

                console.log('aaaaaaaaaaaaaaa', updates);

                let res = await database
                    .ref()
                    .update(updates)
                    .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

                return res;
            }

            return { error: true, msg: 'Please check your internet connection', e: `The group ${grpId} doesn't exist` };
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    if (e?.error) return e;
};

/**
 *  Method to remove user from a particular group in firebase
 *
 *  @param {string} userId - The user's uid
 *  @param {string} grpId - The group id
 *  @returns {(object | void)}
 */

const removeGroupMember = async (userId, grpId) => {
    if (!userId || !grpId) return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

    const e = await database
        .ref(`/groups/${grpId}`)
        .once('value')
        .then(async snap => {
            if (snap.exists()) {
                snap = snap.val();
                const relIdUser = snap.relUserId[userId],
                    cashFlowArr = JSON.parse(snap.cashFlowArr);

                if (cashFlowArr[relIdUser] != 0) return { error: true, msg: 'The user is not settled up' };

                // cashFlowArr.splice(relIdUser, 1);

                // for(let o in snap.relUserId) {
                //     if(snap.relUserId[o] > relIdUser) {
                //         snap.relUserId[o] -= 1;
                //     }
                // }

                let updates = {};

                updates[`/groups/${grpId}/relUserId/${userId}`] = null;
                updates[`/groups/${grpId}/defaultGrp/${userId}`] = null;
                // updates[`/groups/${grpId}/cashFlowArr`] = JSON.stringify(cashFlowArr);
                updates[`/groups/${grpId}/members/${userId}`] = null;
                updates[`/users/${userId}/groups/${grpId}`] = null;
                updates[`/users/${userId}/defaultGrp/${grpId}`] = null;

                // updates[`/groups/${grpId}/lastActive`] = Date.now();
                console.log(updates);

                const r = await database
                    .ref()
                    .update(updates)
                    .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

                if (r?.error) return r;
            } else return { error: true, msg: 'Some unexpected error occured', e: `The group ${grpId} doesn't exist` };
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return e;
};

const joinGroupInfo = async grpId => {
    if (!grpId) return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

    const grp = await getGroupDetails(grpId);
    if (grp?.error) {
        return grp;
    }
    let users = await getUsers(Object.keys(grp.members));
    if (users?.error) {
        return users;
    }
    console.log('before cmn friends loop', users);
    const userIds = users.filter(u => u._id);

    // calculating common friends
    const userFriends = await getItemLocal('userFriends');
    if (userFriends && userFriends.length > 0) {
        const userFriendsIds = userFriends.filter(u => u._id);
        userIds.forEach((u, idx) => {
            const k = userFriendsIds.indexOf(u);
            if (k !== -1) {
                users.splice(idx, 1);
                users = [userFriends[k], ...users];
            }
        });
    }

    console.log('after cmn friends loop', users);

    return { groupInfo: grp, users };
};

const deleteGroup = async grpId => {
    if (!grpId)
        return { error: true, msg: 'Could not complete your request', e: 'Invalid parameters' };
    
    const e = await database
        .ref(`/groups/${grpId}`)
        .once('value')
        .then(async snap => {
            if(snap.exists()) {
                snap = snap.val();
                let users = Object.keys(snap.members), updates = {};
                const defaultUsers = snap.defaultGrp ? Object.keys(snap.defaultGrp) : [];

                // removing the group from all relevant user objects
                users.forEach(async userId => {
                    updates[`/users/${userId}/groups/${grpId}`] = null;

                    if(defaultUsers.indexOf(userId) !== -1) {
                        updates[`/users/${userId}/defaultGrp`] = null;
                    }
                });

                // removing the group object itself
                updates[`/groups/${grpId}`] = null;

                const e = await database
                    .ref()
                    .update(updates)
                    .then(() => console.log('hohoho'))
                    .catch(e => ({ error: true, msg: 'Please check your internet connection', e }))
                
                return e
            } 
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));
    
        return e
}

export {
    createGroup,
    addUsersToGroup,
    setDeafultGrp,
    getGroupDetails,
    updateGroupDetails,
    addGroupMembers,
    removeGroupMember,
    deleteGroup,
    joinGroupInfo
};
