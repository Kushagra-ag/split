import { Dimensions, StyleSheet } from 'react-native';
import * as Utility from './utility';

export default StyleSheet.create({
    field: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 20,
        flexGrow: 1,
        letterSpacing: Utility.LetterSpacing,
        overflow: 'hidden'
    },
    bigField: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 40,
        flexGrow: 1,
        overflow: 'hidden'
    }
});
