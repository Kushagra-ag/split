import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
    View,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    useWindowDimensions,
    Alert,
    ToastAndroid,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import { Utility, Layout, Misc } from '../styles';
import Geo from '../geo';

export default CountrySelectModal = ({ visible, setVisible, updateUser, themeColor, geoInfo }) => {
    const { height } = useWindowDimensions();
    const [countries, setCountries] = useState([]);

    const selectCountry = c => {
        updateUser(`${c[1].name} (${c[1].phoneCode})`, 'country');
        // setNewUser(newUser => ({...newUser, country: }));
        setVisible(false);
    };

    useEffect(() => {
        setTimeout(() => {
            const c = Object.entries(Geo.country);
            setCountries(c);
        }, 100);
        // console.log();
        console.log(geoInfo);
    }, []);

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={[Layout.modal.modalView]}>
                <ScrollView
                    style={[
                        {
                            backgroundColor:
                                themeColor.bg === '#272727' ? Utility.Colors.light.bg : Utility.Colors.dark.bg,
                            maxHeight: height / 1.5,
                            borderTopRightRadius: 20,
                            borderTopLeftRadius: 20
                        }
                    ]}
                    contentContainerStyle={Layout.modal.modalChildView}
                >
                    <View style={[Layout.pageHeader, { width: '100%' }]}>
                        <MyText text="Choose a country" bodyTitle style={{ fontFamily: 'PlayfairDisplay-Bold' }} />
                        <TouchableOpacity
                            onPress={() => {
                                setVisible(false);
                            }}
                        >
                            <Icon name="close-circle" color={themeColor.med} size={28} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%' }}>
                        {countries.length > 0 ? (
                            countries.map(c => (
                                <TouchableOpacity
                                    onPress={() => selectCountry(c)}
                                    key={c[0]}
                                    style={[Misc.rows.container, { justifyContent: 'flex-start' }]}
                                >
                                    <View style={styles.countryField}>
                                        <MyText text={c[1].name} />
                                        <MyText text={`  (${c[1].phoneCode})`} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={{ height: 200, justifyContent: 'center' }}>
                                <ActivityIndicator size="small" color={themeColor.high} />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    countryField: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 0,
        marginVertical: 0
    }
});
