import { Dimensions, StyleSheet } from 'react-native';
import * as Utility from './utility';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        width: width,
        height: height,
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    scrollViewContainer: {
        flex: 1,
        width: width,
        minHeight: height,
        paddingHorizontal: 30,
        paddingTop: 30,
        backgroundColor: 'transparent'
        // overflow: 'visible'
    },
    contentContainerStyleBtnBottom: {
        minHeight: height,
        paddingBottom: 50
    },
    contentContainerStyleFixedBtnBottom: {
        paddingBottom: 150
    },
    pageHeader: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 30
    },
    horizontalScrollMemeberView: {
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginBottom: 30
        },
        user: {
            paddingRight: 20
        },
        userImg: {
            alignSelf: 'center',
            width: 40,
            height: 40,
            borderRadius: 20,
            marginBottom: 5,
            overflow: 'hidden'
        },
        userCross: {
            position: 'absolute',
            right: 0
        },
        userText: {
            maxWidth: 65,
            alignSelf: 'center'
        }
    },
    modal: {
        modalView: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: '#00000088'
        },
        modalChildView: {
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            padding: 35,
            alignItems: 'flex-start',
            justifyContent: 'flex-end'
        }
    }
});
