import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const ChangePassword = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const renderField = ({
    label,
    value,
    onChangeText,
    secure,
    onToggle,
    autoFocus,
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        <TextInput
          style={[styles.input, {color: colors.text}]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!secure}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
        />
        <TouchableOpacity onPress={onToggle} hitSlop={10}>
          <Icon
            name={secure ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleSubmit = () => {
    if (!current) {
      Alert.alert(t('changepassword.title'), t('changepassword.current_required'));
      return;
    }
    if (!newPass) {
      Alert.alert(t('changepassword.title'), t('changepassword.new_required'));
      return;
    }
    if (newPass.length < 6) {
      Alert.alert(t('changepassword.title'), t('changepassword.new_short'));
      return;
    }
    if (newPass !== confirm) {
      Alert.alert(t('changepassword.title'), t('changepassword.mismatch'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t('changepassword.success_title'),
        t('changepassword.success_msg'),
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    }, 800);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header
        title={t('changepassword.title')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {renderField({
          label: t('changepassword.current'),
          value: current,
          onChangeText: setCurrent,
          secure: showCurrent,
          onToggle: () => setShowCurrent(!showCurrent),
          autoFocus: true,
        })}
        {renderField({
          label: t('changepassword.new'),
          value: newPass,
          onChangeText: setNewPass,
          secure: showNew,
          onToggle: () => setShowNew(!showNew),
        })}
        {renderField({
          label: t('changepassword.confirm'),
          value: confirm,
          onChangeText: setConfirm,
          secure: showConfirm,
          onToggle: () => setShowConfirm(!showConfirm),
        })}

        <TouchableOpacity
          style={[styles.submitBtn, {backgroundColor: colors.primary}]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{t('changepassword.submit')}</Text>
          )}
        </TouchableOpacity>

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon
            name="cloud-upload-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('changepassword.pending')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 50,
    marginTop: 8,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ChangePassword;
