import React, {useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {Provider} from 'react-redux';
import MainNavigator from './src/navigation/MainNavigator';
import MyStore from './src/redux/MyStore';
import {
  NotificationServices,
  requestUserPermission,
} from './src/utils/notification/PushNotifications';

const App = () => {
  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      if (
        granted['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
      } else {
        console.log('Permissions denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  useEffect(() => {
    // NotificationServices();
    if (Platform.OS === 'android') {
      requestStoragePermission();
    }
    requestUserPermission();
  }, []);
  return (
    <Provider store={MyStore}>
      <MainNavigator />
    </Provider>
  );
};
export default App;
