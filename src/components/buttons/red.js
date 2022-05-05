import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../themeContext';
import MyText from '../myText';
import { Button, Typography, Utility } from '../../styles';

const RedBtn = ({
    title,
    onPress = null,
    icon = false,
    loading = false,
    disabled = false,
    splash = false,
    viewStyle
}) => {
    const { theme } = useContext(ThemeContext);
    let txtColor = theme === 'light' ? 'dark' : 'light';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.6} disabled={disabled}>
            <View
                style={[
                    Button.btn,
                    Button.red,
                    styles.container,
                    // disabled && { backgroundColor: Utility.Colors[txtColor].low },
                    splash && { backgroundColor: Utility.Colors.dark.bg },
                    viewStyle && { ...viewStyle }
                ]}
            >
                {icon ? (
                    <Icon
                        name={icon.name}
                        color={icon.color || Typography.dark.color}
                        size={icon.size || 24}
                        style={styles.iconLeft}
                    />
                ) : null}
                {loading ? (
                    <ActivityIndicator size="small" style={{ paddingVertical: 1 }} color={Utility.Colors.light.high} />
                ) : (
                    <MyText text={title} style={[Typography.dark]} btnText />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconLeft: {
        paddingRight: 10
    }
});

export default RedBtn;
