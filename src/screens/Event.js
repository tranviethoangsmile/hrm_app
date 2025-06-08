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
import Header from '../components/common/Header';

const Event = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };

  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const {t} = useTranslation();
  const navigation = useNavigation();
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
        showAlert('is_checked');
        navigation.navigate('Main');
      }
    } catch (error) {
      console.log(error.message);
      // showAlert('contactAdmin');
      // navigation.navigate('Main');
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
        showAlert('is_checked');
        navigation.navigate('Main');
      }
    } catch (error) {
      console.log(error.message);
      // showAlert('contactAdmin');
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
        showAlert('not.event');
        // navigation.navigate('Main');
      }
    } catch (error) {
      showAlert('not.event');
      // navigation.navigate('Main');
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
      showAlert('contactAdmin');
      // navigation.navigate('Main');
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
        showAlert('unSuccess');
        navigation.navigate('Main');
      }
      showAlert('success');
      navigation.navigate('Main');
    } catch (error) {
      showAlert(error.message);
      // navigation.navigate('Main');
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
        showAlert('unSuccess');
        navigation.navigate('Main');
      }
      showAlert('success');
      navigation.navigate('Main');
    } catch (error) {
      showAlert('unSuccess');
      // navigation.navigate('Main');
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title={t('event.title', 'Sự kiện')}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        oardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <Card containerStyle={styles.card}>
          <View style={styles.infoViewContainer}>
            <TouchableOpacity style={styles.avatarContainer}>
              <Image
                source={
                  userInfo.avatar
                    ? {uri: userInfo.avatar}
                    : require('../assets/images/avatar.jpg')
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{userInfo.name}</Text>
              <Text style={styles.label}>{userInfo.email}</Text>
              <Text style={styles.label}>
                {userInfo.employee_id} - {userInfo.role} - {userInfo.position}
              </Text>
            </View>
          </View>
        </Card>
        {isSafetyCheckEvent ? (
          <Card containerStyle={styles.card}>
            <ScrollView>
              <Text style={styles.eventName}>{eventName}</Text>
              <View style={styles.descriptionContainer}>
                <Text style={styles.eventDescription}>{eventDescription}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('safety.c')}</Text>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    tintColors={{true: THEME_COLOR, false: 'black'}}
                    value={is_safety}
                    onValueChange={handleCheckboxSafety}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>{t('is_safety')}</Text>
                </View>
                {!is_safety && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.label}>{t('s.help')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('feedback')}
                      placeholderTextColor={THEME_COLOR_2}
                      multiline
                      numberOfLines={5}
                      onChangeText={txt => setFeedback(txt)}
                    />
                  </View>
                )}
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('at_home')}</Text>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    tintColors={{true: THEME_COLOR, false: 'black'}}
                    value={is_at_home}
                    onValueChange={() => setIs_at_home(!is_at_home)}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>{t('y')}</Text>
                </View>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('can_work')}</Text>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    tintColors={{true: THEME_COLOR, false: 'black'}}
                    value={is_can_work}
                    onValueChange={() => setIs_can_work(!is_can_work)}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>{t('y')}</Text>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleSafetyConfirm}
                  style={styles.button}>
                  <Text style={styles.buttonText}>{t('confirm.c')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Card>
        ) : (
          <Card containerStyle={styles.card}>
            <Text style={styles.eventName}>{eventName}</Text>
            <Text style={styles.eventDescription}>{eventDescription}</Text>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('isConfirm')}</Text>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  tintColors={{true: THEME_COLOR, false: 'black'}}
                  value={is_confirm}
                  onValueChange={() => {
                    setIsconfirm(!is_confirm);
                  }}
                  style={styles.checkbox}
                />
                <Text style={styles.checkboxLabel}>{t('y')}</Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleConfirmEventCheck}
                style={styles.button}>
                <Text style={styles.buttonText}>{t('confirm.c')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignSelf: 'center',
    elevation: 2,
  },
  descriptionContainer: {
    backgroundColor: THEME_COLOR_2,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 15,
    backgroundColor: BG_COLOR,
    justifyContent: 'center',
  },
  infoViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  label: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  section: {
    // marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    marginHorizontal: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#555',
  },
  feedbackContainer: {
    marginTop: 10,
  },
  input: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
    color: TEXT_COLOR,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  eventName: {
    fontSize: 23,
    fontWeight: 'bold',
    color: THEME_COLOR,
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 18,
    color: 'white',
    marginBottom: 15,
    padding: 2,
    fontWeight: '400',
  },
});

export default Event;
