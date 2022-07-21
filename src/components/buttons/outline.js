import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../themeContext';
import MyText from '../myText';
import { Button, Typography, Utility } from '../../styles';

const OutlineBtn = ({
    title,
    size = 'large',
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
                    Button.btnSize[size],
                    Button.outline[theme],
                    styles.container,
                    disabled && { opacity: 0.3 },
                    splash && { backgroundColor: Utility.Colors.dark.high },
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
                    <ActivityIndicator
                        size="small"
                        style={{ paddingVertical: 11 }}
                        color={Utility.Colors[txtColor].high}
                    />
                ) : (
                    <MyText text={title} style={[Typography[theme], splash && Typography.dark]} button={{ size }} />
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

export default OutlineBtn;
