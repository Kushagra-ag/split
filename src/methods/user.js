import { API_ENDPOINT } from '@env';
import 'react-native-get-random-values';
import { firebase } from '@react-native-firebase/database';
import * as RNLocalize from 'react-native-localize';
import { nanoid } from 'nanoid';
import { database } from './config';
import { profileChecks, syncFriendsLocal } from './misc';
import { getItemLocal, setItemLocal, removeItemLocal } from './localStorage';

/**
 *	Method to add/update user in firebase
 *
 *	@param {object} user - Current user as sent by Google sign-in method
 *	@param {function} setGeoInfo - Method to set geoInfo of the user in react context
 *  @returns {void|object}
 */

const userSignIn = async (user, setGeoInfo) => {
    if (!user || !setGeoInfo) return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

    user.email = user.email.toLowerCase();
    console.log('in userSignIn', user);
    // removeItemLocal('userFriends');

    let res,
        currencyCode = RNLocalize.getCurrencies(),
        countryCode = RNLocalize.getLocales();
    currencyCode = currencyCode[0] || 'INR';
    countryCode = countryCode[0].countryCode || 'IN';
    // console.log(Currency[currency]);

    try {
        res = await fetch(`${API_ENDPOINT}/users`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'getGeoInfo',
                countryCode,
                currencyCode
            })
        });
        res = await res.json();

        setItemLocal({
            key: 'userGeo',
            value: res
        });
        setGeoInfo(res);
    } catch (e) {
        setErr(e => ({ e, global: 'Something went wrong' }));
    }

    const userId = user.uid;
    let e,
        friends,
        userObj = {};

    e = await database
        .ref('/users')
        .orderByChild('email')
        .equalTo(user.email)
        .once('value')
        .then(async snap => {
            if (snap.exists()) {
                let existingUser = snap.val();
                const _id = Object.keys(existingUser)[0];
                existingUser = existingUser[_id];
                console.log(existingUser, existingUser.type, existingUser.type === 'guest');
                // guest user check
                if (existingUser.type === 'guest') {
                    const { guestTs, email, groups, contact, friends } = existingUser;
                    userObj = {
                        contact,
                        email,
                        groups,
                        friends,
                        guestTs
                    };

                    // delete existing User and changing user keys in existing groups

                    let updates = {},
                        oldGroups = existingUser.groups;
                    updates[`/users/${_id}`] = null;

                    Object.keys(groups).forEach(group => {
                        updates[`/groups/${group}/members/${_id}`] = null;
                        updates[`/groups/${group}/members/${user.uid}`] = true;
                        updates[`/groups/${group}/relUserId/${_id}`] = null;
                        updates[`/groups/${group}/relUserId/${user.uid}`] = oldGroups[group].relUserId;
                    });

                    console.log('key detected', _id, updates);
                    const e = await database
                        .ref()
                        .update(updates)
                        .catch({ error: true, msg: 'Please check your internet connection', e });

                    if (e?.error) return e;
                }

                userObj = {
                    ...userObj,
                    name: user.displayName,
                    type: 'standard',
                    country: countryCode,
                    photoURL: user.photoURL,
                    lastActive: Date.now(),
                    ts: Date.now()
                };
            } else {
                userObj = {
                    name: user.displayName,
                    type: 'standard',
                    email: user.email,
                    photoURL: user.photoURL,
                    contact: user.phoneNumber,
                    country: countryCode,
                    lastActive: Date.now(),
                    friends: [],
                    ts: Date.now()
                };
            }
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    if (e?.error) return e;

    e = await database
        .ref(`/users/${userId}`)
        .update(userObj)
        .then()
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return e;
};

/**
 *  Method to get details of users in firebase
 *
 *  @param {array} users - Array of userIDs
 *  @returns {array}
 * donee
 */

const getUsers = async (users = []) => {
    let n = users.length,
        userInfo = [];

    while (n--) {
        const userId = users[n];

        const e = await database
            .ref(`/users/${userId}`)
            .once('value')
            .then(snap => {
                // const { name, photoURL, groups } = snap.val();
                const user = {
                    _id: userId,
                    ...snap.val()
                };
                userInfo = [...userInfo, user];
            })
            .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

        if (e?.error) return e;
    }

    return userInfo;
};

/**
 *  Method to update details of users in firebase
 *
 *  @param {string} userId - uid of current user
 *  @param {object} newUser - Object containing updated details of the user
 *  @param {array} updateFields - The fields that actually need to be updated
 *  @returns {(object|undefined)}
 */

const updateUserProfile = async (userId, newUser, updateFields) => {
    if (!userId || !newUser) return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

    if (newUser.email) newUser.email = newUser.email.toLowerCase();

    const fieldTests = profileChecks();
    let n = updateFields.length,
        updatedUser = {};
    while (n--) {
        let result,
            field = updateFields[n];
        switch (field) {
            case 'name':
                result = fieldTests.userNameCheck(newUser[field]);
                break;
            case 'email':
                result = fieldTests.userEmailCheck(newUser[field]);
                break;
            case 'country':
                result = fieldTests.userCountryCheck(newUser[field]);
                break;
        }
        console.log('rr', result);
        if (result?.error) {
            return result;
        }
        updatedUser = { ...updatedUser, [field]: newUser[field] };
    }
    console.log('from user methods', updatedUser);
    const e = await database
        .ref(`/users/${userId}`)
        .update(updatedUser)
        .then(() => console.log('user updated'))
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return e;
};

/**
 *	Method to fetch user groups (sorted by lastActive) from firebase, returns empty array in case of no groups
 *
 *	@param {string} userId - Current userId
 *  @returns {array}
 */

const getUserGroups = async userId => {
    if (!userId) return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

    const e = await database
        .ref(`/users/${userId}/groups`)
        .once('value')
        .then(async snap => {
            if (snap.exists()) {
                // snap = snap.val();
                // Array of group ids
                let groups = snap._snapshot.childKeys,
                    data = [];
                let n = groups?.length;

                if (!n) return [];

                while (n--) {
                    let grp = groups[n];

                    let r = await database
                        .ref(`/groups/${grp}`)
                        .once('value')
                        .then(details => {
                            details = details.val();
                            details.cashFlowArr = JSON.parse(details.cashFlowArr);
                            details._id = grp;
                            data.push(details);
                        })
                        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

                    if (r?.error) return r;
                }
                // sort data in order of the last active field
                data.sort((a, b) => b.lastActive - a.lastActive);
                return data;
            }

            return [];
        })
        .catch(e => ({ error: true, msg: 'Please check your internet connection', e }));

    return e;
};

/**
 *  Method to fetch friends of matching user stored locally, returns empty array in case of no friends
 *
 *  @param {string} exp - The matching expression
 *  @return {array}
 *  No need to migrate
 */

const getUserFriends = async (exp = '') => {
    const friends = await getItemLocal('userFriends');
    console.log('aa', friends);

    if (!friends) return [];

    let matchArr = new Array();
    const regexp = new RegExp(`${exp}`, 'i');

    friends.forEach((friend, ind) => {
        let match = friend.name.match(regexp);

        if (match) {
            matchArr = [...matchArr, friends[ind]];
        }
    });

    // let data = new Array();

    // friends.forEach(item => {
    // matchArr.forEach(item => {
    //     let friend = {
    //         name: item.name,
    //         photo: item.photo,
    //         _id: item._id,
    //         email: item.email,
    //         phone: item.phone,
    //     };
    //     data.push(friend);
    // });
    // console.log('fraans', data)
    return matchArr;
};

const saveGuestMembers = members => {
    let updates = {};
    members.forEach(m => {
        let newMember = {
            name: m.name,
            email: m.email,
            contact: m.contact
        };
    });
};

/**
 *  Method to save custom user to firebase, checks if the user already exists as standard user, sends a guest user object if not
 *
 *  @param {string} contact - Contact of the custom user
 *  @param {string} name - Name of the custom user
 *  @return {object} Either the existing firebase user or the newly created guest user
 *  donee
 */

const checkNewGuestUser = async (passedUser, flag = false) => {
    if (!passedUser) return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

    const key = passedUser.email ? 'email' : 'contact';
    console.log('from checkNewGuestUser', key, passedUser);

    const u = await database
        .ref(`users`)
        .orderByChild(key)
        .equalTo(passedUser[key])
        .once('value')
        .then(async user => {
            user = user.val();
            console.log('resss', user);

            if (user) {
                const _id = Object.keys(user)[0];
                let existingUser = {
                    _id,
                    flag,
                    type: user[_id].type,
                    contact: user[_id].contact,
                    name: user[_id].name,
                    photoURL: user[_id].photoURL,
                    email: user[_id].email
                };
                return existingUser;
            }

            const userId = nanoid();
            const newUser = {
                flag,
                _id: userId,
                type: 'guest',
                contact: key === 'contact' ? passedUser.contact : null,
                email: key === 'email' ? passedUser.email : null,
                name: passedUser.name,
                guestTs: Date.now(),
                // photoURL: null,
                newUser: true
            };
            return newUser;
        })
        .catch(e => {
            console.log('errrr', e);
            return null;
        });

    return u;
};

/**
 *  Method to update the contact of current user, checks for existing user with same contact and if exists, merges the groups and friends of the previous user(if any)
 *
 *  @param {string} userId - ID of the user to be updated
 *  @param {string} contact - Contact of the custom user
 *  @param {function} success - Callback executed on successful execution of function
 *  @param {function} failure - Callback executed on unsuccessful execution of function
 *  @return {(object|void)}
 */

const updateUserContact = async (userId, contact, success, failure) => {
    if (!userId || !contact || !success || !failure)
        return { error: true, msg: 'Invalid parameters', e: 'Invalid parameters' };

    // check for existing guest users with same number
    let oldFriends,
        oldGroups,
        oldRelUserId,
        e,
        _id,
        updates = {};

    e = await database
        .ref(`/users`)
        .orderByChild('contact')
        .equalTo(contact)
        .once('value')
        .then(async existingUser => {
            console.log(existingUser);

            existingUser = existingUser.val();

            if (existingUser) {
                _id = Object.keys(existingUser)[0];
                existingUser = existingUser[_id];
                console.log(existingUser);
                // merge friends and groups

                let { friends, groups } = existingUser;
                friends = JSON.parse(friends);
                oldFriends = [...friends];
                oldGroups = { ...groups };

                // delete the old user
                let e = await database
                    .ref(`/users/${_id}`)
                    .remove()
                    .catch(e => {
                        failure();
                    });

                // if (e) return e;
            }

            database
                .ref(`/users/${userId}`)
                .once('value')
                .then(user => {
                    user = user.val();

                    if (oldFriends) {
                        const userFriends = JSON.parse(user.friends);
                        const updatedFriends = Array.from(new Set([...userFriends, ...oldFriends]));
                        updates[`/users/${userId}/friends`] = JSON.stringify(updatedFriends);
                    }

                    if (oldGroups) {
                        const updatedGroups = { ...user.groups, ...oldGroups };
                        updates[`/users/${userId}/groups`] = updatedGroups;

                        // updating every group
                        for (let g in oldGroups) {
                            updates[`/groups/${g}/members/${userId}`] = true;
                            updates[`/groups/${g}/members/${_id}`] = null;
                            updates[`/groups/${g}/relUserId/${_id}`] = null;
                            updates[`/groups/${g}/relUserId/${userId}`] = oldGroups[g].relUserId;
                        }
                    }
                    console.log('all good!2  ', updates);

                    updates[`/users/${userId}/contact`] = contact;

                    database
                        .ref()
                        .update(updates)
                        .then(() => {
                            console.log('updated realtime db with contact', user);
                            success();
                        })
                        .catch(e => {
                            failure();
                        });

                    return e;
                })
                .catch(e => {
                    console.log('er ', e);
                    failure();
                });
        })
        .catch(e => failure());
};

export { userSignIn, getUsers, updateUserProfile, getUserGroups, getUserFriends, updateUserContact, checkNewGuestUser };
