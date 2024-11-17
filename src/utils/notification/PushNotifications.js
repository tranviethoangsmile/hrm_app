import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import axios from 'axios';
import PushNotification, {Importance} from 'react-native-push-notification';
import {API, BASE_URL, V1, VERSION, CREATE, FCM_TOKEN, PORT} from '../constans';
import {decrypt} from '../../services';
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
// Tạo channel cho Android
PushNotification.createChannel(
  {
    channelId: 'default-channel-id', // ID cho channel, khớp với channelId trong localNotification
    channelName: 'Default Channel', // Tên channel
    channelDescription: 'A default channel for general notifications', // Mô tả
    importance: 4, // Độ ưu tiên cho thông báo
    vibrate: true,
  },
  created => console.log(`createChannel returned '${created}'`), // Xác nhận tạo channel
);
// Hàm để xử lý các sự kiện thông báo
export const NotificationServices = async () => {
  // Xử lý khi người dùng mở ứng dụng từ thông báo
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(remoteMessage);

    // try {
    //   const encryptedMessage = remoteMessage?.notification.body;
    //   const key = remoteMessage?.data.key;

    //   if (encryptedMessage && key) {
    //     const decryptedMessage = decrypt(encryptedMessage, key);
    //     PushNotification.localNotification({
    //       channelId: 'default-channel-id',
    //       title: remoteMessage.notification?.title,
    //       message: decryptedMessage,
    //       playSound: true,
    //       soundName: 'default',
    //       importance: Importance.LOW,
    //       priority: 'low',
    //     });
    //   }
    // } catch (error) {
    //   console.error('Error while decrypting the message:', error);
    // }
  });

  // Xử lý khi nhận được thông báo khi ứng dụng đang chạy
  messaging().onMessage(remoteMessage => {
    try {
      const encryptedMessage = remoteMessage?.notification.body;
      const key = remoteMessage?.data.key;

      if (encryptedMessage && key) {
        const decryptedMessage = decrypt(encryptedMessage, key);
        PushNotification.localNotification({
          channelId: 'default-channel-id',
          title: remoteMessage.notification?.title,
          message: decryptedMessage,
          playSound: true,
          soundName: 'default',
          importance: Importance.LOW,
          priority: 'low',
        });
      }
    } catch (error) {
      console.error('Error while decrypting the message:', error);
    }
  });

  // Xử lý khi ứng dụng được khởi động từ thông báo (lần đầu tiên)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(remoteMessage);
        // try {
        //   const encryptedMessage = remoteMessage?.notification.body;
        //   const key = remoteMessage?.data.key;

        //   if (encryptedMessage && key) {
        //     const decryptedMessage = decrypt(encryptedMessage, key);
        //     PushNotification.localNotification({
        //       channelId: 'default-channel-id',
        //       title: remoteMessage.notification?.title,
        //       message: decryptedMessage,
        //       playSound: true,
        //       soundName: 'default',
        //       importance: Importance.LOW,
        //       priority: 'low',
        //     });
        //   }
        // } catch (error) {
        //   console.error('Error while decrypting the message:', error);
        // }
      }
    });
  // messaging().setBackgroundMessageHandler(async remoteMessage => {
  //   try {
  //     const encryptedMessage = remoteMessage?.notification?.body;
  //     const key = remoteMessage?.data?.key;

  //     if (encryptedMessage && key) {
  //       const decryptedMessage = decrypt(encryptedMessage, key);

  //       PushNotification.localNotification({
  //         channelId: 'default-channel-id',
  //         title: remoteMessage.notification?.title || 'Thông báo',
  //         message: decryptedMessage,
  //         playSound: true,
  //         soundName: 'default',
  //         importance: Importance.LOW,
  //         priority: 'low',
  //       });
  //     } else {
  //       console.warn('Dữ liệu thông báo không đầy đủ.');
  //     }
  //   } catch (error) {
  //     console.error('Lỗi khi xử lý tin nhắn nền:', error);
  //   }
  // });
};
