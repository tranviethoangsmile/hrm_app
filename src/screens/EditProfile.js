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
import {useUserProfile} from '../hooks/useUserProfile';

const EditProfile = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const {userInfo} = useUserProfile();
  const [phone, setPhone] = useState(userInfo?.phone || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [address, setAddress] = useState(userInfo?.address || '');
  const [loading, setLoading] = useState(false);
  const fullName = userInfo?.full_name || userInfo?.name || '';

  const renderField = ({label, value, onChangeText, placeholder, editable}) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: editable ? colors.surface : colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}>
        <TextInput
          style={[styles.input, {color: colors.text}]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          editable={editable}
        />
        {!editable ? (
          <Icon name="lock-closed-outline" size={18} color={colors.textTertiary} />
        ) : null}
      </View>
      {!editable ? (
        <Text style={[styles.readOnlyHint, {color: colors.textTertiary}]}>
          {t('editprofile.read_only')}
        </Text>
      ) : null}
    </View>
  );

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(t('editprofile.success_title'), t('editprofile.success_msg'), [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    }, 800);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('editprofile.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {renderField({
          label: t('editprofile.full_name'),
          value: fullName,
          editable: false,
        })}
        {renderField({
          label: t('editprofile.phone'),
          value: phone,
          onChangeText: setPhone,
          placeholder: '0901 234 567',
          editable: true,
        })}
        {renderField({
          label: t('editprofile.email'),
          value: email,
          onChangeText: setEmail,
          placeholder: 'name@company.com',
          editable: true,
        })}
        {renderField({
          label: t('editprofile.address'),
          value: address,
          onChangeText: setAddress,
          placeholder: t('idcard.address'),
          editable: true,
        })}

        <TouchableOpacity
          style={[styles.saveBtn, {backgroundColor: colors.primary}]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>{t('editprofile.save')}</Text>
          )}
        </TouchableOpacity>

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('editprofile.pending')}
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
  readOnlyHint: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 50,
    marginTop: 8,
  },
  saveText: {
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

export default EditProfile;