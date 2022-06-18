import React, { useContext, useMemo } from 'react';
import { TextInput } from 'react-native';
import { ThemeContext } from '../themeContext';
import { Utility, Typography } from '../styles';

export default MyTextInput = React.forwardRef(({ keyboardType = 'default', placeholder, style, ...rest }, ref) => {
    const { theme } = useContext(ThemeContext);
    const themeColor = useMemo(() => {
        const currentTheme = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;
        return currentTheme;
    }, [theme]);

    return (
        <TextInput
            ref={ref}
            keyboardType={keyboardType}
            placeholder={placeholder}
            selectionColor={themeColor.low}
            placeholderTextColor={themeColor.low}
            style={[{ fontFamily: 'Urbanist-Regular', color: themeColor.high }, style]}
            {...rest}
        />
    );
});
