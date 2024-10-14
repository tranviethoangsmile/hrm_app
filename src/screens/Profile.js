/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
// Profile.js
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
  RefreshControl,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import SelectDate from '../components/SelectDate';
import moment from 'moment';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  USER_URL,
  CHECKIN,
  SEARCH,
} from '../utils/constans';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import UploadAvatar from '../components/UploadAvatar';

const Profile = () => {
  const navigation = useNavigation();
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
  const [refreshing, setRefreshing] = useState(false);
  const [err, setError] = useState('');

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
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    get_checkin_of_user().then(() => setRefreshing(false));
  }, []);
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
      setError('');
      const sortedCheckin = res?.data?.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      setUserCheckin(sortedCheckin);
    } else {
      setError('user_no_check_ins');
    }
  };

  const renderCheckin = ({item}) => {
    return (
      <View
        style={[
          styles.checkinDetail,
          {
            backgroundColor:
              item.work_shift === 'NIGHT' ? 'rgba(0, 0, 0, 0.1)' : 'white',
          },
        ]}>
        <View
          key={item.id}
          style={[
            styles.tableRow,
            {
              backgroundColor: item.is_paid_leave ? THEME_COLOR : 'transparent',
            },
          ]}>
          <Text style={[styles.cellText]}>{item.date}</Text>
          <Text style={[styles.cellText]}>{item.time_in}</Text>
          <Text style={[styles.cellText]}>{item.time_out}</Text>
          <Text style={[styles.cellText]}>{item.work_time}</Text>
          <Text style={[styles.cellText]}>{t(item.work_shift)}</Text>
          <Text style={[styles.cellText]}>{item.over_time}</Text>
        </View>
      </View>
    );
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
      <View>
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
            <Text style={styles.nameText}>{userInfo.name}</Text>
            <Text style={styles.label}>
              {userInfo.employee_id} - {userInfo.role} - {userInfo.position}
            </Text>
            <Text style={styles.label}>{userInfo.email}</Text>
          </View>
        </View>
        <View style={styles.tableView}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText1}>{t('m')}</Text>
            <Text style={styles.headerText1}>{t('wt')}</Text>
            <Text style={styles.headerText1}>{t('ot')}</Text>
            <Text style={styles.headerText1}>{t('wend')}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              onPress={() => {
                setIsModalVisible(!isModalVisible);
              }}
              style={styles.cellText1}>
              {year}/{month}
            </Text>
            <Text style={styles.cellText1}>{totalWorkTime}</Text>
            <Text style={styles.cellText1}>{totalOverTime}</Text>
            <Text style={styles.cellText1}>{totalWorkTimeWeekend}</Text>
          </View>
        </View>
      </View>
      <View style={styles.checkinContainer}>
        <View style={styles.btnSalary}>
          <Text style={styles.subtitle}>{t('c-i-h')}</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Salary');
            }}
            style={styles.showSalaryBtn}>
            <Icon name="arrow-right" color={THEME_COLOR} size={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>{t('D')}</Text>
          <Text style={styles.headerText}>{t('I')}</Text>
          <Text style={styles.headerText}>{t('O')}</Text>
          <Text style={styles.headerText}>{t('wt')}</Text>
          <Text style={styles.headerText}>{t('S')}</Text>
          <Text style={styles.headerText}>{t('ot')}</Text>
        </View>
        {err ? <Text style={styles.errorText}>{t(err)}</Text> : null}
        <FlatList
          data={userCheckin}
          renderItem={renderCheckin}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  checkinContainer: {
    flex: 1,
  },
  checkinDetail: {
    width: '100%',
    marginVertical: 1,
    padding: 2,
    backgroundColor: 'white',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 0.1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  showSalaryBtn: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.2,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 6,
    },
    shadowRadius: 10,
    shadowOpacity: 0.55,
  },
  btnSalary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 0.2,
  },
  tableView: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: THEME_COLOR_2,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
  },
  cardInfor: {
    flex: 1,
    width: '100%',
    height: 40,
  },
  card: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR_2,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: THEME_COLOR,
    paddingLeft: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  headerText1: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#F8F4E1',
  },
  cellText1: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#F8F4E1',
    fontWeight: '600',
  },
});

export default Profile;
