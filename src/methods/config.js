import { firebase } from '@react-native-firebase/database';

export { firebase };
export const database = firebase
    .app()
    .database('https://split-50cbf-default-rtdb.asia-southeast1.firebasedatabase.app/');
