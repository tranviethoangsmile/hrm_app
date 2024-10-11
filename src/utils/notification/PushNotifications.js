import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {Platform, Alert} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {
  API,
  BASE_URL,
  V1,
  VERSION,
  CREATE,
  FCM_TOKEN,
  PORT,
} from '../../utils/Strings';
export async function requestUserPermission(USER_INFOR) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    getFcmToken(USER_INFOR);
  }
}

const getFcmToken = async USER_INFOR => {
  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');

    if (!fcmToken) {
      await messaging().registerDeviceForRemoteMessages();
      fcmToken = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', fcmToken);
    }
    const device_type = Platform.OS;
    const app_version = DeviceInfo.getVersion();
    const device_id = await DeviceInfo.getUniqueId();
    const user_id = USER_INFOR.id;
    await axios.post(
      `${BASE_URL}${PORT}${API}${VERSION}${V1}${FCM_TOKEN}${CREATE}`,
      {
        user_id: user_id,
        device_type: device_type,
        app_version: app_version,
        device_id: device_id,
        fcm_token: fcmToken,
      },
    );
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
  }
};

// Hàm để xử lý các sự kiện thông báo
export const NotificationServices = async () => {
  // Xử lý khi người dùng mở ứng dụng từ thông báo
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage,
    );
  });

  // Xử lý khi nhận được thông báo khi ứng dụng đang chạy
  messaging().onMessage(remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
  });

  // Xử lý khi ứng dụng được khởi động từ thông báo (lần đầu tiên)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage,
        );
      }
    });
};
