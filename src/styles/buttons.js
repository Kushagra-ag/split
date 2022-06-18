import { StyleSheet } from 'react-native';
import * as Utility from './utility';

export default StyleSheet.create({
    btn: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: Utility.BtnBorderRadius,
        textAlign: 'center'
    },
    btnText: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 18
    },
    primary: {
        light: {
            backgroundColor: Utility.Colors.dark.bg
        },
        dark: {
            backgroundColor: Utility.Colors.light.bg
        }
    },
    outline: {
        light: {
            borderWidth: 1,
            borderColor: Utility.Colors.dark.bg
        },
        dark: {
            borderWidth: 1,
            borderColor: Utility.Colors.light.bg
        }
    },
    red: {
        backgroundColor: Utility.Colors.red
    },
    bottomBtnContainer: {
        marginTop: 'auto',
        paddingTop: 30,
        // paddingBottom: 50,
        // paddingHorizontal: 30,
        width: '100%',
        backgroundColor: Utility.Colors.light.bg
    },
    fixedBottomBtnContainer: {
        position: 'absolute',
        // alignItems: 'center',
        justifyContent: 'center',
        bottom: 0,
        paddingVertical: 20,
        paddingHorizontal: 30,
        width: '100%'
    }
});
