import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  Animated,
  TextInput,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import {useDispatch} from 'react-redux';
import {setAuthData} from '../redux/AuthSlice';
import {
  API,
  BASE_URL,
  LOGIN_URL,
  PORT,
  V1,
  VERSION,
  APP,
} from '../utils/constans';
import CheckBox from '@react-native-community/checkbox';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  NotificationServices,
  requestUserPermission,
} from '../utils/notification/PushNotifications';

import OptimizedLoader from '../components/OptimizedLoader';
import {DarkModeToggle} from '../components';
import {useTheme} from '../hooks/useTheme';

const LOGIN_GRADIENT = ['#081120', '#0f766e', '#1d4ed8'];
const CARD_BORDER_DARK = 'rgba(255, 255, 255, 0.12)';
const CARD_BORDER_LIGHT = 'rgba(15, 23, 42, 0.08)';

const Login = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {colors, isDarkMode} = useTheme();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [badUserName, setBadUserName] = useState('');
  const [badPassword, setBadPassword] = useState('');
  const [secury, setSecury] = useState(false);
  const [visible, setVisible] = useState(false);
  const [savePass, setSavePass] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

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

  const checkLanguage = useCallback(async () => {
    const lang = await getLanguage();
    if (lang != null) {
      i18next.changeLanguage(lang);
    }
  }, []);

  const fetchData = useCallback(async () => {
    const userIF = await getUserIF();
    if (userIF != null) {
      setUserName(userIF.username || '');
      setPassword(userIF.password || '');
      setSavePass(true);
    }
  }, []);

  useEffect(() => {
    checkLanguage();
    fetchData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkLanguage, fetchData, fadeAnim, slideAnim]);

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

  const hasFirstLoginFlag = userData => {
    return Boolean(
      userData?.must_change_password ||
        userData?.change_password_required ||
        userData?.force_change_password ||
        userData?.is_first_login ||
        userData?.require_password_change,
    );
  };

  const handleSaveLoginInfo = async (username, plainPassword) => {
    try {
      const userIF = {
        username,
        password: plainPassword,
      };
      await AsyncStorage.setItem('USERINFO', JSON.stringify(userIF));
    } catch (error) {
      console.error('Error while saving login info:', error);
    }
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setVisible(true);
    try {
      const user = {
        user_name: userName,
        password: password,
      };
      const login = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${LOGIN_URL}${APP}`,
        user,
      );

      if (!login?.data?.success) {
        const errorMessage = login?.data?.message || t('Login failed');
        Alert.alert(t('Login Error'), errorMessage);
        if (errorMessage.includes('Password')) {
          setBadPassword(errorMessage);
        } else {
          setBadUserName(errorMessage);
        }
        return;
      }

      const userData = login?.data?.data;
      const token = login?.data?.token;
      const needsPasswordChange = hasFirstLoginFlag(userData);

      await AsyncStorage.setItem('userInfor', JSON.stringify(userData));
      await AsyncStorage.setItem(
        'FIRST_LOGIN_REQUIRED',
        JSON.stringify(needsPasswordChange),
      );
      dispatch(setAuthData(login?.data));

      if (needsPasswordChange) {
        navigation.replace('FirstLoginPassword', {
          token,
          userInfo: userData,
          username: userName,
          currentPassword: password,
          savePass,
        });
        return;
      }

      if (savePass) {
        await handleSaveLoginInfo(userName, password);
      }

      const os = Platform.OS;
      if (os === 'android') {
        NotificationServices();
        requestUserPermission(login.data.data);
      }
      navigation.replace('Main');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || t('networkError');
      showAlert(errorMessage);
    } finally {
      setVisible(false);
    }
  };

  const handlePressOutsideTextInput = () => {
    Keyboard.dismiss();
  };

  const inputBackgroundColor = isDarkMode
    ? 'rgba(255,255,255,0.04)'
    : colors.backgroundSecondary;
  const userNameInputState = {
    backgroundColor: inputBackgroundColor,
    borderColor: badUserName ? colors.error : colors.border,
  };
  const passwordInputState = {
    backgroundColor: inputBackgroundColor,
    borderColor: badPassword ? colors.error : colors.border,
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={LOGIN_GRADIENT}
        style={styles.heroBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      <View style={styles.darkModeToggleContainer}>
        <DarkModeToggle size="small" showLabel={false} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={handlePressOutsideTextInput}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <View style={styles.heroSection}>
                <View style={styles.logoWrap}>
                  <Image
                    source={require('../assets/images/daihatsu-metal-logo.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.brandName}>{t('hrm', 'HRM Metal')}</Text>
                <Text style={styles.welcomeSubtitle}>
                  {t('Login w', 'Đăng nhập bằng tài khoản công ty của bạn')}
                </Text>
              </View>

              <View
                style={[
                  styles.formShell,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isDarkMode
                      ? CARD_BORDER_DARK
                      : CARD_BORDER_LIGHT,
                  },
                ]}>
                <Text style={[styles.formTitle, {color: colors.text}]}>
                  {t('Login', 'Đăng nhập')}
                </Text>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      userNameInputState,
                      badUserName ? styles.inputError : null,
                    ]}>
                    <Icon
                      name="person-circle-outline"
                      size={22}
                      color={badUserName ? colors.error : colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={t('Username or Email', 'Tên đăng nhập')}
                      value={userName}
                      onChangeText={setUserName}
                      style={[styles.input, {color: colors.text}]}
                      placeholderTextColor={colors.placeholder}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                  {!!badUserName && (
                    <View style={styles.errorContainer}>
                      <Icon
                        name="alert-circle"
                        size={15}
                        color={colors.error}
                      />
                      <Text style={[styles.errorText, {color: colors.error}]}>
                        {badUserName}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      passwordInputState,
                      badPassword ? styles.inputError : null,
                    ]}>
                    <Icon
                      name="lock-closed"
                      size={22}
                      color={badPassword ? colors.error : colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={t('Password', 'Mật khẩu')}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!secury}
                      style={[styles.input, {color: colors.text}]}
                      placeholderTextColor={colors.placeholder}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setSecury(!secury)}
                      activeOpacity={0.7}>
                      <Icon
                        name={secury ? 'eye' : 'eye-off'}
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                  {!!badPassword && (
                    <View style={styles.errorContainer}>
                      <Icon
                        name="alert-circle"
                        size={15}
                        color={colors.error}
                      />
                      <Text style={[styles.errorText, {color: colors.error}]}>
                        {badPassword}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <View style={styles.saveLoginOption}>
                    <CheckBox
                      disabled={false}
                      value={savePass}
                      onValueChange={newValue => setSavePass(newValue)}
                      tintColors={{true: colors.primary, false: colors.border}}
                      style={styles.checkbox}
                    />
                    <Text style={[styles.optionText, {color: colors.text}]}>
                      {t('Save Login', 'Lưu đăng nhập')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    visible && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={visible}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={
                      visible
                        ? [colors.border, colors.border]
                        : [colors.primary, colors.primary2]
                    }
                    style={styles.loginButtonGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}>
                    {visible ? (
                      <View style={styles.loadingContainer}>
                        <OptimizedLoader visible={visible} />
                        <Text style={styles.loginButtonText}>
                          {t('Signing in...', 'Đang đăng nhập...')}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Icon
                          name="log-in"
                          size={20}
                          color="#fff"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.loginButtonText}>
                          {t('Login', 'Đăng nhập')}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  darkModeToggleContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 28,
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 20,
  },
  heroSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 18,
  },
  logoWrap: {
    width: 92,
    height: 92,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    marginTop: 16,
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  formShell: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  inputError: {
    backgroundColor: 'rgba(255,59,48,0.08)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 2,
  },
  errorText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 2,
    marginBottom: 18,
  },
  saveLoginOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    margin: 0,
    padding: 0,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.9,
  },
  loginButtonGradient: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 2,
  },
});
