import { StyleSheet } from 'react-native';
import * as Utility from './utility';

export default StyleSheet.create({
    light: {
        color: Utility.Colors.dark.high
    },
    dark: {
        color: Utility.Colors.light.high
    },
    red: {
        color: Utility.Colors.red
    },
    green: {
        color: Utility.Colors.green
    },
    label: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 18
    },
    menuItem: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 18
    },
    bigTitle: {
        fontFamily: 'PlayfairDisplay-Bold',
        fontSize: 45
    },
    title: {
        fontFamily: 'PlayfairDisplay-Bold',
        fontSize: 30
    },
    subTitle: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 16
    },
    body: {
        title: {
            fontFamily: 'Urbanist-Regular',
            letterSpacing: Utility.LetterSpacing,
            fontSize: 20
        },
        subTitle: {
            fontFamily: 'Urbanist-Regular',
            fontSize: 14
        }
    },
    tabs: {
        title: {
            fontFamily: 'PlayfairDisplay-Bold',
            fontSize: 20,
            textTransform: 'capitalize'
        }
    },
    expenseDate: {
        fontFamily: 'Urbanist-Light',
        fontSize: 11
    },
    errorText: {
        fontFamily: 'Urbanist-Medium',
        color: Utility.Colors.red,
        paddingBottom: 15,
        textAlign: 'center'
    }
});
