import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../themeContext';
import MyText from '../myText';
import { Button, Typography, Utility } from '../../styles';

const PrimaryBtn = ({
    title,
    onPress = null,
    icon = false,
    loading = false,
    disabled = false,
    splash = false,
    style,
    viewStyle
}) => {
    const { theme } = useContext(ThemeContext);
    let txtColor = theme === 'light' ? 'dark' : 'light';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.6} disabled={disabled} style={style}>
            <View
                style={[
                    Button.btn,
                    Button.primary[theme],
                    styles.container,
                    disabled && { backgroundColor: Utility.Colors[txtColor].low },
                    splash && { backgroundColor: Utility.Colors.dark.bg },
                    viewStyle && { ...viewStyle }
                ]}
            >
                {icon ? (
                    <Icon
                        name={icon.name}
                        color={icon.color || Typography[txtColor].color}
                        size={icon.size || 24}
                        style={styles.iconLeft}
                    />
                ) : null}
                {loading ? (
                    <ActivityIndicator size="small" style={{ paddingVertical: 1 }} color={Utility.Colors[theme].high} />
                ) : (
                    <MyText text={title} style={[Typography[txtColor], splash && Typography.dark]} btnText />
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

export default PrimaryBtn;
