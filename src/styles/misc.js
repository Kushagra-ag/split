import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
    search: {
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 30,
            paddingHorizontal: 20,
            borderWidth: 0.5,
            borderRadius: 50,
            width: '100%'
        },
        searchField: {
            paddingHorizontal: 15,
            flexGrow: 1
            // width: '90%'
        }
    },
    fab: {
        container: {
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            height: 56,
            width: 56,
            borderRadius: 28,
            right: 30,
            bottom: 50,
            zIndex: 99
            // backgroundColor: '#000',
        }
    },
    rows: {
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 20
        },
        containerStart: {
            flexDirection: 'row',
            // justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 20
        },
        itemLeftGrow: {
            flexGrow: 1
        },
        profilePhoto: {
            height: 50,
            width: 50,
            borderRadius: 25,
            overflow: 'hidden'
        },
        profilePhotoSmall: {
            height: 30,
            width: 30,
            borderRadius: 15,
            overflow: 'hidden'
        },
        profilePhotoImg: {
            flex: 1
        }
    },
    width: {
        75: {
            maxWidth: '75%'
        },
        80: {
            maxWidth: '80%'
        },
        85: {
            maxWidth: '85%'
        }
    }
});
