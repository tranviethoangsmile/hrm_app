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
  Animated,
  Easing,
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
import {useTheme} from '../hooks/useTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome5';

const Order = () => {
  const {t} = useTranslation();
  const {colors, sizes, fonts, shadows, isDarkMode} = useTheme();

  // Memoize getLanguage function to prevent recreating on each render
  const getLanguage = useCallback(async () => {
    return await AsyncStorage.getItem('Language');
  }, []);

  const authData = useSelector(state => state.auth);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

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
          
          // Start animations
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            }),
          ]).start();
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
      const isSelected = selectedMap[date.format('YYYY-MM-DD')];
      const isOrdered = check_ordered(date, 'DAY') || check_ordered(date, 'NIGHT');
      
      return (
        <Animated.View
          key={`${date.format('YYYY-MM-DD')}-${index}`}
          style={[
            styles.dayCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}>
          <LinearGradient
            colors={isOffDay ? [colors.danger, '#d32f2f'] : [colors.primary, colors.primary2]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.dayHeader}>
            <View style={styles.dayInfo}>
              <View style={styles.dayInfoLeft}>
                <IconFA 
                  name={isOffDay ? "calendar-times" : "calendar-day"} 
                  size={16} 
                  color="rgba(255,255,255,0.9)" 
                />
                <Text style={[styles.dayName, isOffDay && styles.weekendText]}>
                  {t(getWeekdayKey(date))}
                </Text>
              </View>
              <View style={styles.dayInfoRight}>
                <Text style={[styles.dayDate, isOffDay && styles.weekendText]}>
                  {date.format('DD/MM')}
                </Text>
                {isOrdered && (
                  <View style={styles.orderedBadge}>
                    <Icon name="checkmark-circle" size={14} color="#fff" />
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {isOffDay ? (
            <View style={[styles.noMealContainer, { backgroundColor: colors.surface }]}>
              <IconFA name="utensils" size={32} color={colors.placeholder} />
              <Text style={[styles.noMealText, { color: colors.danger }]}>
                {t('no.meal.today')}
              </Text>
            </View>
          ) : (
            <View style={[styles.shiftContainer, { backgroundColor: colors.surface }]}>
              {['DAY', 'NIGHT'].map(shift => {
                const isShiftSelected = selectedMap[date.format('YYYY-MM-DD')] === shift || check_ordered(date, shift);
                const isDisabled = disable_ordered_btn(date);
                
                return (
                  <TouchableOpacity
                    key={shift}
                    disabled={isDisabled}
                    style={[
                      styles.shiftButton,
                      { 
                        borderColor: isShiftSelected ? colors.success : colors.primary,
                        backgroundColor: isShiftSelected ? colors.success : colors.surface
                      },
                      isDisabled && styles.shiftButtonDisabled,
                    ]}
                    onPress={() => handleCheckBoxPress(date, shift)}
                    activeOpacity={0.7}>
                    <View style={styles.shiftButtonContent}>
                      <IconFA 
                        name={shift === 'DAY' ? "sun" : "moon"} 
                        size={14} 
                        color={isShiftSelected ? '#fff' : colors.primary} 
                      />
                      <Text
                        style={[
                          styles.shiftText,
                          { 
                            color: isShiftSelected ? '#fff' : colors.primary,
                            fontWeight: isShiftSelected ? 'bold' : '600'
                          },
                          isDisabled && styles.shiftTextDisabled,
                        ]}>
                        {shift === 'DAY' ? t('dd') : t('nn')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
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
    colors,
    fadeAnim,
    slideAnim,
    scaleAnim,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <Header title={t('order.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {renderedDates}
      </ScrollView>

      <Animated.View 
        style={[
          styles.orderSummaryContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
        <LinearGradient
          colors={[colors.primary, colors.primary2]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.orderSummary}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <IconFA name="calendar-alt" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.summaryMonth}>{month}</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <IconFA name="clipboard-list" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.summaryText}>{t('ord')}</Text>
                <Text style={styles.summaryNumber}>
                  {ordered ? ordered.length : 0}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <IconFA name="check-circle" size={14} color="rgba(255,255,255,0.9)" />
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
      </Animated.View>

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
  },
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 120,
  },
  dayCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dayHeader: {
    padding: 20,
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  dayDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  orderedBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  weekendText: {
    color: '#fff',
    opacity: 0.9,
  },
  shiftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  shiftButton: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shiftButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftButtonSelected: {
    shadowOpacity: 0.2,
    elevation: 6,
  },
  shiftButtonDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  shiftText: {
    fontSize: 16,
    fontWeight: '600',
  },
  shiftTextSelected: {
    color: '#fff',
  },
  shiftTextDisabled: {
    color: '#9e9e9e',
  },
  noMealContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMealText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 12,
    fontWeight: '500',
  },
  orderSummaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  orderSummary: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -6},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  summaryText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
    fontWeight: '500',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
});

export default Order;
