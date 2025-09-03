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
  Dimensions,
  Platform,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import SelectDate from '../components/SelectDate';
import moment from 'moment';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
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
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const token = authData?.data?.data?.token;

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

  const handleUploadSuccess = () => {
    get_user_info();
    setIsModalUpAvataVisible(false);
  };

  useEffect(() => {
    if (today) {
      get_checkin_of_user();
    }
  }, [today]);

  const get_checkin_of_user = async () => {
    try {
      setIsLoading(true);
      const year = moment(today).format('YYYY');
      const month = moment(today).format('MM');

      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${SEARCH}`,
        {
          user_id: user_id,
          date: `${year}-${month}-01`,
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
    let statusColor = '#4FACFE';
    let statusText = t('day_shift', 'Day Shift');

    if (item.is_paid_leave) {
      rowStyle = [rowStyle, styles.paidLeaveRow];
      statusColor = '#00D4AA';
      statusText = t('leave', 'Leave');
    } else if (item.is_weekend) {
      rowStyle = [rowStyle, styles.weekendRow];
      statusColor = '#FF6B6B';
      statusText = t('weekend', 'Weekend');
    } else if (item.work_shift === 'NIGHT') {
      rowStyle = [rowStyle, styles.nightShiftRow];
      statusColor = '#A18AFF';
      statusText = t('night_shift', 'Night Shift');
    }

    return (
      <TouchableOpacity style={rowStyle} activeOpacity={0.7}>
        <View style={styles.rowContent}>
          <View style={styles.dateSection}>
            <Text style={styles.dateText}>
              {moment(item.date).format('DD')}
            </Text>
            <Text style={styles.dayText}>
              {moment(item.date).format('MMM')}
            </Text>
          </View>

          <View style={styles.timeSection}>
            <View style={styles.timeRow}>
              <Icon name="log-in-outline" size={16} color="#666" />
              <Text style={styles.timeText}>{item.time_in || '--:--'}</Text>
            </View>
            <View style={styles.timeRow}>
              <Icon name="log-out-outline" size={16} color="#666" />
              <Text style={styles.timeText}>{item.time_out || '--:--'}</Text>
            </View>
          </View>

          <View style={styles.hoursSection}>
            <Text style={styles.hoursText}>{item.work_time}h</Text>
            {item.over_time > 0 && (
              <Text style={styles.overtimeText}>+{item.over_time}h OT</Text>
            )}
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.is_paid_leave
                  ? '#00D4AA'
                  : item.is_weekend
                  ? '#FF6B6B'
                  : item.work_shift === 'NIGHT'
                  ? '#A18AFF'
                  : '#667eea',
              },
            ]}>
            <Text style={styles.statusText}>
              {item.is_paid_leave
                ? t('leave', 'Leave')
                : item.is_weekend
                ? t('weekend', 'Weekend')
                : item.work_shift === 'NIGHT'
                ? t('night_shift', 'Night Shift')
                : t('day_shift', 'Day Shift')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
    checkLanguage();
    // eslint-disable-next-line
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {t('profile.title', 'Profile')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Salary')}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="wallet-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Employee Card */}
        <View style={styles.employeeCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.companyName}>DAIHATSU METAL</Text>
            </View>

            {/* Employee Info */}
            <TouchableOpacity
              style={styles.employeeInfo}
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleUploadAvatar}>
                <Image
                  source={
                    userInfo.avatar
                      ? {uri: userInfo.avatar}
                      : require('../assets/images/avatar.jpg')
                  }
                  style={styles.employeeAvatar}
                />
                <View style={styles.cameraOverlay}>
                  <Icon name="camera" size={10} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={styles.employeeDetails}>
                <Text style={styles.employeeName}>
                  {userInfo.name || '---'}
                </Text>
                <Text style={styles.employeePosition}>
                  {userInfo.position || 'Employee'}
                </Text>
                <View style={styles.contactRow}>
                  <Icon
                    name="mail-outline"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.employeeEmail} numberOfLines={1}>
                    {userInfo.email || 'email@company.com'}
                  </Text>
                </View>
              </View>

              <View style={styles.employeeIdSection}>
                <Text style={styles.idLabel}>ID</Text>
                <Text style={styles.employeeId}>
                  {userInfo.employee_id || '---'}
                </Text>
              </View>

              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="rgba(255,255,255,0.6)"
                style={styles.expandIcon}
              />
            </TouchableOpacity>

            {/* Expanded Details */}
            {isExpanded && (
              <View style={styles.expandedDetails}>
                <View style={styles.detailRow}>
                  <Icon
                    name="call-outline"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.detailText}>
                    {userInfo.phone || '---'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="location-outline"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.detailText}>
                    {userInfo.address || '---'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="calendar-outline"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.detailText}>
                    {userInfo.join_date
                      ? moment(userInfo.join_date).format('DD/MM/YYYY')
                      : '---'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="briefcase-outline"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.detailText}>
                    {userInfo.department || '---'}
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Month Selector & Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.monthSelector}
            onPress={() => setIsModalVisible(true)}>
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.monthGradient}>
              <Icon name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.monthText}>
                {moment(today).format('YYYY/MM')}
              </Text>
              <Icon name="chevron-down" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.statGradient}>
                <Icon name="time-outline" size={20} color="#fff" />
                <Text style={styles.statNumber}>{totalWorkTime}</Text>
                <Text style={styles.statLabel}>{t('wt', 'Hours')}</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FF6B6B', '#FFE66D']}
                style={styles.statGradient}>
                <Icon name="flash-outline" size={20} color="#fff" />
                <Text style={styles.statNumber}>{totalOverTime}</Text>
                <Text style={styles.statLabel}>{t('ot', 'OT')}</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#A18AFF', '#FF8A80']}
                style={styles.statGradient}>
                <Icon name="calendar-number-outline" size={20} color="#fff" />
                <Text style={styles.statNumber}>{totalWorkTimeWeekend}</Text>
                <Text style={styles.statLabel}>{t('wend', 'Weekend')}</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Check-in History */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleContainer}>
              <Icon name="list-outline" size={24} color="#667eea" />
              <Text style={styles.historyTitle}>
                {t('c-i-h', 'Check-in History')}
              </Text>
            </View>
            <Text style={styles.historyCount}>
              {userCheckin.length} {t('records', 'records')}
            </Text>
          </View>

          {error ? (
            <View style={styles.messageContainer}>
              <LinearGradient
                colors={['#FF6B6B', '#FFE66D']}
                style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={32} color="#fff" />
                <Text style={styles.errorText}>{t(error)}</Text>
              </LinearGradient>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.messageContainer}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            </View>
          ) : userCheckin.length === 0 ? (
            <View style={styles.messageContainer}>
              <View style={styles.emptyContainer}>
                <Icon name="calendar-outline" size={64} color="#E0E0E0" />
                <Text style={styles.emptyText}>
                  {t('not.data', 'No data available')}
                </Text>
                <Text style={styles.emptySubText}>Pull down to refresh</Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={userCheckin}
              renderItem={renderCheckin}
              keyExtractor={(item, index) =>
                item?.id?.toString() || index.toString()
              }
              showsVerticalScrollIndicator={false}
              style={styles.historyList}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <SelectDate
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        setSelectedDate={setToday}
        getCheckin={get_checkin_of_user}
      />

      <UploadAvatar
        visible={isModalUpAvataVisible}
        closeModal={() => setIsModalUpAvataVisible(false)}
        t={t}
        user_id={user_id}
        avatar_url={userInfo.avatar}
        onSuccess={handleUploadSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    paddingBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 5,
  },
  backButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    marginTop: -5,
  },
  employeeCard: {
    marginHorizontal: 0,
    marginTop: 0,
    backgroundColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    padding: 16,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.2,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'relative',
    marginRight: 16,
  },
  employeeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  employeePosition: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeEmail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginLeft: 4,
    flex: 1,
  },
  employeeIdSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  idLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsContainer: {
    marginTop: 1,
    backgroundColor: '#fff',
  },
  monthSelector: {
    marginBottom: 12,
  },
  monthGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    shadowColor: '#4FACFE',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 8,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statGradient: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  historyContainer: {
    marginTop: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  historyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  historyCount: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  messageContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  errorText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#667eea',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 4,
  },
  historyList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  checkinRow: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  paidLeaveRow: {
    backgroundColor: '#f0fdfa',
    borderLeftWidth: 4,
    borderLeftColor: '#00D4AA',
  },
  weekendRow: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  nightShiftRow: {
    backgroundColor: '#f8faff',
    borderLeftWidth: 4,
    borderLeftColor: '#A18AFF',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dateSection: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a202c',
    letterSpacing: 0.5,
  },
  dayText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  timeSection: {
    flex: 1,
    marginRight: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 8,
  },
  hoursSection: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  hoursText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  overtimeText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  expandIcon: {
    marginLeft: 8,
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 12,
    flex: 1,
  },
});

export default Profile;
