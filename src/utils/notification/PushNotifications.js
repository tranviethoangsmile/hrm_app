import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import axios from 'axios';
// Chỉ import PushNotification nếu là Android
let PushNotification, Importance;
if (Platform.OS === 'android') {
  const push = require('react-native-push-notification');
  PushNotification = push.default;
  Importance = push.Importance;
}
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
    console.error('Đã xảy ra lỗi: ', error);
  }
};
// Tạo channel cho Android
if (Platform.OS === 'android' && PushNotification) {
  PushNotification.createChannel(
    {
      channelId: 'default-channel-id',
      channelName: 'Default Channel',
      channelDescription: 'A default channel for general notifications',
      importance: 4,
      vibrate: true,
    },
    created => created,
  );
}
// Hàm để xử lý các sự kiện thông báo
export const NotificationServices = async () => {
  // Xử lý khi người dùng mở ứng dụng từ thông báo
  messaging().onNotificationOpenedApp(remoteMessage => {

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
      const encryptedMessage = remoteMessage?.notification?.body;
      const key = remoteMessage?.data?.key;

      if (Platform.OS === 'android' && PushNotification) {
        if (encryptedMessage && key) {
          const decryptedMessage = decrypt(encryptedMessage, key);
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: remoteMessage.notification?.title || 'Thông báo',
            message: decryptedMessage,
            playSound: true,
            soundName: 'default',
            importance: Importance ? Importance.HIGH : 4,
            priority: 'high',
          });
        } else {
          // Fallback for non-encrypted messages
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: remoteMessage.notification?.title || 'Thông báo',
            message: remoteMessage.notification?.body || 'Có thông báo mới',
            playSound: true,
            soundName: 'default',
            importance: Importance ? Importance.HIGH : 4,
            priority: 'high',
          });
        }
      }
    } catch (error) {
      console.error('Error while handling notification:', error);
    }
  });

  // Xử lý khi ứng dụng được khởi động từ thông báo (lần đầu tiên)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
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

  // Uncomment and update background message handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    try {
      const encryptedMessage = remoteMessage?.notification?.body;
      const key = remoteMessage?.data?.key;

      if (Platform.OS === 'android' && PushNotification) {
        if (encryptedMessage && key) {
          const decryptedMessage = decrypt(encryptedMessage, key);
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: remoteMessage.notification?.title || 'Thông báo',
            message: decryptedMessage,
            playSound: true,
            soundName: 'default',
            importance: Importance ? Importance.HIGH : 4,
            priority: 'high',
          });
        } else {
          // Fallback for non-encrypted messages
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: remoteMessage.notification?.title || 'Thông báo',
            message: remoteMessage.notification?.body || 'Có thông báo mới',
            playSound: true,
            soundName: 'default',
            importance: Importance ? Importance.HIGH : 4,
            priority: 'high',
          });
        }
      }
    } catch (error) {
      console.error('Error while handling background message:', error);
    }
  });
};
