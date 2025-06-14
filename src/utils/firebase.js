import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFCMToken();
  }
}

export async function getFCMToken() {
  let fcmToken = await AsyncStorage.getItem('fcmToken');

  if (!fcmToken) {
    try {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('New FCM Token:', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
        // Gọi API để cập nhật token mới lên server
        await updateTokenToServer(fcmToken);
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }

  return fcmToken;
}

export async function updateTokenToServer(token) {
  try {
    // Gọi API của bạn để cập nhật token
    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmToken: token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update token');
    }

    console.log('Token updated successfully');
  } catch (error) {
    console.error('Error updating token:', error);
  }
}

// Lắng nghe khi token được refresh
messaging().onTokenRefresh(async fcmToken => {
  console.log('New FCM Token:', fcmToken);
  await AsyncStorage.setItem('fcmToken', fcmToken);
  await updateTokenToServer(fcmToken);
});
