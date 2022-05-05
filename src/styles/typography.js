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
        fontFamily: 'Gilroy-Regular',
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
        fontFamily: 'Gilroy-Regular',
        fontSize: 16
    },
    body: {
        title: {
            fontFamily: 'Gilroy-Regular',
            fontSize: 20
        },
        titleGilroy: {
            fontFamily: 'Gilroy-Regular',
            fontSize: 20
        },
        subTitle: {
            fontFamily: 'Gilroy-Regular',
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
        fontFamily: 'Gilroy-Light',
        fontSize: 11
    },
    errorText: {
        fontFamily: 'Gilroy-Medium',
        color: Utility.Colors.red,
        paddingBottom: 15,
        textAlign: 'center'
    },
    splashText: {
        fontFamily: 'Gilroy-Regular',
        color: Utility.Colors.light.low,
        fontSize: 20,
        paddingBottom: 30,
        opacity: 0.25,
        letterSpacing: 15
    }
});
