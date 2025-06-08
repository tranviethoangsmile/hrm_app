import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import {useDispatch} from 'react-redux';
import {setAuthData} from '../redux/AuthSlice';
import {API, BASE_URL, LOGIN_URL, PORT, V1, VERSION} from '../utils/constans';
import CheckBox from '@react-native-community/checkbox';

import {
  NotificationServices,
  requestUserPermission,
} from '../utils/notification/PushNotifications';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import Loader from '../components/Loader';

const {width, height} = Dimensions.get('window');

const Login = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [badUserName, setBadUserName] = useState('');
  const [badPassword, setBadPassword] = useState('');
  const [secury, setSecury] = useState(false);
  const [visible, setVisible] = useState(false);
  const [savePass, setSavePass] = useState(true);

  const showAlert = message => {
    Alert.alert(t('noti'), message);
  };

  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };

  const getUserIF = async () => {
    const userIF = await AsyncStorage.getItem('USERINFO');
    return JSON.parse(userIF);
  };

  const checkLanguage = async () => {
    const lang = await getLanguage();
    if (lang != null) {
      i18next.changeLanguage(lang);
    }
  };

  const fetchData = async () => {
    const userIF = await getUserIF();
    if (userIF != null) {
      setUserName(userIF.username);
      setPassword(userIF.password);
      setSavePass(true);
    }
  };

  useEffect(() => {
    checkLanguage();
    fetchData();
  }, []);

  const validate = () => {
    let isValid = true;
    if (!userName) {
      setBadUserName(t('Please input username'));
      isValid = false;
    } else {
      setBadUserName('');
    }
    if (!password) {
      setBadPassword(t('Please input password'));
      isValid = false;
    } else {
      setBadPassword('');
    }
    return isValid;
  };

  const handleLogin = async () => {
    if (savePass) {
      handleSaveLoginInfo();
    }
    if (validate()) {
      setVisible(true);
      try {
        const user = {
          user_name: userName,
          password: password,
        };
        const login = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${LOGIN_URL}`,
          user,
        );
        if (!login?.data?.success) {
          const errorMessage = login?.data?.message || t('Login failed');
          Alert.alert(t('Login Error'), errorMessage);
          if (errorMessage.includes('Password')) setBadPassword(errorMessage);
          else setBadUserName(errorMessage);
        } else {
          await AsyncStorage.setItem(
            'userInfor',
            JSON.stringify(login.data.data),
          );
          dispatch(setAuthData(login?.data));
          const os = Platform.OS;
          if (os === 'android') {
            NotificationServices();
            requestUserPermission(login.data.data);
          }
          navigation.replace('Main');
        }
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || error?.message || t('networkError');
        showAlert(errorMessage);
      } finally {
        setVisible(false);
      }
    }
  };

  const handleSaveLoginInfo = async () => {
    try {
      const userIF = {
        username: userName,
        password: password,
      };
      await AsyncStorage.setItem('USERINFO', JSON.stringify(userIF));
    } catch (error) {
      console.error('Error while saving login info:', error);
    }
  };

  const handlePressOutsideTextInput = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.modernContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modernKeyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={handlePressOutsideTextInput}>
          <ScrollView
            contentContainerStyle={styles.modernScrollViewContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modernContentContainer}>
              <Image
                source={require('../assets/images/daihatsu-metal-logo.jpg')}
                style={styles.modernLogo}
                resizeMode="contain"
              />
              <Text style={styles.modernTitle}>{t('Login')}</Text>

              <View style={styles.modernFormContainer}>
                <CustomTextInput
                  placeholder={t('Username or Email')}
                  value={userName}
                  onChangeText={setUserName}
                  isValid={!badUserName}
                  inputStyle={styles.modernInput}
                />
                {!!badUserName && (
                  <Text style={styles.modernErrorText}>{badUserName}</Text>
                )}

                <CustomTextInput
                  placeholder={t('Password')}
                  value={password}
                  onChangeText={setPassword}
                  isValid={!badPassword}
                  secureTextEntry={!secury}
                  inputStyle={styles.modernInput}
                />
                {!!badPassword && (
                  <Text style={styles.modernErrorText}>{badPassword}</Text>
                )}

                <View style={styles.checkboxMainContainer}>
                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      disabled={false}
                      value={secury}
                      onValueChange={newValue => setSecury(newValue)}
                      tintColors={{true: THEME_COLOR, false: '#aaa'}}
                    />
                    <Text
                      style={styles.checkboxLabel}
                      onPress={() => setSecury(!secury)}>
                      {t('Show Password')}
                    </Text>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      disabled={false}
                      value={savePass}
                      onValueChange={newValue => setSavePass(newValue)}
                      tintColors={{true: THEME_COLOR, false: '#aaa'}}
                    />
                    <Text
                      style={styles.checkboxLabel}
                      onPress={() => setSavePass(!savePass)}>
                      {t('Save Login')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modernLoginButton}
                  onPress={handleLogin}
                  disabled={visible}>
                  {visible ? (
                    <Loader visible={visible} />
                  ) : (
                    <Text style={styles.modernLoginButtonText}>
                      {t('Login')}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modernForgotPasswordButton}
                  onPress={() => navigation.navigate('Forget')}>
                  <Text style={styles.modernForgotPasswordText}>
                    {t('Forgot Password?')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  modernContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modernKeyboardAvoidingView: {
    flex: 1,
  },
  modernScrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  modernContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modernLogo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: 30,
  },
  modernTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 25,
    textAlign: 'center',
  },
  modernFormContainer: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
  },
  modernInput: {
    height: 55,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: TEXT_COLOR,
  },
  modernErrorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 10,
    paddingLeft: 5,
  },
  checkboxMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: Platform.OS === 'ios' ? 8 : 0,
    fontSize: 14,
    color: TEXT_COLOR,
  },
  modernLoginButton: {
    backgroundColor: THEME_COLOR,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  modernLoginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modernForgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modernForgotPasswordText: {
    color: THEME_COLOR_2,
    fontSize: 14,
    fontWeight: '500',
  },
});
