import React, { useContext, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeContext } from '../themeContext';
import { Utility } from '../styles';

export default Divider = ({ color }) => {
    const { theme } = useContext(ThemeContext);
    const themeColor = useMemo(() => {
        const currentTheme = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;
        return currentTheme;
    }, [theme]);

    return <View style={[styles.divStyle, { backgroundColor: color ? color : themeColor.low }]}></View>;
};

const styles = StyleSheet.create({
    divStyle: {
        height: 1,
        marginVertical: 10,
        width: '100%'
    }
});
