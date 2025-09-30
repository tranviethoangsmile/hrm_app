/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {Card} from 'react-native-elements';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import ModalMessage from '../components/ModalMessage';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  USER_URL,
  EVENTS,
  GET_ALL,
  SAFETY_CHECK,
  CREATE,
  EVENT_CHECK,
  SEARCH_EVENT_CHECKED,
  SEARCH_SAFETY_CHECKED,
} from '../utils/constans';

const Event = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {colors, isDarkMode} = useTheme();
  const authData = useSelector(state => state.auth);
  const user_id = authData?.data?.data?.id;
  const [userInfo, setUserInfo] = useState({});
  const [is_safety, setIs_safety] = useState(false);
  const [is_at_home, setIs_at_home] = useState(false);
  const [is_can_work, setIs_can_work] = useState(false);
  const [event_id, setEvent_id] = useState('');
  const [feedback, setFeedback] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [is_confirm, setIsconfirm] = useState(false);
  const [isSafetyCheckEvent, setIsSafetyCheckEvent] = useState(true);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };
  const search_event_checked_of_user = async (event_id, user_id) => {
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENT_CHECK}${SEARCH_EVENT_CHECKED}`,
        {
          event_id: event_id,
          user_id: user_id,
        },
      );
      if (response?.data?.success) {
        showMessage('is_checked', 'warning', 1000);
        navigation.navigate('Main');
      }
    } catch (error) {
      showMessage(error.message, 'error', 1000);
    }
  };

  const search_safety_checked_of_user = async (event_id, user_id) => {
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_CHECK}${SEARCH_SAFETY_CHECKED}`,
        {
          event_id: event_id,
          user_id: user_id,
        },
      );
      if (response?.data?.success) {
        showMessage('is_checked', 'warning', 1000);
        navigation.navigate('Main');
      }
    } catch (error) {
      showMessage(error.message || 'contactAdmin', 'error', 1000);
      // navigation.navigate('Main');
    }
  };
  const get_event_detail = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}${GET_ALL}`,
      );
      if (res?.data?.success) {
        setIsSafetyCheckEvent(res.data.data[0].is_safety);
        setEvent_id(res.data.data[0].id);
        setEventName(res.data.data[0].name);
        setEventDescription(res.data.data[0].description);
      } else {
        showMessage('not.event', 'warning', 1000);
        navigation.navigate('Main');
      }
    } catch (error) {
      showMessage(error.message || 'contactAdmin', 'warning', 1000);
      navigation.navigate('Main');
    }
  };
  useEffect(() => {
    if (event_id) {
      if (isSafetyCheckEvent) {
        search_safety_checked_of_user(event_id, user_id);
      } else {
        search_event_checked_of_user(event_id, user_id);
      }
    }
  }, [event_id]);
  const get_user_info = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}/${user_id}`,
      );
      if (!res?.data?.success) {
        throw new Error(res?.data?.message);
      }
      setUserInfo(res.data.data);
    } catch (error) {
      showMessage('contactAdmin', 'warning', 1000);
    }
  };

  const handleSafetyConfirm = async () => {
    try {
      let field;
      if (is_safety) {
        field = {
          user_id: user_id,
          event_id: event_id,
          is_at_home: is_at_home,
          is_can_work: is_can_work,
          is_safety: is_safety,
        };
      } else {
        field = {
          user_id: user_id,
          event_id: event_id,
          is_at_home: is_at_home,
          is_can_work: is_can_work,
          is_safety: is_safety,
          feedback: feedback,
        };
      }
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_CHECK}${CREATE}`,
        {
          ...field,
        },
      );
      if (!result?.data?.success) {
        showMessage('unSuccess', 'warning', 1000);
      }
      showMessage('success', 'warning', 1000);
      navigation.navigate('Main');
    } catch (error) {
      showMessage(error.message || 'contactAdmin', 'warning', 1000);
    }
  };

  const handleConfirmEventCheck = async () => {
    try {
      const field = {
        user_id: user_id,
        event_id: event_id,
        is_confirm: is_confirm,
      };
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENT_CHECK}${CREATE}`,
        {
          ...field,
        },
      );
      if (!result?.data?.success) {
        showMessage('unSuccess', 'warning', 1000);
      }
      showMessage('success', 'success', 1000);
      navigation.navigate('Main');
    } catch (error) {
      showMessage('unSuccess', 'warning', 1000);
    }
  };

  const handleCheckboxSafety = () => {
    setIs_safety(!is_safety);
    setFeedback('');
  };

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    get_user_info();
    get_event_detail();
    checkLanguage();
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header 
        title={eventName || t('event.title', 'Event')} 
        onBack={() => navigation.goBack()} 
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Event Content */}
        <View style={[styles.eventCard, {backgroundColor: colors.surface}]}>
          <Text style={[styles.eventDescription, {color: colors.textSecondary}]}>{eventDescription}</Text>
          {isSafetyCheckEvent ? (
            <View style={styles.formContainer}>
              <View style={[styles.section, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="shield-checkmark" size={20} color={colors.success} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('safety.c')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}>
                  <CheckBox
                    tintColors={{true: colors.success, false: colors.border}}
                    value={is_safety}
                    onValueChange={handleCheckboxSafety}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.checkboxLabel, {color: colors.textSecondary}]}>{t('is_safety')}</Text>
                </TouchableOpacity>
                {!is_safety && (
                  <View style={[styles.feedbackContainer, {borderTopColor: colors.border}]}>
                    <Text style={[styles.inputLabel, {color: colors.text}]}>{t('s.help')}</Text>
                    <TextInput
                      style={[styles.textInput, {backgroundColor: colors.background, borderColor: colors.border, color: colors.text}]}
                      placeholder={t('feedback')}
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={4}
                      onChangeText={txt => setFeedback(txt)}
                      textAlignVertical="top"
                    />
                  </View>
                )}
              </View>
              <View style={[styles.section, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="home" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('at_home')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}>
                  <CheckBox
                    tintColors={{true: colors.primary, false: colors.border}}
                    value={is_at_home}
                    onValueChange={() => setIs_at_home(!is_at_home)}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.checkboxLabel, {color: colors.textSecondary}]}>{t('y')}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.section, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="briefcase" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('can_work')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}>
                  <CheckBox
                    tintColors={{true: colors.primary, false: colors.border}}
                    value={is_can_work}
                    onValueChange={() => setIs_can_work(!is_can_work)}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.checkboxLabel, {color: colors.textSecondary}]}>{t('y')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleSafetyConfirm}
                style={[styles.submitButton, {backgroundColor: colors.primary}]}
                activeOpacity={0.8}>
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{t('confirm.c')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={[styles.section, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('isConfirm')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}>
                  <CheckBox
                    tintColors={{true: colors.primary, false: colors.border}}
                    value={is_confirm}
                    onValueChange={() => setIsconfirm(!is_confirm)}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.checkboxLabel, {color: colors.textSecondary}]}>{t('y')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleConfirmEventCheck}
                style={[styles.submitButton, {backgroundColor: colors.primary}]}
                activeOpacity={0.8}>
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{t('confirm.c')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <ModalMessage
          isVisible={isMessageModalVisible}
          onClose={() => setMessageModalVisible(false)}
          message={messageModal}
          type={messageType}
          t={t}
          duration={duration}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    marginTop: -10,
  },
  eventCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    padding: 24,
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 24,
  },
  formContainer: {
    gap: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    marginRight: 12,
    transform: [{scale: 1.1}],
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  feedbackContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});

export default Event;
