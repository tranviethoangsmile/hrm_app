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
} from 'react-native';
import {ModalMessage} from '../components';
import {useSelector} from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/constans';
import OrderModal from '../components/OrderModal';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.data.token}`,
    },
  };
  const showAlert = message => {
    Alert.alert(t('noti'), message);
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {yearlyDates.map((date, index) => (
          <View key={index} style={[styles.dayContainer]}>
            <View
              style={[
                styles.dayHeader,
                {
                  backgroundColor:
                    date.format('dd') === 'Su' || date.format('dd') === 'Sa'
                      ? '#257abe'
                      : '#f5f5f5',
                },
              ]}>
              <Text
                style={[
                  styles.dayHeaderText,
                  {
                    color:
                      date.format('dd') === 'Su' || date.format('dd') === 'Sa'
                        ? 'white'
                        : 'black',
                  },
                ]}>
                {t(date.format('dd'))} {date.format('YYYY-MM-DD')}
              </Text>
            </View>
            <View style={styles.checkBoxContainer}>
              {['DAY', 'NIGHT'].map(check =>
                date.format('dd') === 'Su' || date.format('dd') === 'Sa' ? (
                  <View key={check} style={styles.emptyCheckBox}></View>
                ) : (
                  <TouchableOpacity
                    disabled={disable_ordered_btn(date)}
                    key={check}
                    style={[
                      styles.checkBox,
                      {
                        backgroundColor:
                          selectedMap[date.format('YYYY-MM-DD')] === check ||
                          check_ordered(date, check)
                            ? '#257abe'
                            : 'transparent',
                        borderWidth:
                          selectedMap[date.format('YYYY-MM-DD')] === check
                            ? 0
                            : 1,
                      },
                    ]}
                    onPress={() => {
                      handleCheckBoxPress(date, check);
                    }}>
                    <Text style={styles.checkBoxText}>
                      {check === 'DAY' ? t('dd') : t('nn')}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        ))}
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
    flexDirection: 'column',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 5,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayHeader: {
    flex: 2,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  checkBoxContainer: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkBox: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  emptyCheckBox: {
    flex: 1,
  },
  checkBoxText: {
    color: 'black',
    textTransform: 'capitalize',
  },
  orderDetailForUser: {
    height: 70,
    backgroundColor: '#257abe',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  orderDetailText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Order;
