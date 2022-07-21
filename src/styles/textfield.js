import { Dimensions, StyleSheet } from 'react-native';
import * as Utility from './utility';

const textFieldStyles = {
    fontFamily: 'Urbanist-Regular',
    fontSize: 20,
    flexGrow: 1,
    paddingLeft: 0,
    overflow: 'hidden'
}

export default StyleSheet.create({
    field: {
        ...textFieldStyles,
        letterSpacing: Utility.LetterSpacing,
    },
    smallField: {
        ...textFieldStyles,
        fontSize: 18,
        letterSpacing: Utility.LetterSpacing,
    },
    bigField: {
        ...textFieldStyles,
        fontFamily: 'Urbanist-Bold',
        fontSize: 40,
    }
});
