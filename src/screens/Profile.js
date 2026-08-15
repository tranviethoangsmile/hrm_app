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
import {useTheme} from '../hooks/useTheme';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  CHECKIN,
  SEARCH,
  DAY_OFFS,
  GET_ALL,
} from '../utils/constans';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import Header from '../components/common/Header';
import AttendanceCalendar from '../components/common/AttendanceCalendar';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const Profile = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode} = useTheme();
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const user_id = authData?.data?.data?.id;
  const [userCheckin, setUserCheckin] = useState([]);
  const [today, setToday] = useState(moment().format('YYYY-MM-DD'));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [dayOffs, setDayOffs] = useState([]);
  const token = authData?.data?.data?.token;

  const year = moment(today).format('YYYY');
  const month = moment(today).format('MM');
  const calYear = parseInt(year, 10);
  const calMonth = parseInt(month, 10) - 1;
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
  const handleSelectDay = key => {
    const found = userCheckin.find(
      c => moment(c.date).format('YYYY-MM-DD') === key,
    );
    if (!found) {
      return;
    }
    const status = found.is_paid_leave
      ? t('leave')
      : found.is_weekend
      ? t('weekend')
      : found.work_shift === 'NIGHT'
      ? t('night_shift')
      : t('day_shift');
    Alert.alert(
      moment(key).format('DD/MM/YYYY'),
      `${status} — ${t('wt')}: ${found.work_time}h`,
    );
  };

  useEffect(() => {
    if (today) {
      get_checkin_of_user();
    }
  }, [today]);

  const get_day_offs = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DAY_OFFS}${GET_ALL}`,
      );
      if (res?.data?.success) {
        setDayOffs((res?.data?.data || []).map(item => item.date));
      }
    } catch (error) {
      console.error(error);
      setDayOffs([]);
    }
  };

  const get_checkin_of_user = async () => {
    try {
      setIsLoading(true);
      get_day_offs();
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
              <Icon
                name="log-in-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.timeText}>{item.time_in || '--:--'}</Text>
            </View>
            <View style={styles.timeRow}>
              <Icon
                name="log-out-outline"
                size={16}
                color={colors.textSecondary}
              />
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

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
  }, []);

  const styles = createStyles(colors, isDarkMode);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
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
            onPress={() => navigation.navigate('Main')}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {t('profile.title', 'Profile')}
          </Text>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.backButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Salary')}
              style={styles.backButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="wallet-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Attendance Summary Hero */}
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroTitleWrap}>
              <Icon name="analytics-outline" size={18} color="#fff" />
              <Text style={styles.heroTitle}>
                {t('profile.attendance_stat', 'Attendance Stats')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.heroMonth}
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.8}>
              <Icon name="calendar-outline" size={15} color="#fff" />
              <Text style={styles.heroMonthText}>
                {moment(today).format('YYYY/MM')}
              </Text>
              <Icon name="chevron-down" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Icon
                name="time-outline"
                size={18}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.heroStatNumber}>{totalWorkTime}</Text>
              <Text style={styles.heroStatLabel}>{t('wt', 'Hours')}</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <Icon
                name="flash-outline"
                size={18}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.heroStatNumber}>{totalOverTime}</Text>
              <Text style={styles.heroStatLabel}>{t('ot', 'OT')}</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <Icon
                name="calendar-number-outline"
                size={18}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.heroStatNumber}>{totalWorkTimeWeekend}</Text>
              <Text style={styles.heroStatLabel}>{t('wend', 'Weekend')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Check-in History */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleContainer}>
              <Icon name="list-outline" size={24} color={colors.primary} />
              <Text style={styles.historyTitle}>
                {t('c-i-h', 'Check-in History')}
              </Text>
            </View>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  viewMode === 'calendar' && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setViewMode('calendar')}>
                <Icon
                  name="calendar-outline"
                  size={16}
                  color={
                    viewMode === 'calendar' ? '#fff' : colors.textSecondary
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  viewMode === 'list' && {backgroundColor: colors.primary},
                ]}
                onPress={() => setViewMode('list')}>
                <Icon
                  name="list-outline"
                  size={16}
                  color={viewMode === 'list' ? '#fff' : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {viewMode === 'calendar' ? (
            <AttendanceCalendar
              year={calYear}
              month={calMonth}
              checkins={userCheckin}
              dayoffs={dayOffs}
              onSelectDay={handleSelectDay}
            />
          ) : (
            <View>
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
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                </View>
              ) : userCheckin.length === 0 ? (
                <View style={styles.messageContainer}>
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="calendar-outline"
                      size={64}
                      color={colors.textTertiary}
                    />
                    <Text style={styles.emptyText}>
                      {t('not.data', 'No data available')}
                    </Text>
                    <Text style={styles.emptySubText}>
                      Pull down to refresh
                    </Text>
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
          )}
        </View>
      </ScrollView>

      <SelectDate
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        setSelectedDate={setToday}
        getCheckin={get_checkin_of_user}
      />
    </View>
  );
};

const createStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerGradient: {
      paddingTop:
        Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
      paddingBottom: 12,
      shadowColor: colors.shadow,
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
    headerRightButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    scrollContainer: {
      flex: 1,
      marginTop: -5,
      backgroundColor: colors.background,
    },
    heroCard: {
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 16,
      borderRadius: 22,
      padding: 20,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
      marginLeft: 8,
      letterSpacing: 0.3,
    },
    heroMonth: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 20,
      gap: 6,
    },
    heroMonthText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.3,
    },
    heroDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginVertical: 16,
    },
    heroStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroStat: {
      flex: 1,
      alignItems: 'center',
    },
    heroStatSep: {
      width: 1,
      height: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    heroStatNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: '#fff',
      marginTop: 6,
      letterSpacing: 0.5,
    },
    heroStatLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '600',
      marginTop: 2,
    },
    historyContainer: {
      marginTop: 1,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
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
      borderBottomColor: colors.border,
    },
    historyTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 10,
      letterSpacing: 0.5,
    },
    viewToggle: {
      flexDirection: 'row',
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
      padding: 3,
      gap: 2,
    },
    viewToggleBtn: {
      width: 32,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyCount: {
      fontSize: 14,
      color: colors.primary,
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
      color: colors.primary,
      marginTop: 12,
      fontSize: 16,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
    },
    emptySubText: {
      color: colors.textTertiary,
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
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    paidLeaveRow: {
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#f0fdfa',
      borderLeftWidth: 4,
      borderLeftColor: '#00D4AA',
    },
    weekendRow: {
      backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
      borderLeftWidth: 4,
      borderLeftColor: '#FF6B6B',
    },
    nightShiftRow: {
      backgroundColor: isDarkMode ? 'rgba(161, 138, 255, 0.1)' : '#f8faff',
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
      color: colors.text,
      letterSpacing: 0.5,
    },
    dayText: {
      fontSize: 12,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
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
      color: colors.primary,
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
  });

export default Profile;
