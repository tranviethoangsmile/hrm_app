import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    getFcmToken();
  }
}

const getFcmToken = async () => {
  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log(`FCM Token: ${fcmToken}`);

    if (!fcmToken) {
      // Đăng ký thiết bị để nhận tin nhắn từ FCM
      await messaging().registerDeviceForRemoteMessages();

      // Lấy FCM Token
      fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      // Lưu trữ FCM Token vào AsyncStorage
      await AsyncStorage.setItem('fcmToken', fcmToken);
    }
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
  }
};

export const NotificationServices = async () => {
  await messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(remoteMessage);
  });
  await messaging().onMessage(remoteMessage => {
    console.log(remoteMessage);
  });
  await messaging().getInitialNotification(remoteMessage => {
    console.log(remoteMessage);
  });
};
