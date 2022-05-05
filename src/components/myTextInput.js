import React, { useContext, useMemo } from 'react';
import { TextInput } from 'react-native';
import { ThemeContext } from '../themeContext';
import { Utility, Typography } from '../styles';

export default MyTextInput = ({ keyboardType = 'default', placeholder, style, ...rest }) => {
    const { theme } = useContext(ThemeContext);
    const themeColor = useMemo(() => {
        const currentTheme = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;
        return currentTheme;
    }, [theme]);

    return (
        <TextInput
            keyboardType={keyboardType}
            placeholder={placeholder}
            selectionColor={themeColor.low}
            placeholderTextColor={themeColor.low}
            style={[{ fontFamily: 'Gilroy-Regular', color: themeColor.high }, style]}
            {...rest}
        />
    );
};
