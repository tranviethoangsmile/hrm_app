import axios from 'axios';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../services/i18next';
import MyStore from '../redux/MyStore';
import {setAuthData} from '../redux/AuthSlice';
import {navigationRef} from '../navigation/navigationRef';

export const TOKEN_KEY = 'token';

let loggingOut = false;
let lastAuthAlertTime = 0;

const clearSession = async () => {
  loggingOut = true;
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, 'userInfor', 'USERINFO']);
    MyStore.dispatch(setAuthData(null));
  } catch (error) {
    console.warn('clearSession error:', error);
  }
  if (navigationRef.isReady()) {
    navigationRef.reset({index: 0, routes: [{name: 'Login'}]});
  }
  setTimeout(() => {
    loggingOut = false;
  }, 3000);
};

export {clearSession};

const showAuthAlert = (status, message) => {
  const now = Date.now();
  if (now - lastAuthAlertTime < 1500) {
    return;
  }
  lastAuthAlertTime = now;
  if (status === 401) {
    Alert.alert(
      i18next.t('auth_expired_title', 'Phiên đăng nhập hết hạn'),
      i18next.t(
        'auth_expired_body',
        'Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.',
      ),
    );
  } else if (status === 403) {
    Alert.alert(
      i18next.t('auth_forbidden', 'Không có quyền truy cập'),
      message ||
        i18next.t(
          'auth_forbidden_body',
          'Bạn không có quyền thực hiện thao tác này.',
        ),
    );
  }
};

const apiClient = axios.create();

apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.token = token;
    config.headers['x-access-token'] = token;
  } else {
    delete config.headers.Authorization;
    delete config.headers.token;
    delete config.headers['x-access-token'];
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status;
    if (status === 401 && !loggingOut) {
      showAuthAlert(status);
      clearSession();
    } else if (status === 403) {
      showAuthAlert(status, error?.response?.data?.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
