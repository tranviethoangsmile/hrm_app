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
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/Strings';
import OrderModal from '../components/OrderModal';

const Order = () => {
  const authData = useSelector(state => state.auth);
  const [yearlyDates, setYearlyDates] = useState([]);
  const [month, setMonth] = useState('');
  const [selectedMap, setSelectedMap] = useState({});
  const [ordered, setOrdered] = useState([]);
  const [picked, setPicked] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.data.token}`,
    },
  };
  const showAlert = message => {
    Alert.alert('Notification: ', message);
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
        let pick = 0;
        for (let i = 0; i < res?.data?.data.length; i++) {
          if (res?.data?.data[i].isPicked === true) {
            pick++;
          }
          setPicked(pick);
        }
      } else {
        showAlert('please back to home page and login again!');
      }
    } catch (error) {
      showAlert(error.message);
    }
  };
  useEffect(() => {
    const today = moment();
    setMonth(today.format('YYYY/MM'));
    const yearDays = Array.from({length: 366}, (_, index) =>
      today.clone().add(index, 'days'),
    );
    setYearlyDates(yearDays);
    getUserOrders();
  }, [isVisible]);

  const handleCheckBoxPress = async (date, check) => {
    setSelectedMap(prevSelectedMap => ({
      ...prevSelectedMap,
      [date.format('YYYY/MM/DD')]: check,
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
        getUserOrders();
        showAlert('success');
      } else {
        getUserOrders();
        showAlert(orderSuccess?.data?.message);
      }
    } catch (error) {
      console.error('Error during order:', error);
      showAlert(error.message);
    }
  };

  const handleOrderShow = () => {
    setIsVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {yearlyDates.map((date, index) => (
          <View key={index} style={styles.dayContainer}>
            <View
              style={[
                styles.dayHeader,
                {
                  backgroundColor:
                    date.format('dddd') === 'Sunday' ||
                    date.format('dddd') === 'Saturday'
                      ? '#3b5998'
                      : '#f5f5f5',
                },
              ]}>
              <Text
                style={[
                  styles.dayHeaderText,
                  {
                    color:
                      date.format('dddd') === 'Sunday' ||
                      date.format('dddd') === 'Saturday'
                        ? 'white'
                        : 'black',
                  },
                ]}>
                {date.format('dddd')} {date.format('YYYY/MM/DD')}
              </Text>
            </View>
            <View style={styles.checkBoxContainer}>
              {['DAY', 'NIGHT'].map(check =>
                date.format('dddd') === 'Sunday' ||
                date.format('dddd') === 'Saturday' ? (
                  <View key={check} style={styles.emptyCheckBox}></View>
                ) : (
                  <TouchableOpacity
                    key={check}
                    style={[
                      styles.checkBox,
                      {
                        backgroundColor:
                          selectedMap[date.format('YYYY/MM/DD')] === check
                            ? '#3b5998'
                            : 'transparent',
                        borderWidth:
                          selectedMap[date.format('YYYY/MM/DD')] === check
                            ? 0
                            : 1,
                      },
                    ]}
                    onPress={() => {
                      handleCheckBoxPress(date, check);
                    }}>
                    <Text style={styles.checkBoxText}>{check}</Text>
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
          <Text style={styles.orderDetailText}>Ordered: {ordered.length}</Text>
          <Text style={styles.orderDetailText}>Picked: {picked}</Text>
        </View>
      </TouchableOpacity>
      <OrderModal
        visible={isVisible}
        orders={ordered}
        onClose={() => {
          setIsVisible(!isVisible);
        }}
        showAlert={showAlert}
        getUserOrders={getUserOrders}
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
    backgroundColor: '#3b5998',
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
