import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, SafeAreaView, ScrollView, StyleSheet, Pressable } from 'react-native';
import auth from '@react-native-firebase/auth';
import CheckBox from '@react-native-community/checkbox';
import MyText from '../../../../components/myText';
import MyTextInput from '../../../../components/myTextInput';
import reqHandler from '../../../../methods/reqHandler';
import { PrimaryBtn } from '../../../../components/buttons';
import { ThemeContext } from '../../../../themeContext';
import { Layout, Utility, Typography, Textfield, Misc, Button } from '../../../../styles';
import { setItemLocal } from '../../../../methods/localStorage';

export default NewGroup = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [group, setGroup] = useState({
        title: 'Group1',
        desc: '',
        defaultGrp: true
    });
    const [err, setErr] = useState(null);
    const [themeColor] = useState(theme === 'dark' ? 'light' : 'dark');

    const handleChange = (e, key) => {
        setErr(null);
        // console.log(e, key);
        setGroup(group => ({ ...group, [key]: e }));
    };

    const addGrpMembers = () => {
        if (!group.title) {
            setErr('Group name is required');
            return;
        }
        navigation.navigate('addMembers', { details: group });
    };

    useEffect(() => {
        reqHandler({
            action: 'syncUserFriends',
            apiUrl: 'users',
            method: 'POST',
            params: {
                uId: auth().currentUser.uid
            }
        })
        .then(friends => {
            if(friends?.error) {
                // fail silently
                return
            };
    
            setItemLocal({
                key: 'userFriends',
                value: friends.item
            });
        })
        .catch(() => null);

        
    });

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <MyText text="New Group" style={Layout.pageHeader} title />
                <View style={{ marginBottom: 30 }}>
                    <MyText text="Name" opacity="low" bodySubTitle />
                    <MyTextInput
                        style={Textfield.field}
                        maxLength={50}
                        placeholder="Add title here"
                        value={group.title}
                        onChangeText={e => handleChange(e, 'title')}
                        autoFocus
                    />
                </View>
                <View style={[styles.borderView, { borderColor: Utility.Colors[themeColor].low }]}>
                    <MyText text="Description" opacity="low" bodySubTitle />
                    <MyTextInput
                        style={Textfield.field}
                        maxLength={80}
                        placeholder="Add description here"
                        value={group.desc}
                        onChangeText={e => handleChange(e, 'desc')}
                    />
                </View>
                <View
                    style={[
                        Misc.rows.container,
                        {
                            marginBottom: 30
                        }
                    ]}
                >
                    <MyText text="Make this as my default group" opacity="med" label />
                    <CheckBox
                        disabled={false}
                        value={group.defaultGrp}
                        onValueChange={newValue => handleChange(newValue, 'defaultGrp')}
                        tintColors={{ true: Utility.Colors[themeColor].high, false: Utility.Colors[themeColor].high }}
                    />
                </View>
                {err && <MyText text={err} error />}
                <View style={[Button.bottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                    <PrimaryBtn title="Add members" onPress={addGrpMembers} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    head: {
        paddingBottom: 50
    },
    borderView: {
        paddingBottom: 30,
        marginBottom: 30,
        borderBottomWidth: 1
    }
});
