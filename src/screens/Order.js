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
import {
  API,
  BASE_URL_DEV,
  ORDER_URL,
  PORT_DEV,
  V1,
  VERSION,
} from '../utils/Strings';

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
        `${BASE_URL_DEV}${PORT_DEV}${API}${VERSION}${V1}${ORDER_URL}`,
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
      <View style={styles.orderDetailForUser}>
        <Text style={styles.orderDetailText}>2024/02</Text>
        <Text style={styles.orderDetailText}>Ordered: 15</Text>
        <Text style={styles.orderDetailText}>Taken: 10</Text>
      </View>
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
  },
});

export default Order;
