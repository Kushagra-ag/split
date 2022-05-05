import EncryptedStorage from 'react-native-encrypted-storage';

/**
 *	Method to fetch items in local async storage
 *
 *  @param {string} item - Name of the key to be fetched
 *	@returns {(object|boolean)}
 */

const getItemLocal = async item => {
    try {
        let value = await EncryptedStorage.getItem(item);

        // if (typeof value === 'string') value = JSON.parse(value);

        return JSON.parse(value);
    } catch (e) {
        console.log(e);
        return false;
    }
};

/**
 *	Method to set items in local async storage
 *
 *	@param {object} item - Item to be stored in local storage
 *	@returns {boolean}
 */

const setItemLocal = async item => {
    try {
        await EncryptedStorage.setItem(item.key, JSON.stringify(item.value));
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

/**
 *	Method to remove items in local async storage
 *
 *	@param {string} item - key to be removed from local storage
 *	@returns {boolean}
 */

const removeItemLocal = async item => {
    try {
        await EncryptedStorage.removeItem(item);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

export { getItemLocal, setItemLocal, removeItemLocal };
