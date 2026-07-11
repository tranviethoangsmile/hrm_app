import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';

const LOGIN_GRADIENT = ['#081120', '#0f766e', '#1d4ed8'];

const FirstLoginPassword = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {colors, isDarkMode} = useTheme();
  const userInfo = route.params?.userInfo || {};

  const [currentPassword, setCurrentPassword] = useState(
    route.params?.currentPassword || '',
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const passwordRules = useMemo(
    () => [
      {
        label: t('first_login.rule_length', 'Tối thiểu 8 ký tự'),
        passed: newPassword.length >= 8,
      },
      {
        label: t('first_login.rule_number', 'Có ít nhất 1 số'),
        passed: /\d/.test(newPassword),
      },
      {
        label: t('first_login.rule_match', 'Khớp với xác nhận'),
        passed: !!newPassword && newPassword === confirmPassword,
      },
    ],
    [confirmPassword, newPassword, t],
  );

  const validate = () => {
    if (!currentPassword.trim()) {
      setError(t('first_login.current_required', 'Nhập mật khẩu hiện tại'));
      return false;
    }
    if (!newPassword.trim()) {
      setError(t('first_login.new_required', 'Nhập mật khẩu mới'));
      return false;
    }
    if (newPassword.length < 8) {
      setError(
        t('first_login.new_short', 'Mật khẩu mới phải có ít nhất 8 ký tự'),
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError(t('first_login.mismatch', 'Xác nhận mật khẩu không khớp'));
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      Alert.alert(
        t('first_login.pending_title', 'Chờ BE'),
        t(
          'first_login.pending_body',
          'Màn hình đã sẵn sàng. Gắn API đổi mật khẩu ở đây khi BE hoàn tất.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    navigation.replace('Login');
  };

  const renderInput = (
    label,
    value,
    onChangeText,
    secure,
    toggleSecure,
    icon,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, {color: colors.textSecondary}]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.04)'
              : colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}>
        <Icon
          name={icon}
          size={22}
          color={colors.primary}
          style={styles.inputIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          style={[styles.input, {color: colors.text}]}
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={toggleSecure}
          activeOpacity={0.7}>
          <Icon
            name={secure ? 'eye-off' : 'eye'}
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#050816' : '#f4f7fb'},
      ]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={LOGIN_GRADIENT}
        style={StyleSheet.absoluteFill}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      <View
        style={[
          styles.scrim,
          {
            backgroundColor: isDarkMode
              ? 'rgba(2, 6, 23, 0.84)'
              : 'rgba(255,255,255,0.9)',
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <View style={styles.heroBadge}>
                  <Icon
                    name="shield-checkmark-outline"
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.heroBadgeText}>
                    {t('first_login.badge', 'Bắt buộc lần đầu')}
                  </Text>
                </View>
                <Text style={styles.title}>
                  {t('first_login.title', 'Đổi mật khẩu lần đầu')}
                </Text>
                <Text style={styles.subtitle}>
                  {t(
                    'first_login.subtitle',
                    'Tài khoản {name} cần đặt mật khẩu mới trước khi tiếp tục.',
                  ).replace(
                    '{name}',
                    userInfo?.name || userInfo?.user_name || 'bạn',
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.formShell,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(12, 18, 32, 0.92)'
                      : 'rgba(255,255,255,0.96)',
                  },
                ]}>
                {renderInput(
                  t('first_login.current', 'Mật khẩu hiện tại'),
                  currentPassword,
                  setCurrentPassword,
                  secureCurrent,
                  () => setSecureCurrent(prev => !prev),
                  'lock-closed-outline',
                )}
                {renderInput(
                  t('first_login.new', 'Mật khẩu mới'),
                  newPassword,
                  setNewPassword,
                  secureNew,
                  () => setSecureNew(prev => !prev),
                  'key-outline',
                )}
                {renderInput(
                  t('first_login.confirm', 'Xác nhận mật khẩu'),
                  confirmPassword,
                  setConfirmPassword,
                  secureConfirm,
                  () => setSecureConfirm(prev => !prev),
                  'checkmark-done-outline',
                )}

                {!!error && (
                  <View style={styles.errorRow}>
                    <Icon name="alert-circle" size={16} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.rulesBlock}>
                  <Text style={styles.rulesTitle}>
                    {t('first_login.rules_title', 'Quy tắc mật khẩu')}
                  </Text>
                  {passwordRules.map(item => (
                    <View key={item.label} style={styles.ruleItem}>
                      <Icon
                        name={
                          item.passed ? 'checkmark-circle' : 'ellipse-outline'
                        }
                        size={16}
                        color={item.passed ? '#22c55e' : '#94a3b8'}
                      />
                      <Text style={styles.ruleText}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}>
                  <LinearGradient
                    colors={
                      loading ? ['#64748b', '#64748b'] : ['#0ea5e9', '#2563eb']
                    }
                    style={styles.submitGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}>
                    <Text style={styles.submitText}>
                      {loading
                        ? t('Saving...', 'Đang lưu...')
                        : t('first_login.save', 'Cập nhật mật khẩu')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={goBackToLogin}
                  activeOpacity={0.8}>
                  <Text style={[styles.backText, {color: colors.primary}]}>
                    {t('back', 'Quay lại đăng nhập')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FirstLoginPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
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
    gap: 18,
  },
  heroSection: {
    gap: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  formShell: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    minHeight: 54,
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
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  rulesBlock: {
    marginTop: 2,
    marginBottom: 16,
    gap: 8,
  },
  rulesTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  submitDisabled: {
    opacity: 0.92,
  },
  submitGradient: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
