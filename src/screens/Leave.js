/* eslint-disable react-native/no-inline-styles */
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
  RefreshControl,
  FlatList,
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
  SEARCH,
} from '../utils/Strings';
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import CheckBox from '@react-native-community/checkbox';
import Loader from '../components/Loader';
import {SwipeListView} from 'react-native-swipe-list-view';

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
  const [is_half, setIs_half] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [leaveRequested, setLeaveRequested] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setError] = useState('');

  const getValueRequestLeave = async () => {
    try {
      const field = {
        user_id: authData?.data?.data?.id,
      };
      const leaves = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${SEARCH}`,
        {
          ...field,
        },
      );
      if (leaves?.data.success) {
        setError('');
        setIsLoading(false);
        const sortedPosts = leaves.data.data.sort(
          (a, b) => new Date(b.date_leave) - new Date(a.date_leave),
        );
        setLeaveRequested(sortedPosts);
      } else {
        throw new Error('not.data');
      }
    } catch (error) {
      setIsLoading(false);
      setError(t(error.message));
    }
  };

  const getLeaderList = async () => {
    try {
      setIsLoading(true);
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
          label: leader.name,
          value: leader.id,
        }));
        setLeaderList(formattedList);
      } else {
        throw new Error('contactAdmin');
      }
    } catch (error) {
      showAlert(error.message);
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
        is_half: is_half,
      };
      const paidleave = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${CREATE}`,
        {
          ...field,
        },
      );
      if (paidleave?.data?.success) {
        onRefresh();
        setIsLoading(false);
        setModal(false);
        showAlert('success');
      } else {
        setIsLoading(false);
        setModal(false);
        throw new Error('unSuccess');
      }
    } catch (error) {
      setModal(false);
      showAlert(error.message);
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
    getValueRequestLeave();
  }, []); // Add empty dependency array to avoid warning
  const handleSelectLeader = value => {
    setLeaderValue(value);
  };
  const showHandleButtonModal = () => {
    setModal(true);
  };

  const renderHiddenItem = ({item}) => (
    <View style={styles.rowBack}>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.btnTitle}>{t('EDIT')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            t('plzcof'),
            t('wantDelete'),
            [
              {
                text: t('dl'),
                onPress: () => {
                  handleDeleteLeaveRequest(item.id);
                },
              },
            ],
            {cancelable: true},
          );
        }}
        style={styles.deleteBtn}>
        <Text style={styles.btnTitle}>{t('DELETE')}</Text>
      </TouchableOpacity>
    </View>
  );
  const handleDeleteLeaveRequest = id => {
    try {
      console.log(`deleting leave request ${id}`);
    } catch (error) {
      showAlert('networkError');
    }
  };
  const renderItem = ({item, index}) => (
    <View
      key={index}
      style={[
        styles.rowFront,
        {
          backgroundColor: item.feedback
            ? '#D1BB9E'
            : item.is_confirm
            ? 'green'
            : 'white',
        },
      ]}>
      <Text style={[styles.text]}>{item.date_leave}</Text>
      <Text style={[styles.text]}>
        {item.is_paid ? t('off.p') : t('unPaid')}
      </Text>
      <Text style={[styles.text, {color: item.is_approve ? 'green' : 'red'}]}>
        {item.is_approve ? t('approved') : t('awaiting')}
      </Text>

      {item.feedback ? <Text style={[styles.text]}>{item.feedback}</Text> : ''}
    </View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    getValueRequestLeave();
    setRefreshing(false);
  };
  return (
    <View style={styles.container}>
      <Loader visible={isLoading} />
      {err ? <Text style={styles.title}>{err}</Text> : ''}

      <SwipeListView
        data={leaveRequested}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        leftOpenValue={75}
        rightOpenValue={-75}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
                  style={{color: TEXT_COLOR}}
                  onChangeText={text => setReason(text)}
                  placeholderTextColor={TEXT_COLOR}
                />
              </View>
            </View>
            <View style={styles.checkBoxViewContainer}>
              <View>
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
              <View>
                <CheckBox
                  tintColors={{true: 'red', false: 'black'}}
                  value={is_half}
                  style={[styles.checkBox]}
                  onChange={() => setIs_half(!is_half)}
                />
                <Text style={[styles.text, , {marginLeft: 20}]}>
                  {t('half.d')}
                </Text>
              </View>
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
  rowFront: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: Dimensions.get('screen').width * 0.95,
    height: Dimensions.get('screen').height * 0.05,
  },
  btnTitle: {
    fontSize: 17,
    color: 'white',
    fontWeight: '600',
  },
  deleteBtn: {
    width: '20%',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    width: '20%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: TEXT_COLOR,
  },
  titleListLeaveRequest: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxHeight: Dimensions.get('screen').height * 0.05,
    width: Dimensions.get('screen').width * 0.95,
    backgroundColor: '#fff',
  },
  modalheader: {
    position: 'absolute',
    right: 40,
    top: 90,
  },
  handleButtonShowModal: {
    position: 'absolute',
    backgroundColor: '#5e81ac',
    width: Dimensions.get('screen').width * 0.3,
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
    justifyContent: 'space-around',
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
