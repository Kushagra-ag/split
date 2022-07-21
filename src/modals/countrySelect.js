import React, { useState, useEffect, useMemo } from 'react';
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
import reqHandler from '../methods/reqHandler';
import Icon from 'react-native-vector-icons/Ionicons';
import MyText from '../components/myText';
import MyTextInput from '../components/myTextInput';
import { Utility, Layout, Misc, Textfield } from '../styles';
// import Geo from '../geo';

export default CountrySelectModal = ({ visible, setVisible, updateUser, themeColor, geoInfo }) => {
    const { height } = useWindowDimensions();
    const [countries, setCountries] = useState();
    const [query, updateQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const selectCountry = c => {
        updateUser(`${c.name} (${c.phoneCode})`, 'country');
        // setNewUser(newUser => ({...newUser, country: }));
        setVisible(false);
    };

    const updateCountryList = async e => {
        updateQuery(e);

        if (e.length < 3) return;

        setLoading(true);
        let res = await reqHandler({
            action: 'countrySearchQuery',
            apiUrl: 'misc',
            method: 'POST',
            params: {
                query: e
            }
        });
        setLoading(false);

        if (res?.error) {
            setErr(res.msg);
            return;
        }

        setCountries(res);
    };

    useEffect(() => {
        // setTimeout(() => {
        //     const c = Object.entries(Geo.country);
        //     setCountries(c);
        // }, 100);
    }, []);

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={[Layout.modal.modalView]}>
                <ScrollView
                    style={[
                        {
                            backgroundColor:
                                themeColor.bg === Utility.Colors.dark.bg
                                    ? Utility.Colors.light.bg
                                    : Utility.Colors.dark.bg,
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
                        <View style={styles.searchRow}>
                            <MyTextInput
                                style={Textfield.field}
                                placeholder={query ? '' : 'Start typing to load suggestions'}
                                maxLength={50}
                                value={query}
                                onChangeText={e => updateCountryList(e)}
                                autoFocus
                            />
                            {loading && <ActivityIndicator size="small" color={themeColor.high} />}
                        </View>
                        {countries?.length > 0 ? (
                            countries.map(c => (
                                <TouchableOpacity
                                    onPress={() => selectCountry(c)}
                                    key={c.phoneCode}
                                    style={[Misc.rows.container, { justifyContent: 'flex-start' }]}
                                >
                                    <View style={styles.countryField}>
                                        <MyText text={c.name} />
                                        <MyText text={`  (${c.phoneCode})`} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={{ height: 200, justifyContent: 'center' }}>
                                <MyText text="No results" />
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
    },
    searchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});
