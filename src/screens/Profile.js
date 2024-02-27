/* eslint-disable react-hooks/exhaustive-deps */
// Profile.js
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import SelectDate from '../components/SelectDate';
import {Card, Divider} from 'react-native-elements';
import moment from 'moment';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  USER_URL,
  CHECKIN,
  SEARCH,
} from '../utils/Strings';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
const Profile = () => {
  const authData = useSelector(state => state.auth);
  const user_id = authData?.data?.data?.id;
  const [userInfo, setUserInfo] = useState({});
  const [userCheckin, setUserCheckin] = useState([]);
  const [today, setToday] = useState(moment().format('YYYY-MM-DD'));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const year = moment(today).format('YYYY');
  const month = moment(today).format('MM');
  const totalWorkTime = userCheckin.reduce(
    (total, checkin) => total + checkin.work_time,
    0,
  );
  const totalOverTime = userCheckin.reduce(
    (total, checkin) => total + checkin.over_time,
    0,
  );

  const get_checkin_of_user = async () => {
    const res = await axios.post(
      `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${SEARCH}`,
      {
        user_id: user_id,
        date: today,
      },
    );
    if (res?.data?.success) {
      setUserCheckin(res?.data?.data);
    } else {
      console.log(res?.data?.message);
    }
  };

  const get_user_info = async () => {
    const res = await axios.get(
      `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}/${user_id}`,
    );
    if (res?.data?.success) {
      setUserInfo(res.data.data);
    } else {
      console.log(res?.data?.message);
    }
  };

  useEffect(() => {
    get_user_info();
    get_checkin_of_user();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <Card containerStyle={styles.card}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.info}>{userInfo.name}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.info}>{userInfo.email}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.label}>Staff Code:</Text>
          <Text style={styles.info}>{userInfo.employee_id}</Text>
        </Card>
        <Card containerStyle={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Month</Text>
            <Text style={styles.headerText}>Work Time</Text>
            <Text style={styles.headerText}>Over Time</Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              onPress={() => {
                setIsModalVisible(!isModalVisible);
              }}
              style={styles.cellText}>
              {year}/{month}
            </Text>
            <Text style={styles.cellText}>{totalWorkTime}</Text>
            <Text style={styles.cellText}>{totalOverTime}</Text>
          </View>
        </Card>
        <Text style={styles.subtitle}>Check-in History</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Date</Text>
          <Text style={styles.headerText}>In</Text>
          <Text style={styles.headerText}>Out</Text>
          <Text style={styles.headerText}>Work Time</Text>
          <Text style={styles.headerText}>Shift</Text>
          <Text style={styles.headerText}>Over Time</Text>
        </View>
        <FlatList
          data={userCheckin}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.tableRow}>
              <Text style={styles.cellText}>{item.date}</Text>
              <Text style={styles.cellText}>{item.time_in}</Text>
              <Text style={styles.cellText}>{item.time_out}</Text>
              <Text style={styles.cellText}>{item.work_time}</Text>
              <Text style={styles.cellText}>{item.work_shift}</Text>
              <Text style={styles.cellText}>{item.over_time}</Text>
            </View>
          )}
        />
        <SelectDate
          visible={isModalVisible}
          onClose={() => setIsModalVisible(!isModalVisible)}
          setSelectedDate={setToday}
          getCheckin={get_checkin_of_user}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    color: THEME_COLOR,
  },
  card: {
    marginVertical: 5,
    padding: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  info: {
    marginBottom: 5,
    fontSize: 16,
    color: '#555',
  },
  divider: {
    marginVertical: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
});

export default Profile;
