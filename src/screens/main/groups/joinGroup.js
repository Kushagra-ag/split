import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Image,
    PermissionsAndroid,
    KeyboardAvoidingView,
    FlatList
} from 'react-native';
import MyText from '../../../components/myText';
import { PrimaryBtn } from '../../../components/buttons';
import { getGroupDetails } from '../../../methods/groups';
import { Layout, Utility, Typography, Textfield, Misc } from '../../../styles';

export default JoinGroup = ({ route }) => {
    const [err, setErr] = useState(null);
    useEffect(() => {
        console.log(route.params);

        // getGroupDetails()
    }, []);

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
            >
                <MyText text="Join Group" style={Layout.pageHeader} title />

                <View style={styles.viewSection}>
                    <MyText text="Title" opacity="low" bodySubTitle />
                    <MyTextInput
                        style={Textfield.field}
                        clearButtonMode="while-editing"
                        placeholder="Add title here"
                        value={'aa'}
                        disabled
                    />
                </View>
            </ScrollView>
            {/*<View style={[styles.bottomBtn, { backgroundColor: Utility.Colors[theme].bg }]}>
                    {err.global && <MyText text={err.global} style={{ paddingBottom: 15, textAlign: 'center' }} red />}
                    <PrimaryBtn title="Skip" onPress={SkipMembers} loading={loading} disabled={loading} />
                </View>*/}
        </SafeAreaView>
    );
};
