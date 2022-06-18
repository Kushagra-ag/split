import React, { useContext } from 'react';
import { Text } from 'react-native';
import { ThemeContext } from '../themeContext';
import { Utility, Typography, Button } from '../styles';

/**
 *  Function to render a text element
 *
 *  @param {String} text - Text to render
 *  @param {String} opacity - Enum('high', 'med', 'low')
 *  @param {Object} style - Additional styles to be applied
 *  @param {Boolean} styles - Specific predefined styles for the rendering text
 *  @returns {React Node}
 */

export default MyText = ({
    text,
    opacity = 'high',
    style,
    bigTitle,
    title,
    label,
    menuItem,
    body,
    subTitle,
    bodyTitle,
    bodySubTitle,
    btnText,
    expenseDate,
    error,
    splashText,
    red,
    green,
    light,
    dark,
    letterSpacing,
    ...rest
}) => {
    const { theme } = useContext(ThemeContext);
    const color = theme === 'light' ? Utility.Colors.dark[opacity] : Utility.Colors.light[opacity];
    
    return (
        <Text
            {...rest}
            style={[
                { color },
                bigTitle && Typography.bigTitle,
                title && Typography.title,
                subTitle && Typography.subTitle,
                label && Typography.label,
                menuItem && Typography.menuItem,
                bodyTitle && Typography.body.title,
                bodySubTitle && Typography.body.subTitle,
                btnText && Button.btnText,
                expenseDate && Typography.expenseDate,
                error && Typography.errorText,
                red && Typography.red,
                green && Typography.green,
                splashText && Typography.splashText,
                light && { color: Utility.Colors.light[opacity] },
                dark && { color: Utility.Colors.dark[opacity] },
                { letterSpacing },
                style
            ]}
        >
            {text}
        </Text>
    );
};
