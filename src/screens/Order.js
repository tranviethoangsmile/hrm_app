/* eslint-disable no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
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
import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {BASE_URL, LOGIN_URL, ORDER_URL, PORT} from '../utils/Strings';
import {BG, TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
const Order = () => {
  const authData = useSelector(state => state.auth);
  const [yearlyDates, setYearlyDates] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.data.token}`, // Thêm token vào header Authorization
    },
  };
  useEffect(() => {
    // Lấy ngày hiện tại
    const today = moment();
    // Tính toán ngày bắt đầu của năm
    const startOfYear = today.startOf('year');
    // Tạo mảng chứa ngày của cả năm
    const yearDays = Array.from({length: 366}, (_, index) =>
      startOfYear.clone().add(index, 'days'),
    );
    // Cập nhật state với mảng ngày của năm
    setYearlyDates(yearDays);
  }, []);
  const handleCheckBoxPress = async (date, check) => {
    setSelectedMap(prevSelectedMap => ({
      ...prevSelectedMap,
      [date.format('yyyy / M / D')]: check,
    }));
    const order = {
      user_id: authData.data.data.id,
      date: date.format('yyyy/MM/DD'),
      dayOrNight: check,
      position: '',
    };
    const orderSuccess = await axios.post(
      BASE_URL + PORT + ORDER_URL,
      order,
      config,
    );
    if (orderSuccess?.data?.success) {
      Alert.alert('success');
    } else {
      Alert.alert('not success');
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {yearlyDates.map((date, index) => (
        <View key={index} style={styles.dayContainer}>
          <View
            style={{
              backgroundColor:
                date.format('dddd') === 'Sunday' ||
                date.format('dddd') === 'Saturday'
                  ? THEME_COLOR_2
                  : BG.WHITE, // Use consistent color naming
            }}>
            <Text
              style={[
                styles.dayText,
                {
                  color:
                    date.format('dddd') === 'Sunday' ||
                    date.format('dddd') === 'Saturday'
                      ? TEXT_COLOR
                      : 'black',
                },
              ]}>
              {date.format('dddd')} {date.format('yyyy / M / D')}
            </Text>
          </View>
          <View style={styles.wrapper}>
            {['DAY', 'NIGHT'].map(check => (
              <View key={check} style={styles.checkBox}>
                <Text style={styles.text}>{check}</Text>
                <TouchableOpacity
                  style={styles.outter}
                  onPress={() => {
                    handleCheckBoxPress(date, check);
                  }}>
                  {selectedMap[date.format('yyyy / M / D')] === check && (
                    <View style={styles.inner} />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
export default Order;

const styles = StyleSheet.create({
  inner: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  outter: {
    flex: 1,
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 10,
    margin: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBox: {
    alignItems: 'center',
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  text: {
    color: 'red',
    textTransform: 'capitalize',
  },
  container: {
    justifyContent: 'center',
    flexDirection: 'column',
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 5,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
