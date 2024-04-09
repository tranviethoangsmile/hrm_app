/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Button,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  USER_URL,
  GET_USER_WITH_DEPARTMENT_ID,
} from '../utils/Strings';
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import {color} from 'react-native-elements/dist/helpers';

const Leave = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);

  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const [fromDate, setFromDate] = useState(moment().toDate());
  const [toDate, setToDate] = useState(moment().add(1, 'day').toDate());

  const [leaderList, setLeaderList] = useState([]);
  const [leaderValue, setLeaderValue] = useState(''); // Might be useful later
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [reason, setReason] = useState('');
  const [isSelectFromModal, setIsSelectFromModal] = useState(false);
  const [isSelectToModal, setIsSelectToModal] = useState(false);

  const getLeaderList = async () => {
    try {
      const field = {
        department_id: authData?.data?.data.department_id,
      };
      const listUser = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${GET_USER_WITH_DEPARTMENT_ID}`,
        {
          ...field,
        },
      );
      if (listUser?.data?.success) {
        const formattedList = listUser?.data?.data.map(leader => ({
          label: leader.name, // Assuming leader data has a name property
          value: leader.id, // Assuming leader data has an id property
        }));
        console.log(formattedList);
        setLeaderList(formattedList);
      } else {
        showAlert('contactAdmin');
      }
    } catch (error) {
      showAlert('networkError');
    }
  };
  const handleSelectFromDate = date => {
    setFromDate(date);
    setIsSelectFromModal(false);
  };

  const handleSelectToDate = date => {
    setToDate(date);
    setIsSelectToModal(false);
  };

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
    getLeaderList();
  }, []); // Add empty dependency array to avoid warning
  const handleSelectLeader = value => {
    console.log(value);
    setLeaderValue(value);
  };
  return (
    <View style={styles.container}>
      <View style={styles.viewDateContainer}>
        <View style={styles.dateFromContainer}>
          <Text>From:</Text>
          <Button
            title={moment(fromDate).format('YYYY-MM-DD')}
            onPress={() => setIsSelectFromModal(true)}
          />
          <Modal
            visible={isSelectFromModal}
            transparent={true}
            animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DatePicker
                  date={fromDate}
                  mode="date"
                  onDateChange={handleSelectFromDate}
                />
                <Button
                  title="Close"
                  onPress={() => setIsSelectFromModal(false)}
                />
              </View>
            </View>
          </Modal>
        </View>
        <View style={styles.dateToContainer}>
          <Text>To:</Text>
          <Button
            title={moment(toDate).format('YYYY-MM-DD')}
            onPress={() => setIsSelectToModal(true)}
          />
          <Modal
            visible={isSelectToModal}
            transparent={true}
            animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DatePicker
                  date={toDate}
                  mode="date"
                  onDateChange={handleSelectToDate}
                />
                <Button
                  title="Close"
                  onPress={() => setIsSelectToModal(false)}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>

      <View style={styles.ViewReason}>
        <View style={styles.reasonText}>
          <Text>{t('reason')}</Text>
        </View>
        <View style={styles.reationInput}>
          <TextInput
            placeholder={t('enterR')}
            multiline={true}
            onChangeText={text => setReason(text)}
            placeholderTextColor={TEXT_COLOR}
            style={{padding: 10}}
          />
        </View>
      </View>
      <View style={styles.viewSelectLeader}>
        <View style={styles.selectText}>
          <Text>{t('sTo')}</Text>
        </View>
        <View style={styles.selectBox}>
          <DropDownPicker
            open={open}
            value={value}
            setValue={val => setValue(val)}
            setOpen={() => setOpen(!open)}
            items={leaderList}
            maxHeight={300}
            autoScroll
            onChangeValue={item => handleSelectLeader(item)}
            placeholder={t('selectName')}
            placeholderStyle={{color: TEXT_COLOR}}
            zIndexInverse={1000}
            dropDownContainerStyle={{
              backgroundColor: '#dfdfdf',
            }}
          />
        </View>
      </View>
      <LinearGradient colors={[THEME_COLOR, THEME_COLOR_2]} style={styles.btn}>
        <TouchableOpacity>
          <Text style={styles.btnText}>{t('Send')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  btnText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  btn: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    color: '#fff',
  },
  viewDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: Dimensions.get('window').width / 2,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderWidth: 0.5,
  },
  dateFromContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: Dimensions.get('window').width / 2,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderWidth: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },

  dateSelectView: {
    flexDirection: 'row',
  },

  container: {
    flex: 1,
  },
  reationInput: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 7,
    marginRight: 10,
  },
  ViewReason: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
    height: 45,
  },
  reasonText: {width: '20%', justifyContent: 'center', marginLeft: 10},
  viewSelectLeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  selectText: {
    width: '20%',
    justifyContent: 'center',
    marginLeft: 10,
  },
  selectBox: {
    flex: 1,
    width: '60%',
    maxHeight: 300,
    marginRight: 10,
  },
});

export default Leave;
