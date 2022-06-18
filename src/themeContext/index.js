import React, { useContext, useState, createContext, useEffect } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { getItemLocal, setItemLocal } from '../methods/localStorage';

export const ThemeContext = createContext('light');

export default ThemeProvider = props => {
    const [theme, setTheme] = useState('light');
    const [geoInfo, setGeoInfo] = useState(null);
    // const [user, setUser] = useState(null);

    const getTheme = async () => {
        let mode = await getItemLocal('uiMode');
        if (!mode) {
            await setItemLocal({
                key: 'uiMode',
                value: 'light'
            });
            mode = 'light';
        }
        return mode;
    };

    const getGeoInfo = async () => {
        c = await getItemLocal('userGeo');
        // c ? null : setItemLocal({
        //         key: 'userGeo',
        //         value: '₹'
        //     });
        return c;
    };

    useEffect(() => {
        (async () => {
            const mode = await getTheme();
            setTheme(mode);
            const c = await getGeoInfo();
            setGeoInfo(c);
        })();
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, geoInfo, setGeoInfo }}>{props.children}</ThemeContext.Provider>
    );
};
