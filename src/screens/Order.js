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
import {BG, TEXT_COLOR, THEME_COLOR_2} from '../utils/Colors';

const Order = () => {
  const authData = useSelector(state => state.auth);
  const [yearlyDates, setYearlyDates] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.data.token}`,
    },
  };

  useEffect(() => {
    const today = moment();
    const yearDays = Array.from({length: 366}, (_, index) =>
      today.clone().add(index, 'days'),
    );
    setYearlyDates(yearDays);
  }, []);

  const handleCheckBoxPress = async (date, check) => {
    setSelectedMap(prevSelectedMap => ({
      ...prevSelectedMap,
      [date.format('YYYY / M / D')]: check,
    }));

    const order = {
      user_id: authData.data.data.id,
      date: date.format('YYYY/MM/DD'),
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
        Alert.alert('Success');
      } else {
        Alert.alert('Not Success');
      }
    } catch (error) {
      console.error('Error during order:', error);
      Alert.alert('An error occurred during the order process.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {yearlyDates.map((date, index) => (
        <View key={index} style={styles.dayContainer}>
          <View
            style={[
              styles.dayHeader,
              {
                backgroundColor:
                  date.format('dddd') === 'Sunday' ||
                  date.format('dddd') === 'Saturday'
                    ? THEME_COLOR_2
                    : BG.WHITE,
              },
            ]}>
            <Text
              style={[
                styles.dayHeaderText,
                {
                  color:
                    date.format('dddd') === 'Sunday' ||
                    date.format('dddd') === 'Saturday'
                      ? TEXT_COLOR
                      : 'black',
                },
              ]}>
              {date.format('dddd')} {date.format('YYYY/MM/DD')}
            </Text>
          </View>
          <View style={styles.checkBoxContainer}>
            {['DAY', 'NIGHT'].map(check => (
              <View key={check} style={styles.checkBox}>
                <Text style={styles.checkBoxText}>{check}</Text>
                <TouchableOpacity
                  style={styles.outer}
                  onPress={() => {
                    handleCheckBoxPress(date, check);
                  }}>
                  {selectedMap[date.format('YYYY / M / D')] === check && (
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

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flexDirection: 'column',
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
  },
  checkBoxText: {
    color: 'red',
    textTransform: 'capitalize',
  },
  outer: {
    flex: 1,
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 10,
    margin: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
});

export default Order;
