/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useCallback, useMemo} from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';

const Order = () => {
  const {t} = useTranslation();

  // Memoize getLanguage function to prevent recreating on each render
  const getLanguage = useCallback(async () => {
    return await AsyncStorage.getItem('Language');
  }, []);

  const authData = useSelector(state => state.auth);

  // Initialize states with proper default values
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

  // Memoize showMessage function
  const showMessage = useCallback((msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  }, []);

  // Memoize get_all_day_off function
  const get_all_day_off = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DAY_OFFS}${GET_ALL}`,
      );
      if (res?.data?.success) {
        const offs = res?.data?.data?.map(item => item.date) || [];
        setDayOffs(offs);
      }
    } catch (error) {
      console.error('Error fetching day offs:', error);
      setDayOffs([]);
    }
  }, []);

  // Memoize config object
  const config = useMemo(
    () => ({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData?.data?.token || ''}`,
      },
    }),
    [authData?.data?.token],
  );

  // Memoize getUserOrders function
  const getUserOrders = useCallback(async () => {
    try {
      // Check if authData is available
      if (!authData?.data?.data?.id) {
        console.log('AuthData not available, skipping getUserOrders');
        return;
      }

      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/user/`,
        {
          user_id: authData.data.data.id,
        },
        config,
      );

      if (res?.data?.success && res?.data?.data) {
        // Filter out any invalid orders and limit array size
        const validOrders = res.data.data
          .filter(item => item && item.id)
          .slice(0, 100); // Limit to 100 orders to prevent memory issues

        setOrdered(validOrders);
        setOrderedDates(
          validOrders.map(item => ({
            date: item.date,
            shift: item.dayOrNight,
          })),
        );

        const pickedCount = validOrders.filter(
          item => item && item.isPicked,
        ).length;
        setPicked(pickedCount);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrdered([]);
      setOrderedDates([]);
      setPicked(0);
    }
  }, [authData?.data?.data?.id, config]);

  // Memoize check_ordered function
  const check_ordered = useCallback(
    (date, check) => {
      return orderedDates.some(
        order =>
          order.date === date.format('YYYY-MM-DD') && order.shift === check,
      );
    },
    [orderedDates],
  );

  // Memoize disable_ordered_btn function
  const disable_ordered_btn = useCallback(
    date => {
      return orderedDates.some(
        order => order.date === date.format('YYYY-MM-DD'),
      );
    },
    [orderedDates],
  );

  // Optimize useEffect with proper dependencies
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        const lang = await getLanguage();
        if (lang != null && isMounted) {
          await i18next.changeLanguage(lang);
        }

        if (isMounted) {
          await get_all_day_off();
          const today = moment();
          setMonth(today.format('YYYY-MM'));

          // Limit to 30 days to prevent memory issues
          const yearDays = Array.from({length: 30}, (_, index) => {
            const date = today.clone().add(index, 'days');
            return date;
          });

          setYearlyDates(yearDays);
          await getUserOrders();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [getLanguage, get_all_day_off, getUserOrders]);

  // Memoize handleCheckBoxPress function
  const handleCheckBoxPress = useCallback(
    async (date, check) => {
      // Check if authData is available
      if (!authData?.data?.data?.id) {
        showMessage('auth.required', 'error', 2000);
        return;
      }

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
          showMessage('success', 'success', 2000);
          setSelectedMap(prev => ({
            ...prev,
            [date.format('YYYY-MM-DD')]: check,
          }));

          // Add new order to state immediately
          const newOrder = {
            id: orderSuccess.data.data?.id || Date.now(),
            date: date.format('YYYY-MM-DD'),
            dayOrNight: check,
            isPicked: false,
            user_id: authData.data.data.id,
          };

          setOrdered(prev => [...prev, newOrder].slice(0, 100)); // Limit array size
          setOrderedDates(prev =>
            [
              ...prev,
              {
                date: date.format('YYYY-MM-DD'),
                shift: check,
              },
            ].slice(0, 100),
          ); // Limit array size
        } else {
          showMessage('order.fail', 'error', 2000);
        }
      } catch (error) {
        console.error('Error placing order:', error);
        showMessage('order.fail', 'error', 2000);
      }
    },
    [authData?.data?.data?.id, config, showMessage],
  );

  // Memoize handleOrderDeleted function
  const handleOrderDeleted = useCallback(
    deletedOrderId => {
      // Find the deleted order first (before removing it)
      const deletedOrder = ordered.find(order => order.id === deletedOrderId);

      // Remove from ordered state
      const updatedOrders = ordered.filter(
        order => order.id !== deletedOrderId,
      );
      setOrdered(updatedOrders);

      // Update orderedDates
      setOrderedDates(
        updatedOrders.map(item => ({
          date: item.date,
          shift: item.dayOrNight,
        })),
      );

      // Update picked count
      const pickedCount = updatedOrders.filter(
        item => item && item.isPicked,
      ).length;
      setPicked(pickedCount);

      // Clear selected map for the deleted date
      if (deletedOrder) {
        setSelectedMap(prev => {
          const newMap = {...prev};
          delete newMap[deletedOrder.date];
          return newMap;
        });
      }
    },
    [ordered],
  );

  // Memoize isWeekendOrHoliday function
  const isWeekendOrHoliday = useCallback(
    date => {
      const day = date.format('d');
      return (
        day === '0' ||
        day === '6' ||
        dayoffs.includes(date.format('YYYY-MM-DD'))
      );
    },
    [dayoffs],
  );

  // Memoize getWeekdayKey function
  const getWeekdayKey = useCallback(date => {
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = date.day();
    return dayNames[dayIndex];
  }, []);

  // Memoize rendered dates to prevent unnecessary re-renders
  const renderedDates = useMemo(() => {
    return yearlyDates.map((date, index) => {
      const isOffDay = isWeekendOrHoliday(date);
      return (
        <View
          key={`${date.format('YYYY-MM-DD')}-${index}`}
          style={styles.dayCard}>
          <LinearGradient
            colors={isOffDay ? ['#e53935', '#d32f2f'] : ['#667eea', '#764ba2']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.dayHeader}>
            <View style={styles.dayInfo}>
              <Text style={[styles.dayName, isOffDay && styles.weekendText]}>
                {t(getWeekdayKey(date))}
              </Text>
              <Text style={[styles.dayDate, isOffDay && styles.weekendText]}>
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
    });
  }, [
    yearlyDates,
    isWeekendOrHoliday,
    getWeekdayKey,
    t,
    disable_ordered_btn,
    selectedMap,
    check_ordered,
    handleCheckBoxPress,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Header title={t('order.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {renderedDates}
      </ScrollView>

      <View style={styles.orderSummaryContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.orderSummary}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryMonth}>{month}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.summaryText}>{t('ord')}</Text>
                <Text style={styles.summaryNumber}>
                  {ordered ? ordered.length : 0}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.summaryText}>{t('pid')}</Text>
                <Text style={styles.summaryNumber}>{picked || 0}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        {/* Invisible touch overlay to ensure click works */}
        <TouchableOpacity
          style={styles.touchOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(true)}
        />
      </View>

      <OrderModal
        visible={isVisible}
        orders={ordered}
        onClose={() => {
          setIsVisible(false);
          // No need to refresh data - already handled by handleOrderDeleted
        }}
        showAlert={showMessage}
        getUserOrders={getUserOrders}
        onOrderDeleted={handleOrderDeleted}
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
    backgroundColor: '#f8fafc',
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
    borderColor: '#667eea',
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  shiftButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  shiftButtonDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  shiftText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
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
  orderSummaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  orderSummary: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
  summaryContent: {
    flex: 1,
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
