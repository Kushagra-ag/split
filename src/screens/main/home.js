import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import {
    Animated,
    View,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Image,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { Layout, Utility, Misc, Button } from '../../styles';
import { PrimaryBtn } from '../../components/buttons';
import MyText from '../../components/myText';
import MyTextInput from '../../components/myTextInput';
import { getUserGroups } from '../../methods/user';
import { ThemeContext } from '../../themeContext';
import { getItemLocal } from '../../methods/localStorage';

const Home = ({ navigation, route }) => {
    const { theme } = useContext(ThemeContext);
    const [user] = useState(auth().currentUser);
    const [query, updateQuery] = useState('');
    const [search, updateSearch] = useState([]);
    const [data, setData] = useState(null);
    const [err, setErr] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const dotAnim = useRef(new Animated.Value(1)).current;

    const themeColor = useMemo(() => {
        const currentTheme = theme === 'dark' ? Utility.Colors.light : Utility.Colors.dark;
        return currentTheme;
    }, [theme]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await onLoad();
        setRefreshing(false);
    }, []);

    const dotAnimation = () => {
        const growAnim1 = Animated.timing(dotAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true
        });
        const growAnim2 = Animated.timing(dotAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        });

        Animated.sequence([growAnim1, growAnim2]).start();
    };

    const handleSearch = e => {
        // console.log(e);
        updateQuery(e);

        let matchArr = [];

        if (e.length > 0) {
            const regexp = new RegExp(`${e}`, 'i');

            data.forEach((grp, ind) => {
                let match = grp.name.match(regexp);

                if (match) {
                    matchArr = [...matchArr, data[ind]];
                }
            });

            updateSearch([...matchArr]);
        } else {
            updateSearch([]);
        }
    };

    const onLoad = async (userGroupInfo = null) => {
        let grpData = userGroupInfo ? userGroupInfo : await getUserGroups(user.uid), pinnedGrps = await getItemLocal('pinnedGrps') || [];
        console.log('grpdata from home- ', grpData, pinnedGrps);

        if (grpData?.error) {
            setErr(grpData.msg);
            return;
        }

        // sort pinned groups to the top
        if(pinnedGrps.length > 0) {
            grpData.forEach((grp, idx) => {
                const pinnedGrpIdx = pinnedGrps.indexOf(grp._id);
                if(pinnedGrpIdx !== -1) {
                    pinnedGrps[pinnedGrpIdx] = grpData[idx];
                    pinnedGrps[pinnedGrpIdx].pinned = true;
                    grpData.splice(idx, 1);
                }
            });

            grpData = pinnedGrps.concat(grpData);
        }

        setData(grpData);

        !user.phoneNumber && setTimeout(dotAnimation, 1000);
    };

    useEffect(() => {
        onLoad(route.params?.userGroupInfo);
        console.log('useeffect', route.params);
    }, []);

    return (
        <SafeAreaView style={Layout.safeAreaContainer}>
            <ScrollView
                style={Layout.scrollViewContainer}
                contentContainerStyle={Layout.contentContainerStyleBtnBottom}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={Layout.pageHeader}>
                    <MyText text={'Splitz'} bigTitle />
                    <Pressable onPress={() => navigation.navigate('settings')}>
                        <View
                            style={[
                                Misc.rows.profilePhoto,
                                {
                                    borderColor: themeColor.high,
                                    borderWidth: 0
                                }
                            ]}
                        >
                            <Image
                                source={{ uri: user.photoURL }}
                                resizeMode="cover"
                                resizeMethod="scale"
                                style={Misc.rows.profilePhotoImg}
                            />
                        </View>
                        {user.phoneNumber ? null : (
                            <Animated.View style={[styles.notif, { transform: [{ scale: dotAnim }] }]}></Animated.View>
                        )}
                    </Pressable>
                </View>
                <View style={styles.homeSearchContainer}>
                    <View style={[Misc.search.searchBar, { borderColor: themeColor.med, flexGrow: 1 }]}>
                        <Icon name="search-outline" color={themeColor.low} size={24} />
                        <MyTextInput
                            keyboardType="default"
                            placeholder="Search"
                            style={Misc.search.searchField}
                            value={query}
                            onChangeText={e => handleSearch(e)}
                        />
                    </View>
                    <View>
                        {/*<Icon
                                                                    name="people-circle"
                                                                    color={themeColor.med}
                                                                    size={42}
                                                                    style={{ paddingRight: 1, paddingLeft: 10 }}
                                                                />*/}
                    </View>
                </View>
                {err ? (
                    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: -1 }]}>
                        <MyText text={err} />
                        <Image source={require('../../assets/images/no-groups-yet.png')} resizeMode="center" />
                    </View>
                ) : Boolean(!query) ? (
                    data ? (
                        data.length > 0 ? (
                            data.map(grp => (
                                <GroupItem key={grp._id} grp={grp} uId={user.uid} themeColor={themeColor} navigation={navigation} showPinFlag={true} />
                            ))
                        ) : (
                            <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: -1 }]}>
                                <MyText text="No groups yet!" />
                                <Image source={require('../../assets/images/no-groups-yet.png')} resizeMode="center" />
                            </View>
                        )
                    ) : (
                        <View style={[Misc.rows.container, { justifyContent: 'center' }]}>
                            <ActivityIndicator size="small" color={themeColor.high} />
                        </View>
                    )
                ) : search ? (
                    search.length > 0 ? (
                        search.map(grp => (
                            <GroupItem key={grp._id} grp={grp} uId={user.uid} themeColor={themeColor} navigation={navigation} showPinFlag={false} />
                        ))
                    ) : (
                        <View style={[Misc.rows.container, { justifyContent: 'center' }]}>
                            <MyText text="No search results found :(" />
                        </View>
                    )
                ) : (
                    <View style={[Misc.rows.container, { justifyContent: 'center' }]}>
                        <ActivityIndicator size="small" color={themeColor.high} />
                    </View>
                )}

                <View style={[Button.bottomBtnContainer, { backgroundColor: Utility.Colors[theme].bg }]}>
                    <PrimaryBtn
                        title="New Group"
                        onPress={() =>
                            navigation.navigate('groups', {
                                screen: 'newGroup'
                            })
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const GroupItem = ({grp, themeColor, uId, navigation, showPinFlag = false}) => {

    return (
        <View style={Misc.rows.container}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={Misc.rows.itemLeftGrow}
                onPress={() =>
                    navigation.navigate('groups', {
                        screen: 'default',
                        params: {
                            _id: grp._id
                        }
                    })
                }
            >
                <View>
                    <MyText
                        text={grp.name}
                        style={styles.grpHeading}
                        opacity="med"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        bodyTitle
                    />
                    <SubText amt={grp.cashFlowArr[grp.relUserId[uId]]} currency={grp.cur} />
                </View>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                {(showPinFlag && grp.pinned) && <Icon name="pin" color={themeColor.low} size={18} style={{paddingRight: 20}} />}
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('groups', {
                            screen: 'expenses',
                            params: {
                                screen: 'default',
                                params: {
                                    _id: grp._id
                                }
                            }
                        })
                    }
                    style={[
                        styles.addExpIcon,
                        { borderColor: themeColor.med, borderWidth: 1, marginRight: 2 }
                    ]}
                >
                    <Icon name="add" color={themeColor.med} size={18} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const SubText = ({ amt, currency }) => {
    return (
        <>
            {
                <MyText
                    text={
                        amt ? (amt > 0 ? `You are owed ${currency}${amt}` : `You owe ${currency}${-amt}`) : 'Settled Up'
                    }
                    opacity="low"
                    {...(amt === 0 ? null : amt > 0 ? { green: true } : { red: true })}
                    bodySubTitle
                />
            }
        </>
    );
};

const styles = StyleSheet.create({
    notif: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Utility.Colors.light.bg,
        backgroundColor: Utility.Colors.red,
        bottom: 0,
        right: 5
    },
    homeSearchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    grpHeading: {
        paddingBottom: 5
    },
    addExpIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        borderRadius: 15,
        overflow: 'hidden'
    }
});

export default Home;
