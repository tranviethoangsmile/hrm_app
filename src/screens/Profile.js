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
      <StatusBar barStyle="light-content" backgroundColor={THEME_COLOR} />
      <Header
        title={t('profile.title', 'Profile')}
        onBack={() => navigation.goBack()}
        backgroundColor={THEME_COLOR}
        textColor="#FFFFFF"
      />

      {/* Compact Profile Header */}
      <View style={styles.profileHeader}>
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
              <Icon name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userInfo.name || '---'}</Text>
          <Text style={styles.userRole}>
            {userInfo.employee_id} • {userInfo.position}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Salary')}
          style={styles.salaryBtn}>
          <Icon name="wallet-outline" size={20} color={THEME_COLOR_2} />
        </TouchableOpacity>
      </View>

      {/* Compact Summary Bar */}
      <View style={styles.summaryBar}>
        <TouchableOpacity
          style={styles.monthPicker}
          onPress={() => setIsModalVisible(!isModalVisible)}>
          <Text style={styles.monthText}>
            {year}/{month}
          </Text>
          <Icon name="chevron-down" size={16} color={THEME_COLOR} />
        </TouchableOpacity>

        <View style={styles.quickStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalWorkTime}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalOverTime}</Text>
            <Text style={styles.statLabel}>OT</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalWorkTimeWeekend}</Text>
            <Text style={styles.statLabel}>Weekend</Text>
          </View>
        </View>
      </View>

      {/* Main Check-in History */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>
            {t('c-i-h', 'Check-in History')}
          </Text>
          <Icon name="time-outline" size={20} color={THEME_COLOR} />
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>{t('D', 'Date')}</Text>
          <Text style={styles.headerCell}>{t('I', 'In')}</Text>
          <Text style={styles.headerCell}>{t('O', 'Out')}</Text>
          <Text style={styles.headerCell}>{t('wt', 'Hours')}</Text>
          <Text style={styles.headerCell}>{t('S', 'Status')}</Text>
        </View>

        {err ? (
          <View style={styles.messageContainer}>
            <Icon name="alert-circle-outline" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{t(err)}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color={THEME_COLOR} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : userCheckin.length === 0 ? (
          <View style={styles.messageContainer}>
            <Icon name="calendar-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              {t('not.data', 'No data available')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={userCheckin}
            renderItem={renderCheckin}
            keyExtractor={item => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[THEME_COLOR]}
                tintColor={THEME_COLOR}
              />
            }
            showsVerticalScrollIndicator={false}
            style={styles.historyList}
            contentContainerStyle={styles.listContent}
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
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR_2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarSection: {
    marginRight: 12,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: THEME_COLOR,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#fff',
    zIndex: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  salaryBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
    marginRight: 4,
  },
  quickStats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLOR,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 8,
    fontSize: 14,
  },
  loadingText: {
    color: THEME_COLOR,
    marginLeft: 8,
    fontSize: 14,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 8,
  },
  historyList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#495057',
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Profile;
