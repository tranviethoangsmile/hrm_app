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
  ActivityIndicator,
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
import Header from '../components/common/Header';

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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
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
        setUserCheckin([]);
      }
    } catch (e) {
      setError('user_no_check_ins');
      setUserCheckin([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCheckin = ({item}) => {
    let rowStyle = styles.checkinRow;
    if (item.is_paid_leave) {
      rowStyle = [rowStyle, {backgroundColor: '#e6f7fb'}];
    } else if (item.is_weekend) {
      rowStyle = [rowStyle, {backgroundColor: '#fbeee6'}];
    } else if (item.work_shift === 'NIGHT') {
      rowStyle = [rowStyle, {backgroundColor: '#e6f0fa'}];
    }
    return (
      <View style={rowStyle}>
        <Text style={styles.cellText}>{item.date}</Text>
        <Text style={styles.cellText}>{item.time_in}</Text>
        <Text style={styles.cellText}>{item.time_out}</Text>
        <Text style={styles.cellText}>{item.work_time}</Text>
        <Text style={styles.cellText}>{t(item.work_shift)}</Text>
        <Text style={styles.cellText}>{item.over_time}</Text>
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
      setUserInfo({});
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
    // eslint-disable-next-line
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title={t('profile.title', 'Hồ sơ')}
        onBack={() => navigation.goBack()}
      />
      {/* Card Thông tin cá nhân */}
      <View style={styles.cardProfile}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleUploadAvatar}
            style={styles.avatarWrapper}>
            <Image
              source={
                userInfo.avatar
                  ? {uri: userInfo.avatar}
                  : require('../assets/images/avatar.jpg')
              }
              style={styles.avatar}
            />
            <View style={styles.avatarEditBtn}>
              <Icon name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.infoSection}>
            <Text style={styles.nameText}>{userInfo.name || '---'}</Text>
            <Text style={styles.infoText}>
              <Icon name="id-badge" size={14} color={THEME_COLOR_2} />{' '}
              {userInfo.employee_id || '---'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="user" size={14} color={THEME_COLOR_2} />{' '}
              {userInfo.role || '---'} - {userInfo.position || '---'}
            </Text>
            <Text style={styles.infoText}>
              <Icon name="envelope" size={14} color={THEME_COLOR_2} />{' '}
              {userInfo.email || '---'}
            </Text>
          </View>
        </View>
      </View>
      {/* Card Tổng hợp công tháng */}
      <View style={styles.cardSummary}>
        <View style={styles.summaryHeader}>
          <Icon
            name="calendar"
            size={18}
            color={THEME_COLOR}
            style={{marginRight: 8}}
          />
          <Text style={styles.summaryTitle}>{t('summary')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('m')}</Text>
          <Text style={styles.summaryLabel}>{t('wt')}</Text>
          <Text style={styles.summaryLabel}>{t('ot')}</Text>
          <Text style={styles.summaryLabel}>{t('wend')}</Text>
        </View>
        <TouchableOpacity
          style={styles.summaryDataRow}
          onPress={() => setIsModalVisible(!isModalVisible)}>
          <Text style={styles.summaryValue}>
            {year}/{month}
          </Text>
          <Text style={styles.summaryValue}>{totalWorkTime}</Text>
          <Text style={styles.summaryValue}>{totalOverTime}</Text>
          <Text style={styles.summaryValue}>{totalWorkTimeWeekend}</Text>
        </TouchableOpacity>
      </View>
      {/* Card Bảng chấm công từng ngày */}
      <View style={styles.cardCheckin}>
        <View style={styles.checkinHeaderRow}>
          <Icon
            name="clock-o"
            size={18}
            color={THEME_COLOR}
            style={{marginRight: 8}}
          />
          <Text style={styles.checkinTitle}>{t('c-i-h')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Salary')}
            style={styles.salaryBtn}>
            <Icon name="money" color={THEME_COLOR_2} size={20} />
            <Text style={styles.salaryBtnText}>{t('payroll.s')}</Text>
            <Icon name="chevron-right" color={THEME_COLOR_2} size={16} />
          </TouchableOpacity>
        </View>
        <View style={styles.checkinTableHeader}>
          <Text style={styles.checkinHeaderText}>{t('D')}</Text>
          <Text style={styles.checkinHeaderText}>{t('I')}</Text>
          <Text style={styles.checkinHeaderText}>{t('O')}</Text>
          <Text style={styles.checkinHeaderText}>{t('wt')}</Text>
          <Text style={styles.checkinHeaderText}>{t('S')}</Text>
          <Text style={styles.checkinHeaderText}>{t('ot')}</Text>
        </View>
        {err ? <Text style={styles.errorText}>{t(err)}</Text> : null}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={THEME_COLOR}
            style={{marginVertical: 20}}
          />
        ) : userCheckin.length === 0 ? (
          <Text style={styles.emptyText}>{t('not.data')}</Text>
        ) : (
          <FlatList
            data={userCheckin}
            renderItem={renderCheckin}
            keyExtractor={item => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
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
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    padding: 10,
  },
  cardProfile: {
    backgroundColor: THEME_COLOR_2,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    marginRight: 18,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: THEME_COLOR,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#f0f0f0',
    marginBottom: 2,
  },
  cardSummary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLOR,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  summaryLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#888',
    fontWeight: '600',
    fontSize: 15,
  },
  summaryDataRow: {
    flexDirection: 'row',
    backgroundColor: THEME_COLOR_2,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardCheckin: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  checkinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  checkinTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: THEME_COLOR,
    flex: 1,
  },
  salaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6fa',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  salaryBtnText: {
    color: THEME_COLOR_2,
    fontWeight: 'bold',
    marginHorizontal: 4,
    fontSize: 15,
  },
  checkinTableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 2,
  },
  checkinHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#888',
  },
  checkinRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 2,
    backgroundColor: '#fff',
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
  },
});

export default Profile;
