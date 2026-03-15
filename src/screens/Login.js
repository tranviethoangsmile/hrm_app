import React, {useEffect, useState, useCallback, useMemo} from 'react';
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
import {API, BASE_URL, LOGIN_URL, PORT, V1, VERSION} from '../utils/constans';
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
import {SIZES} from '../config/theme';

const {width, height} = Dimensions.get('window');

// Đồng bộ với Splash / DependentSupportAmount
const LIGHT_GRADIENT = ['#667eea', '#764ba2'];
const DARK_GRADIENT = ['#1a1a2e', '#2d1b4e', '#16213e'];

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

  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);

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
      setUserName(userIF.username);
      setPassword(userIF.password);
      setSavePass(true);
    }
  }, []);

  useEffect(() => {
    checkLanguage();
    fetchData();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkLanguage, fetchData, fadeAnim, slideAnim, scaleAnim]);

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
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Dark Mode Toggle - Top Right */}
      <View style={styles.darkModeToggleContainer}>
        <DarkModeToggle size="small" showLabel={false} />
      </View>

      {/* Background gradient - đồng bộ với Splash */}
      <LinearGradient
        colors={isDarkMode ? DARK_GRADIENT : LIGHT_GRADIENT}
        style={styles.animatedBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

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
                  transform: [{translateY: slideAnim}, {scale: scaleAnim}],
                },
              ]}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Animated.View
                  style={[styles.logoContainer, {opacity: fadeAnim}]}>
                  <View style={styles.logoWrap}>
                    <Image
                      source={require('../assets/images/daihatsu-metal-logo.jpg')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.textContainer, {opacity: fadeAnim}]}>
                  <Text style={styles.welcomeTitle}>{t('Welcome Back')}</Text>
                  <Text style={styles.welcomeSubtitle}>
                    {t('Sign in to continue')}
                  </Text>
                </Animated.View>
              </View>

              {/* Login Form */}
              <Animated.View style={[styles.formSection, {opacity: fadeAnim}]}>
                <View style={[styles.formCard, {backgroundColor: colors.surface}]}>
                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: badUserName ? colors.error : colors.border,
                        },
                        badUserName ? styles.inputError : null,
                      ]}>
                      <Icon
                        name="person-circle-outline"
                        size={24}
                        color={badUserName ? colors.error : colors.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder={t('Username or Email')}
                        value={userName}
                        onChangeText={setUserName}
                        style={[styles.input, {color: colors.text}]}
                        placeholderTextColor={colors.placeholder}
                      />
                    </View>
                    {!!badUserName && (
                      <Animated.View
                        style={[styles.errorContainer, {opacity: fadeAnim}]}>
                        <Icon
                          name="alert-circle"
                          size={16}
                          color={colors.error}
                        />
                        <Text style={[styles.errorText, {color: colors.error}]}>{badUserName}</Text>
                      </Animated.View>
                    )}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: badPassword ? colors.error : colors.border,
                        },
                        badPassword ? styles.inputError : null,
                      ]}>
                      <Icon
                        name="lock-closed"
                        size={24}
                        color={badPassword ? colors.error : colors.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder={t('Password')}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!secury}
                        style={[styles.input, {color: colors.text}]}
                        placeholderTextColor={colors.placeholder}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setSecury(!secury)}
                        activeOpacity={0.7}>
                        <Icon
                          name={secury ? 'eye' : 'eye-off'}
                          size={20}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                    {!!badPassword && (
                      <Animated.View
                        style={[styles.errorContainer, {opacity: fadeAnim}]}>
                        <Icon
                          name="alert-circle"
                          size={16}
                          color={colors.error}
                        />
                        <Text style={[styles.errorText, {color: colors.error}]}>{badPassword}</Text>
                      </Animated.View>
                    )}

                    {/* Save Login Option */}
                    <View style={styles.saveLoginOption}>
                      <CheckBox
                        disabled={false}
                        value={savePass}
                        onValueChange={newValue => setSavePass(newValue)}
                        tintColors={{true: colors.primary, false: colors.border}}
                        style={styles.checkbox}
                      />
                      <Text style={[styles.optionText, {color: colors.text}]}>{t('Save Login')}</Text>
                    </View>
                  </View>

                  {/* Login Button */}
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
                          : isDarkMode ? [colors.primary, colors.primary2] : LIGHT_GRADIENT
                      }
                      style={styles.loginButtonGradient}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}>
                      {visible ? (
                        <View style={styles.loadingContainer}>
                          <OptimizedLoader visible={visible} />
                          <Text style={styles.loginButtonText}>
                            {t('Signing in...')}
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
                            {t('Login')}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Forgot Password */}
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => navigation.navigate('Forget')}
                    activeOpacity={0.7}>
                    <Text style={[styles.forgotPasswordText, {color: colors.primary}]}>
                      {t('Forgot Password?')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
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
  animatedBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  textContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '400',
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  formCard: {
    borderRadius: SIZES.radius + 4,
    padding: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: SIZES.inputHeight + 4,
  },
  inputError: {
    backgroundColor: 'rgba(255,59,48,0.08)',
  },
  inputIcon: {
    marginRight: 12,
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
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  saveLoginOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  checkbox: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: SIZES.radius + 2,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  darkModeToggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 40,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
