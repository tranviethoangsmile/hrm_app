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
  Button,
  Keyboard,
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
} from '../utils/Strings';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
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
  const [isSafetyCheckEvent, setIsSafetyCheckEvent] = useState(true);

  const get_event_detail = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}${GET_ALL}`,
      );
      if (res?.data?.success) {
        setIsSafetyCheckEvent(res.data.data[0].is_safety);
        setEvent_id(res.data.data[0].id);
      } else {
        showAlert('not.event');
        navigation.navigate('Main');
      }
    } catch (error) {
      showAlert('not.event');
      navigation.navigate('Main');
    }
  };

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
      navigation.navigate('Main');
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

      console.log(field);
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
      navigation.navigate('Main');
    }
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
      <Card containerStyle={styles.card}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('safety.c')}</Text>
            <View style={styles.checkboxContainer}>
              <CheckBox
                tintColors={{true: THEME_COLOR, false: 'black'}}
                value={is_safety}
                onValueChange={() => {
                  setFeedback(''), setIs_safety(!is_safety);
                }}
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
        </TouchableWithoutFeedback>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSafetyConfirm} style={styles.button}>
            <Text style={styles.buttonText}>{t('confirm.c')}</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    borderRadius: 10,
    marginBottom: 20,
  },
  infoViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    color: TEXT_COLOR,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
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
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default Event;
