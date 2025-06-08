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
} from 'react-native';
import {ModalMessage} from '../components';
import {useSelector} from 'react-redux';
import axios from 'axios';
import moment from 'moment';
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
import {THEME_COLOR} from '../utils/Colors';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
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
        const offs = res?.data?.data.map(item => {
          return item.date;
        });
        setDayOffs(offs);
      }
    } catch (error) {
      showMessage('networkError', 'error', 1000);
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
        let pick = 0;
        for (let i = 0; i < res?.data?.data.length; i++) {
          if (res?.data?.data[i].isPicked === true) {
            pick++;
          }
          setPicked(pick);
        }
      }
    } catch (error) {
      showMessage('networkError', 'error', 1000);
    }
  };
  const check_ordered = (date, check) => {
    const isOrdered = orderedDates.some(
      order =>
        order.date === date.format('YYYY-MM-DD') && order.shift === check,
    );
    return isOrdered;
  };

  const disable_ordered_btn = date => {
    const is_disable = orderedDates.some(
      order => order.date === date.format('YYYY-MM-DD'),
    );
    return is_disable;
  };

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    get_all_day_off();
    const today = moment();
    setMonth(today.format('YYYY-MM'));
    const yearDays = Array.from({length: 30}, (_, index) =>
      today.clone().add(index, 'days'),
    );
    setYearlyDates(yearDays);
    getUserOrders();
    checkLanguage();
  }, [isVisible]);

  const handleCheckBoxPress = async (date, check) => {
    setSelectedMap(prevSelectedMap => ({
      ...prevSelectedMap,
      [date.format('YYYY-MM-DD')]: check,
    }));
    const order = {
      user_id: authData.data.data.id,
      date: date.format('YYYY-MM-DD'),
      dayOrNight: check,
      position: '',
    };

    try {
      const orderSuccess = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}`,
        order,
        config,
      );

      if (orderSuccess?.data?.success) {
        showMessage('ordSuc', 'success', 1000);
        getUserOrders();
      } else {
        getUserOrders();
        showMessage('ordered', 'warning', 1000);
      }
    } catch (error) {
      showMessage('networkError', 'error', 1000);
    }
  };

  const handleOrderShow = () => {
    setIsVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header
        title={t('order.title', 'Đơn hàng')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {yearlyDates.map((date, index) => {
          const isDayOff =
            date.format('dd') === 'Su' ||
            date.format('dd') === 'Sa' ||
            dayoffs.includes(date.format('YYYY-MM-DD'));
          return (
            <View key={index} style={styles.dayContainer}>
              <View
                style={[
                  styles.dayHeader,
                  isDayOff ? styles.dayHeaderOff : null,
                ]}>
                <Text
                  style={[
                    styles.dayHeaderWeekText,
                    isDayOff ? styles.dayHeaderTextOff : null,
                  ]}>
                  {t(date.format('dd'))}
                </Text>
                <Text
                  style={[
                    styles.dayHeaderText,
                    isDayOff ? styles.dayHeaderTextOff : null,
                  ]}>
                  {date.format('DD/MM')}
                </Text>
              </View>
              <View style={styles.checkBoxContainer}>
                {isDayOff ? (
                  <View style={styles.emptyCheckBox}></View>
                ) : (
                  ['DAY', 'NIGHT'].map(check => (
                    <TouchableOpacity
                      disabled={disable_ordered_btn(date)}
                      key={check}
                      style={[
                        styles.checkBox,
                        (selectedMap[date.format('YYYY-MM-DD')] === check ||
                          check_ordered(date, check)) &&
                          styles.checkBoxSelected,
                      ]}
                      onPress={() => {
                        handleCheckBoxPress(date, check);
                      }}>
                      <Text
                        style={[
                          styles.checkBoxText,
                          (selectedMap[date.format('YYYY-MM-DD')] === check ||
                            check_ordered(date, check)) &&
                            styles.checkBoxTextSelected,
                        ]}>
                        {check === 'DAY' ? t('dd') : t('nn')}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
              {isDayOff && (
                <Text style={styles.noMealText}>{t('no.meal.today')}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
      <TouchableOpacity onPress={handleOrderShow}>
        <View style={styles.orderDetailForUser}>
          <Text style={styles.orderDetailText}>{month}</Text>
          <Text style={styles.orderDetailText}>
            {t('ord')}: {ordered.length}
          </Text>
          <Text style={styles.orderDetailText}>
            {t('pid')}: {picked}
          </Text>
        </View>
      </TouchableOpacity>
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={messageModal}
        type={messageType}
        t={t}
        duration={duration}
      />
      <OrderModal
        visible={isVisible}
        orders={ordered}
        onClose={() => {
          setIsVisible(!isVisible);
        }}
        getUserOrders={getUserOrders}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollViewContent: {
    padding: SIZES.base * 2,
    paddingBottom: 24,
  },
  dayContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    marginBottom: 14,
    ...SHADOWS.light,
    padding: SIZES.base,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGray1,
    borderRadius: SIZES.radius,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dayHeaderWeekText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dayHeaderOff: {
    backgroundColor: COLORS.danger,
  },
  dayHeaderText: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  dayHeaderTextOff: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  checkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 4,
  },
  checkBox: {
    minWidth: 80,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    marginHorizontal: 6,
    ...SHADOWS.light,
  },
  checkBoxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkBoxText: {
    ...FONTS.body4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  checkBoxTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emptyCheckBox: {
    minWidth: 80,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray2,
    marginHorizontal: 6,
  },
  orderDetailForUser: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    margin: SIZES.base * 2,
    padding: SIZES.base * 2,
    ...SHADOWS.light,
  },
  orderDetailText: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  noMealText: {
    ...FONTS.body4,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default Order;
