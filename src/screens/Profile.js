/* eslint-disable react-hooks/exhaustive-deps */
// Profile.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import SelectDate from '../components/SelectDate';
import {Card} from 'react-native-elements';
import moment from 'moment';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  USER_URL,
  CHECKIN,
  SEARCH,
} from '../utils/Strings';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import UploadAvatar from '../components/UploadAvatar';
const Profile = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const user_id = authData?.data?.data?.id;
  const [userInfo, setUserInfo] = useState({});
  const [userCheckin, setUserCheckin] = useState([]);
  const [today, setToday] = useState(moment().format('YYYY-MM-DD'));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalUpAvataVisible, setIsModalUpAvataVisible] = useState(false);

  const year = moment(today).format('YYYY');
  const month = moment(today).format('MM');
  const totalWorkTime = userCheckin.reduce((total, checkin) => {
    if (!checkin.is_weekend) {
      return total + checkin.work_time;
    }
    return total;
  }, 0);
  const totalOverTime = userCheckin.reduce(
    (total, checkin) => total + checkin.over_time,
    0,
  );
  const totalWorkTimeWeekend = userCheckin.reduce((total, checkin) => {
    if (checkin.is_weekend) {
      return total + checkin.work_time;
    }
    return total;
  }, 0);
  const handleUploadAvatar = () => {
    setIsModalUpAvataVisible(!isModalUpAvataVisible);
  };
  const get_checkin_of_user = async () => {
    const res = await axios.post(
      `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${SEARCH}`,
      {
        user_id: user_id,
        date: today,
      },
    );

    if (res?.data?.success) {
      setUserCheckin(res?.data?.data);
    } else {
      Alert.alert(t('user_no_check_ins'));
    }
  };

  const get_user_info = async () => {
    const res = await axios.get(
      `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}/${user_id}`,
    );
    if (res?.data?.success) {
      setUserInfo(res.data.data);
    } else {
      console.log(res?.data?.message);
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
    get_checkin_of_user();
    checkLanguage();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Card containerStyle={styles.card}>
        <View style={styles.infoViewContainer}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleUploadAvatar}>
              <Image
                source={
                  userInfo.avatar
                    ? {uri: userInfo.avatar}
                    : require('../assets/images/avatar.jpg')
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.label, {fontSize: 20, fontWeight: '500'}]}>
              {userInfo.name}
            </Text>
            <Text style={styles.label}>{userInfo.email}</Text>
            <Text style={styles.label}>
              {userInfo.employee_id} - {userInfo.role} - {userInfo.position}
            </Text>
          </View>
        </View>
      </Card>
      <Card containerStyle={styles.card}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>{t('m')}</Text>
          <Text style={styles.headerText}>{t('wt')}</Text>
          <Text style={styles.headerText}>{t('ot')}</Text>
          <Text style={styles.headerText}>{t('wend')}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text
            onPress={() => {
              setIsModalVisible(!isModalVisible);
            }}
            style={styles.cellText}>
            {year}/{month}
          </Text>
          <Text style={styles.cellText}>{totalWorkTime}</Text>
          <Text style={styles.cellText}>{totalOverTime}</Text>
          <Text style={styles.cellText}>{totalWorkTimeWeekend}</Text>
        </View>
      </Card>
      <Text style={styles.subtitle}>{t('c-i-h')}</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>{t('D')}</Text>
        <Text style={styles.headerText}>{t('I')}</Text>
        <Text style={styles.headerText}>{t('O')}</Text>
        <Text style={styles.headerText}>{t('wt')}</Text>
        <Text style={styles.headerText}>{t('S')}</Text>
        <Text style={styles.headerText}>{t('ot')}</Text>
      </View>
      <ScrollView>
        {
          (userCheckin.sort((a, b) => new Date(b.date) - new Date(a.date)),
          userCheckin.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: item.is_paid_leave
                    ? THEME_COLOR
                    : 'transparent',
                },
              ]}>
              <Text style={styles.cellText}>{item.date}</Text>
              <Text style={styles.cellText}>{item.time_in}</Text>
              <Text style={styles.cellText}>{item.time_out}</Text>
              <Text style={styles.cellText}>{item.work_time}</Text>
              <Text style={styles.cellText}>{t(item.work_shift)}</Text>
              <Text style={styles.cellText}>{item.over_time}</Text>
            </View>
          )))
        }
      </ScrollView>
      <SelectDate
        visible={isModalVisible}
        onClose={() => setIsModalVisible(!isModalVisible)}
        setSelectedDate={setToday}
        getCheckin={get_checkin_of_user}
      />
      <UploadAvatar
        visible={isModalUpAvataVisible}
        closeModal={() => {
          setIsModalUpAvataVisible(!isModalUpAvataVisible);
        }}
        t={t}
        user_id={user_id}
        avatar_url={userInfo.avatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 5,
    padding: 10,
  },
  infoViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  info: {
    marginBottom: 5,
    fontSize: 16,
    color: '#555',
  },
  divider: {
    marginVertical: 5,
  },

  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    color: THEME_COLOR,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
});

export default Profile;
