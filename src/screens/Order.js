/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import {ModalMessage} from '../components';
import {useSelector} from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import {
  API,
  BASE_URL,
  ORDER_URL,
  PORT,
  V1,
  VERSION,
  DAY_OFFS,
  GET_ALL,
} from '../utils/constans';
import OrderModal from '../components/OrderModal';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';
import {COLORS, FONTS, SHADOWS} from '../config/theme';

const Order = () => {
  const {t} = useTranslation();
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const authData = useSelector(state => state.auth);
  const [yearlyDates, setYearlyDates] = useState([]);
  const [month, setMonth] = useState('');
  const [selectedMap, setSelectedMap] = useState({});
  const [ordered, setOrdered] = useState([]);
  const [picked, setPicked] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [orderedDates, setOrderedDates] = useState([]);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [dayoffs, setDayOffs] = useState([]);
  const navigation = useNavigation();

  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };

  const get_all_day_off = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DAY_OFFS}${GET_ALL}`,
      );
      if (res?.data?.success) {
        const offs = res?.data?.data.map(item => item.date);
        setDayOffs(offs);
      }
    } catch (error) {
      setDayOffs([]);
    }
  };

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.data.token}`,
    },
  };

  const getUserOrders = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/user/`,
        {
          user_id: authData.data.data.id,
        },
      );
      if (res?.data?.success) {
        setOrdered(res?.data?.data);
        setOrderedDates(
          res.data.data.map(item => ({
            date: item.date,
            shift: item.dayOrNight,
          })),
        );
        const pickedCount = res.data.data.filter(item => item.isPicked).length;
        setPicked(pickedCount);
      }
    } catch (error) {
      setOrdered([]);
      setOrderedDates([]);
      setPicked(0);
    }
  };

  const check_ordered = (date, check) => {
    return orderedDates.some(
      order =>
        order.date === date.format('YYYY-MM-DD') && order.shift === check,
    );
  };

  const disable_ordered_btn = date => {
    return orderedDates.some(order => order.date === date.format('YYYY-MM-DD'));
  };

  useEffect(() => {
    const initializeData = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }

      await get_all_day_off();
      const today = moment();
      setMonth(today.format('YYYY-MM'));

      // Get next 30 days
      const yearDays = Array.from({length: 30}, (_, index) => {
        const date = today.clone().add(index, 'days');
        return date;
      });

      setYearlyDates(yearDays);
      getUserOrders();
    };

    initializeData();
  }, [isVisible]);

  const handleCheckBoxPress = async (date, check) => {
    const order = {
      user_id: authData.data.data.id,
      date: date.format('YYYY-MM-DD'),
      dayOrNight: check,
    };

    try {
      const orderSuccess = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}`,
        order,
        config,
      );

      if (orderSuccess?.data?.success) {
        showMessage('order.success', 'success', 2000);
        setSelectedMap(prev => ({
          ...prev,
          [date.format('YYYY-MM-DD')]: check,
        }));
        getUserOrders();
      } else {
        showMessage('order.fail', 'error', 2000);
      }
    } catch (error) {
      showMessage('order.fail', 'error', 2000);
    }
  };

  const handleOrderShow = () => {
    setIsVisible(true);
  };

  const isWeekendOrHoliday = date => {
    const day = date.format('d');
    return (
      day === '0' || day === '6' || dayoffs.includes(date.format('YYYY-MM-DD'))
    );
  };

  const getWeekdayKey = date => {
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = date.day(); // 0 = Sunday, 1 = Monday, etc.
    return dayNames[dayIndex];
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#1a237e', '#0d47a1']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerGradient}>
          <Header
            title={t('order.title')}
            onBack={() => navigation.goBack()}
            backgroundColor="transparent"
          />
        </LinearGradient>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {yearlyDates.map((date, index) => {
          const isOffDay = isWeekendOrHoliday(date);
          return (
            <View key={index} style={styles.dayCard}>
              <LinearGradient
                colors={
                  isOffDay ? ['#e53935', '#d32f2f'] : ['#1e88e5', '#1565c0']
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text
                    style={[styles.dayName, isOffDay && styles.weekendText]}>
                    {t(getWeekdayKey(date))}
                  </Text>
                  <Text
                    style={[styles.dayDate, isOffDay && styles.weekendText]}>
                    {date.format('DD/MM')}
                  </Text>
                </View>
              </LinearGradient>

              {isOffDay ? (
                <View style={styles.noMealContainer}>
                  <Text style={styles.noMealText}>{t('no.meal.today')}</Text>
                </View>
              ) : (
                <View style={styles.shiftContainer}>
                  {['DAY', 'NIGHT'].map(shift => (
                    <TouchableOpacity
                      key={shift}
                      disabled={disable_ordered_btn(date)}
                      style={[
                        styles.shiftButton,
                        (selectedMap[date.format('YYYY-MM-DD')] === shift ||
                          check_ordered(date, shift)) &&
                          styles.shiftButtonSelected,
                        disable_ordered_btn(date) && styles.shiftButtonDisabled,
                      ]}
                      onPress={() => handleCheckBoxPress(date, shift)}>
                      <Text
                        style={[
                          styles.shiftText,
                          (selectedMap[date.format('YYYY-MM-DD')] === shift ||
                            check_ordered(date, shift)) &&
                            styles.shiftTextSelected,
                          disable_ordered_btn(date) && styles.shiftTextDisabled,
                        ]}>
                        {shift === 'DAY' ? t('dd') : t('nn')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity activeOpacity={0.8} onPress={() => setIsVisible(true)}>
        <LinearGradient
          colors={['#1a237e', '#0d47a1']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.orderSummary}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryMonth}>{month}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.summaryText}>{t('ord')}</Text>
                <Text style={styles.summaryNumber}>{ordered.length}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.summaryText}>{t('pid')}</Text>
                <Text style={styles.summaryNumber}>{picked}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <OrderModal
        visible={isVisible}
        orders={ordered}
        onClose={() => setIsVisible(false)}
        showAlert={showMessage}
        getUserOrders={getUserOrders}
        t={t}
      />

      <ModalMessage
        message={messageModal}
        type={messageType}
        isVisible={isMessageModalVisible}
        duration={duration}
        onClose={() => setMessageModalVisible(false)}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100,
  },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    padding: 16,
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  dayDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  weekendText: {
    color: COLORS.white,
    opacity: 0.9,
  },
  shiftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
  },
  shiftButton: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2196f3',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  shiftButtonSelected: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  shiftButtonDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  shiftText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196f3',
  },
  shiftTextSelected: {
    color: COLORS.white,
  },
  shiftTextDisabled: {
    color: '#9e9e9e',
  },
  noMealContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  noMealText: {
    fontSize: 16,
    color: '#e53935',
    fontStyle: 'italic',
  },
  orderSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.white,
    opacity: 0.2,
  },
  summaryText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default Order;
