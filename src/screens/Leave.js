/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
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
import DropDownPicker from 'react-native-dropdown-picker';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  USER_URL,
  GET_USER_WITH_DEPARTMENT_ID,
  PAID_LEAVE,
  CREATE,
} from '../utils/Strings';
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import CheckBox from '@react-native-community/checkbox';
import Loader from '../components/Loader';

const Leave = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);

  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const today = moment().toDate();
  const [dayOff, setDayOff] = useState(moment().add(1, 'day').toDate());

  const [leaderList, setLeaderList] = useState([]);
  const [leaderValue, setLeaderValue] = useState(''); // Might be useful later
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [reason, setReason] = useState('');
  const [isSelectToModal, setIsSelectToModal] = useState(false);
  const [is_paid, setIs_paid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);

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
        setLeaderList(formattedList);
      } else {
        showAlert('contactAdmin');
      }
    } catch (error) {
      showAlert('networkError');
    }
  };

  const handleSelectToDate = date => {
    setDayOff(date);
    setIsSelectToModal(false);
  };
  const handleRequestDayOffPaid = async () => {
    setIsLoading(!isLoading);
    try {
      const field = {
        user_id: authData?.data?.data.id,
        reason: reason,
        leader_id: leaderValue,
        date_request: moment(today).format('YYYY-MM-DD'),
        is_paid: is_paid,
        date_leave: moment(dayOff).format('YYYY-MM-DD'),
        position: authData?.data?.data.position,
      };
      const paidleave = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${CREATE}`,
        {
          ...field,
        },
      );
      if (paidleave?.data?.success) {
        setIsLoading(false);
        showAlert('success');
      } else {
        setIsLoading(false);
        showAlert('unSuccess');
      }
    } catch (error) {
      console.log(error);
      showAlert('networkError');
    }
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
    setLeaderValue(value);
  };
  const showHandleButtonModal = () => {
    setModal(true);
  };
  return (
    <View style={styles.container}>
      <Modal visible={modal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalheader}>
            <TouchableOpacity onPress={() => setModal(!modal)}>
              <Icon name="times" color={THEME_COLOR} size={30} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.dayOffViewContainer}>
              <View style={styles.dayOffTextView}>
                <Text style={styles.text}>{t('d.off')}</Text>
              </View>
              <View style={styles.dayOffSelectView}>
                <Button
                  title={moment(dayOff).format('YYYY-MM-DD')}
                  onPress={() => setIsSelectToModal(true)}
                />
              </View>
              <Modal
                visible={isSelectToModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsSelectToModal(false)}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      date={dayOff}
                      mode="date"
                      onDateChange={handleSelectToDate}
                      textColor={TEXT_COLOR} // Color of the selected date
                      dayTextColor="#333" // Color of the day text
                      monthTextColor="#333" // Color of the month text
                      yearTextColor="#333" // Color of the year text
                    />
                    <Button
                      title="Close"
                      onPress={() => setIsSelectToModal(false)}
                    />
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.reasonViewContainer}>
              <View style={styles.reasonTextView}>
                <Text style={styles.text}>{t('reason')}</Text>
              </View>
              <View style={styles.reasonInputView}>
                <TextInput
                  placeholder={t('enterR')}
                  multiline={true}
                  onChangeText={text => setReason(text)}
                  placeholderTextColor={TEXT_COLOR}
                  style={{color: TEXT_COLOR}}
                />
              </View>
            </View>
            <View style={styles.checkBoxViewContainer}>
              <CheckBox
                tintColors={{true: 'red', false: 'black'}}
                value={is_paid}
                style={[styles.checkBox]}
                onChange={() => setIs_paid(!is_paid)}
              />
              <Text style={[styles.text, , {marginLeft: 20}]}>
                {t('off.p')}
              </Text>
            </View>
            <View style={styles.receiverViewContainer}>
              <View style={styles.receiverTextView}>
                <Text style={[styles.text]}>{t('sTo')}</Text>
              </View>
              <View style={styles.receiverSelectView}>
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
            <LinearGradient
              style={styles.btnSendRequest}
              colors={[THEME_COLOR, THEME_COLOR_2]}>
              <TouchableOpacity onPress={handleRequestDayOffPaid}>
                <Text style={[styles.text, {color: 'white'}]}>{t('Send')}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
      <View style={styles.handleButtonShowModal}>
        <TouchableOpacity onPress={showHandleButtonModal}>
          <Icon name="send" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
      <Loader visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  modalheader: {
    position: 'absolute',
    right: 40,
    top: 100,
  },
  handleButtonShowModal: {
    position: 'absolute',
    backgroundColor: '#5e81ac',
    width: Dimensions.get('screen').width * 0.5,
    height: Dimensions.get('screen').height * 0.1,
    borderWidth: 0.2,
    borderRadius: 50,
    bottom: 10,
    right: 15,
    justifyContent: 'center',
    alignItems: 'center',
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
  btnSendRequest: {
    width: Dimensions.get('screen').width * 0.5,
    height: Dimensions.get('screen').height * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Dimensions.get('screen').height * 0.15,
    borderWidth: 0.1,
    borderRadius: 8,
    alignContent: 'center',
    marginHorizontal: Dimensions.get('screen').width * 0.1,
  },
  checkBoxViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderRadius: 8,
    marginTop: 15,
  },
  checkBox: {
    marginLeft: 20,
  },
  receiverSelectView: {
    flex: 1,
  },
  receiverTextView: {
    width: '20%',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiverViewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderRadius: 8,
    marginTop: 15,
    maxHeight: 300,
  },
  reasonInputView: {flex: 1},
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  reasonTextView: {
    width: '20%',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: TEXT_COLOR,
    fontWeight: '500',
  },
  dayOffViewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderRadius: 8,
  },
  reasonViewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderRadius: 8,
    marginTop: 15,
  },
  dayOffTextView: {
    width: '20%',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayOffSelectView: {
    flex: 1,
  },
});

export default Leave;
