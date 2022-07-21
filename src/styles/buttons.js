import { StyleSheet } from 'react-native';
import * as Utility from './utility';

const btn = {
    base: {
        borderRadius: Utility.BtnBorderRadius,
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    text: {
        fontFamily: 'Urbanist-Medium'
    }
};

export default StyleSheet.create({
    btnSize: {
        large: {
            ...btn.base
        },
        small: {
            ...btn.base,
            paddingVertical: 12
        }
    },
    btnText: {
        large: {
            ...btn.text,
            fontSize: 18
        },
        small: {
            ...btn.text,
            fontSize: 16
        }
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
