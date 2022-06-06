import { firebase } from '@react-native-firebase/database';
import { firebase as fb } from '@react-native-firebase/functions';

export { firebase };
export const database = firebase
    .app()
    .database('https://split-50cbf-default-rtdb.asia-southeast1.firebasedatabase.app/');

// fb.functions().useFunctionsEmulator('http://192.168.x.x:5001');
    // const {data} = await fb.functions().httpsCallable('groups-getGrp')
