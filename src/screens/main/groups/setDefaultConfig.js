import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    FlatList
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { ThemeContext } from '../../../themeContext';
import MyText from '../../../components/myText';
import { PrimaryBtn } from '../../../components/buttons';
import { getGroupDetails } from '../../../methods/groups';
import { getUsers } from '../../../../../methods/user';
import { Layout, Utility, Button, Misc } from '../../../styles';

export default SetDefaultConfig = ({ navigation, route }) => {

    const { theme } = useContext(ThemeContext);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        getGroupDetails(route.params._id)
            .then(grp => {

                const members = grp.members;
                let config = {};
                for(let member in members) {
                    // call splitEqual method
                    
                    // config[member] = share
                }
            })

    }, [])

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <MyText text="Set Group Config" style={Layout.pageHeader} title />

            </ScrollView>
        </SafeAreaView>
    )
}

const memberItem = ({}) => {

    return (
        <View style={[Misc.rows.container, { paddingVertical: 15 }]}>
            
        </View>
    )
}