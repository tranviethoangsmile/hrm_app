/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {decrypt} from './src/services';
import PushNotification from 'react-native-push-notification';
messaging().setBackgroundMessageHandler(async remoteMessage => {
  const encryptedMessage = remoteMessage.notification.body;
  const key = remoteMessage?.data?.key;
  const decryptedMessage = decrypt(encryptedMessage, key);
  remoteMessage.notification.body = decryptedMessage;

  PushNotification.localNotification({
    // channelId: 'default-channel-id', // Đảm bảo channel ID đã được tạo
    title: remoteMessage.notification?.title,
    message: decryptedMessage, // Sử dụng nội dung đã giải mã
    playSound: true,
    soundName: 'default',
  });
});
AppRegistry.registerComponent(appName, () => App);
