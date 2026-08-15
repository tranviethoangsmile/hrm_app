/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {ModalMessage} from '../components';
import {useSelector} from 'react-redux';
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
import apiClient from '../services/apiClient';
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
  const {colors} = useTheme();

  const getLanguage = useCallback(async () => {
    return await AsyncStorage.getItem('Language');
  }, []);

  const authData = useSelector(state => state.auth);
  const userInfo = authData?.data?.data;

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

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

  const showMessage = useCallback((msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  }, []);

  const get_all_day_off = useCallback(async () => {
    try {
      const res = await apiClient.get(
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

  const getUserOrders = useCallback(async () => {
    try {
      if (!userInfo?.id) {
        console.log('AuthData not available, skipping getUserOrders');
        return;
      }
      const res = await apiClient.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/user/`,
        {user_id: userInfo.id},
      );
      if (res?.data?.success && res?.data?.data) {
        const validOrders = res.data.data
          .filter(item => item && item.id)
          .slice(0, 100);
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
  }, [userInfo?.id]);

  const check_ordered = useCallback(
    (date, check) => {
      return orderedDates.some(
        order =>
          order.date === date.format('YYYY-MM-DD') && order.shift === check,
      );
    },
    [orderedDates],
  );

  const disable_ordered_btn = useCallback(
    date => {
      return orderedDates.some(
        order => order.date === date.format('YYYY-MM-DD'),
      );
    },
    [orderedDates],
  );

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

          const yearDays = Array.from({length: 30}, (_, index) => {
            const date = today.clone().add(index, 'days');
            return date;
          });

          setYearlyDates(yearDays);
          await getUserOrders();

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

    return () => {
      isMounted = false;
    };
  }, [getLanguage, get_all_day_off, getUserOrders]);

  const handleCheckBoxPress = useCallback(
    async (date, check) => {
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
        const orderSuccess = await apiClient.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}`,
          order,
        );

        if (orderSuccess?.data?.success) {
          showMessage('success', 'success', 2000);
          setSelectedMap(prev => ({
            ...prev,
            [date.format('YYYY-MM-DD')]: check,
          }));

          const newOrder = {
            id: orderSuccess.data.data?.id || Date.now(),
            date: date.format('YYYY-MM-DD'),
            dayOrNight: check,
            isPicked: false,
            user_id: authData.data.data.id,
          };

          setOrdered(prev => [...prev, newOrder].slice(0, 100));
          setOrderedDates(prev =>
            [
              ...prev,
              {
                date: date.format('YYYY-MM-DD'),
                shift: check,
              },
            ].slice(0, 100),
          );
        } else {
          showMessage('order.fail', 'error', 2000);
        }
      } catch (error) {
        console.error('Error placing order:', error);
        showMessage('order.fail', 'error', 2000);
      }
    },
    [authData?.data?.data?.id, showMessage],
  );

  const handleOrderDeleted = useCallback(
    deletedOrderId => {
      const deletedOrder = ordered.find(order => order.id === deletedOrderId);

      const updatedOrders = ordered.filter(
        order => order.id !== deletedOrderId,
      );
      setOrdered(updatedOrders);
      setOrderedDates(
        updatedOrders.map(item => ({
          date: item.date,
          shift: item.dayOrNight,
        })),
      );

      const pickedCount = updatedOrders.filter(
        item => item && item.isPicked,
      ).length;
      setPicked(pickedCount);

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
    return dayNames[date.day()];
  }, []);

  const renderShiftButton = (date, shift, isOffDay) => {
    const isShiftSelected =
      selectedMap[date.format('YYYY-MM-DD')] === shift ||
      check_ordered(date, shift);
    const isDisabled = disable_ordered_btn(date);
    const isDay = shift === 'DAY';

    if (isOffDay) {
      return null;
    }

    return (
      <TouchableOpacity
        key={shift}
        disabled={isDisabled}
        style={[
          styles.shiftButton,
          {
            backgroundColor: isShiftSelected
              ? colors.success
              : isDisabled
              ? colors.backgroundSecondary
              : colors.surface,
            borderColor: isShiftSelected
              ? colors.success
              : isDisabled
              ? colors.border
              : colors.primary,
          },
          isDisabled && !isShiftSelected && styles.shiftButtonDisabled,
        ]}
        onPress={() => handleCheckBoxPress(date, shift)}
        activeOpacity={0.75}>
        <IconFA
          name={isDay ? 'sun' : 'moon'}
          size={18}
          color={
            isShiftSelected
              ? '#fff'
              : isDisabled
              ? colors.textTertiary
              : colors.primary
          }
        />
        <View style={styles.shiftTextWrap}>
          <Text
            style={[
              styles.shiftText,
              {
                color: isShiftSelected
                  ? '#fff'
                  : isDisabled
                  ? colors.textTertiary
                  : colors.primary,
              },
            ]}>
            {isDay ? t('order.day_shift') : t('order.night_shift')}
          </Text>
          {isShiftSelected && (
            <Text style={styles.shiftSelectedSub}>{t('ord')}</Text>
          )}
        </View>
        {isShiftSelected && (
          <Icon name="checkmark-circle" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    );
  };

  const renderedDates = useMemo(() => {
    return yearlyDates.map((date, index) => {
      const isOffDay = isWeekendOrHoliday(date);
      const isOrdered =
        check_ordered(date, 'DAY') || check_ordered(date, 'NIGHT');

      return (
        <Animated.View
          key={`${date.format('YYYY-MM-DD')}-${index}`}
          style={[
            styles.dayCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <LinearGradient
            colors={
              isOffDay ? [colors.danger, '#d32f2f'] : colors.primaryGradient
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.dayHeader}>
            <View style={styles.dayInfo}>
              <View style={styles.dayInfoLeft}>
                <IconFA
                  name={isOffDay ? 'calendar-times' : 'utensils'}
                  size={15}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.dayName}>
                  {t(getWeekdayKey(date)).toUpperCase()}
                </Text>
              </View>
              <View style={styles.dayInfoRight}>
                {isOrdered && (
                  <View style={styles.orderedChip}>
                    <Icon name="checkmark" size={12} color="#fff" />
                    <Text style={styles.orderedChipText}>{t('ord')}</Text>
                  </View>
                )}
                <Text style={styles.dayDate}>{date.format('DD/MM')}</Text>
              </View>
            </View>
          </LinearGradient>

          {isOffDay ? (
            <View style={styles.noMealContainer}>
              <View
                style={[
                  styles.noMealIconWrap,
                  {backgroundColor: colors.backgroundSecondary},
                ]}>
                <IconFA name="utensils" size={26} color={colors.textTertiary} />
              </View>
              <Text style={[styles.noMealText, {color: colors.textSecondary}]}>
                {t('no.meal.today')}
              </Text>
            </View>
          ) : (
            <View style={styles.shiftContainer}>
              {renderShiftButton(date, 'DAY', isOffDay)}
              {renderShiftButton(date, 'NIGHT', isOffDay)}
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

  const today = moment();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('order.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          }}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>{t('order.hero_title')}</Text>
                <Text style={styles.heroSubtitle}>
                  {t(getWeekdayKey(today))}, {today.format('DD/MM/YYYY')}
                </Text>
                <View style={styles.heroChips}>
                  <View style={styles.heroChip}>
                    <Icon name="checkmark-circle" size={14} color="#fff" />
                    <Text style={styles.heroChipText}>
                      {ordered.length} {t('ord')}
                    </Text>
                  </View>
                  <View style={styles.heroChip}>
                    <Icon name="fast-food-outline" size={14} color="#fff" />
                    <Text style={styles.heroChipText}>
                      {picked} {t('pid')}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroIconWrap}>
                <IconFA name="utensils" size={30} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {renderedDates}
      </ScrollView>

      <Animated.View
        style={[
          styles.orderSummaryContainer,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          },
        ]}>
        <TouchableOpacity
          style={styles.summaryTouchable}
          activeOpacity={0.95}
          onPress={() => setIsVisible(true)}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.orderSummary}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryIconWrap}>
                <IconFA name="calendar-alt" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.summaryMonth}>{month}</Text>
                <Text style={styles.summaryHint}>{t('order.view_orders')}</Text>
              </View>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{ordered.length}</Text>
                <Text style={styles.summaryText}>{t('ord')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{picked}</Text>
                <Text style={styles.summaryText}>{t('pid')}</Text>
              </View>
              <View style={styles.statDivider} />
              <Icon
                name="chevron-up-circle"
                size={22}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <OrderModal
        visible={isVisible}
        orders={ordered}
        onClose={() => {
          setIsVisible(false);
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
  scrollViewContent: {
    padding: 20,
    paddingBottom: 130,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  dayHeader: {
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginLeft: 8,
  },
  dayDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    marginLeft: 8,
  },
  orderedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  orderedChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  shiftContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  shiftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1.6,
    paddingVertical: 13,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftButtonDisabled: {
    opacity: 0.6,
  },
  shiftTextWrap: {
    alignItems: 'center',
  },
  shiftText: {
    fontSize: 14,
    fontWeight: '700',
  },
  shiftSelectedSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 1,
  },
  noMealContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  noMealIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMealText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  orderSummaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  summaryTouchable: {
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryMonth: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.4,
  },
  summaryHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 1,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  summaryText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 1,
  },
});

export default Order;
