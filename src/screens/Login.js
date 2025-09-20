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
import {
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
  BACKGROUND_COLOR,
  LIGHT_GRAY,
  ERROR_COLOR,
} from '../utils/Colors';

import OptimizedLoader from '../components/OptimizedLoader';
import {DarkModeToggle} from '../components';
import {useTheme} from '../hooks/useTheme';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';

const {width, height} = Dimensions.get('window');

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
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Dark Mode Toggle - Top Right */}
      <View style={styles.darkModeToggleContainer}>
        <DarkModeToggle size="small" showLabel={false} />
      </View>

      {/* Animated Background */}
      <LinearGradient
        colors={isDarkMode ? ['#1a1a2e', '#16213e', '#0f3460', '#533483'] : ['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        style={styles.animatedBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      {/* Floating Orbs */}
      <Animated.View style={[styles.orb1, {opacity: fadeAnim}]} />
      <Animated.View style={[styles.orb2, {opacity: fadeAnim}]} />
      <Animated.View style={[styles.orb3, {opacity: fadeAnim}]} />

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
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.logoGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}>
                    <Image
                      source={require('../assets/images/daihatsu-metal-logo.jpg')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </Animated.View>

                <Animated.View
                  style={[styles.textContainer, {opacity: fadeAnim}]}>
                  <Text style={[styles.welcomeTitle, {color: colors.text}]}>{t('Welcome Back')}</Text>
                  <Text style={[styles.welcomeSubtitle, {color: colors.textSecondary}]}>
                    {t('Sign in to continue')}
                  </Text>
                </Animated.View>
              </View>

              {/* Login Form */}
              <Animated.View style={[styles.formSection, {opacity: fadeAnim}]}>
                <LinearGradient
                  colors={isDarkMode ? ['rgba(28,28,30,0.95)', 'rgba(28,28,30,0.9)'] : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
                  style={styles.formCard}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}>
                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: isDarkMode ? '#2C2C2E' : '#f8f9fa',
                          borderColor: badUserName ? colors.error : 'transparent',
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
                        style={[styles.input, {color: isDarkMode ? '#FFFFFF' : '#000000'}]}
                        placeholderTextColor={isDarkMode ? '#8E8E93' : 'rgba(0,0,0,0.5)'}
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
                          backgroundColor: isDarkMode ? '#2C2C2E' : '#f8f9fa',
                          borderColor: badPassword ? colors.error : 'transparent',
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
                        style={[styles.input, {color: isDarkMode ? '#FFFFFF' : '#000000'}]}
                        placeholderTextColor={isDarkMode ? '#8E8E93' : 'rgba(0,0,0,0.5)'}
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
                          ? ['#ccc', '#ccc']
                          : isDarkMode ? [colors.primary, colors.primary2] : [THEME_COLOR, THEME_COLOR_2]
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
                </LinearGradient>
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
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -50,
  },
  orb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 100,
    left: -30,
  },
  orb3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: height * 0.3,
    right: 50,
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
    marginBottom: 24,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 15},
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: ERROR_COLOR,
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
    color: ERROR_COLOR,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  saveLoginOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    height: 56,
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
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    backdropFilter: 'blur(10px)',
  },
});
