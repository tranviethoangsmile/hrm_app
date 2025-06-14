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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Image,
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
import IconIon from 'react-native-vector-icons/Ionicons';
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
} from '../utils/constans';
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import CheckBox from '@react-native-community/checkbox';
import Loader from '../components/Loader';
import {SwipeListView} from 'react-native-swipe-list-view';
import ModalMessage from '../components/ModalMessage';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';

const Leave = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();

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
  const [modalMessage, setModalMessage] = useState({
    visible: false,
    type: 'info',
    message: '',
  });
  const [errorReason, setErrorReason] = useState(false);
  const [errorDayOff, setErrorDayOff] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

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
    // Validate
    let hasError = false;
    if (!reason.trim()) {
      setErrorReason(true);
      hasError = true;
    } else {
      setErrorReason(false);
    }
    if (!dayOff) {
      setErrorDayOff(true);
      hasError = true;
    } else {
      setErrorDayOff(false);
    }
    if (hasError) {
      setModalMessage({
        visible: true,
        type: 'error',
        message: 'Vui lòng nhập đầy đủ ngày nghỉ và lý do',
      });
      return;
    }
    setErrorReason(false);
    setErrorDayOff(false);
    setIsLoading(true);
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
        setModalMessage({
          visible: true,
          type: 'success',
          message: 'Gửi đơn thành công!',
        });
      } else {
        setIsLoading(false);
        setModal(false);
        setModalMessage({
          visible: true,
          type: 'error',
          message: 'Gửi đơn thất bại!',
        });
      }
    } catch (error) {
      setModal(false);
      setIsLoading(false);
      setModalMessage({
        visible: true,
        type: 'error',
        message: t(error.message),
      });
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

  const openEditModal = item => {
    setEditLeave(item);
    setReason(item.reason || '');
    setDayOff(moment(item.date_leave).toDate());
    setIs_paid(item.is_paid);
    setIs_half(item.is_half);
    setLeaderValue(item.leader_id || '');
    setModal(true);
  };
  const handleDeleteLeaveRequest = async id => {
    setOpenMenuId(null);
    setModalMessage({
      visible: true,
      type: 'success',
      message: 'Đã xóa đơn nghỉ (giả lập)',
    });
    // await ...
    // onRefresh();
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

  const EmployeeCard = () => (
    <View style={styles.employeeCardContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.employeeCardGradient}>
        {/* Card Header */}
        <View style={styles.employeeCardHeader}>
          <Text style={styles.companyNameText}>DAIHATSU METAL</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileBtn}>
            <IconIon
              name="person-outline"
              size={16}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>

        {/* Employee Info */}
        <View style={styles.employeeCardInfo}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.employeeAvatarContainer}>
            <Image
              source={
                authData?.data?.data?.avatar
                  ? {uri: authData.data.data.avatar}
                  : require('../assets/images/avatar.jpg')
              }
              style={styles.employeeCardAvatar}
            />
          </TouchableOpacity>

          <View style={styles.employeeCardDetails}>
            <Text style={styles.employeeCardName}>
              {authData?.data?.data?.name || '---'}
            </Text>
            <Text style={styles.employeeCardPosition}>
              {authData?.data?.data?.position || 'Employee'}
            </Text>
            <View style={styles.employeeContactRow}>
              <IconIon
                name="mail-outline"
                size={11}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.employeeCardEmail} numberOfLines={1}>
                {authData?.data?.data?.email || 'email@company.com'}
              </Text>
            </View>
          </View>

          <View style={styles.employeeCardIdSection}>
            <Text style={styles.employeeIdLabelText}>ID</Text>
            <Text style={styles.employeeCardIdText}>
              {authData?.data?.data?.employee_id || '---'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={100}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: '#f5f6fa'}}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />
      <Header
        title={t('leave.title', 'Đơn nghỉ phép')}
        onBack={() => navigation.goBack()}
      />
      <Loader visible={isLoading} />
      {err ? <Text style={styles.title}>{err}</Text> : ''}
      <FlatList
        data={leaveRequested}
        keyExtractor={item => item.id?.toString()}
        ListHeaderComponent={<EmployeeCard />}
        renderItem={({item, index}) => (
          <>
            <View style={styles.leaveFeedBlockModern}>
              <TouchableOpacity
                style={styles.menuBtnFlat}
                onPress={() => {
                  setOpenMenuId(item.id);
                }}>
                <Icon name="ellipsis-v" size={18} color="#b0b3b8" />
              </TouchableOpacity>
              <Text style={styles.leaveDateModern}>
                {moment(item.date_leave).format('DD/MM/YYYY')}
              </Text>
              <Text style={styles.leaveTypeModern}>
                {item.is_paid ? t('off.p') : t('unPaid')}
              </Text>
              {item.reason ? (
                <Text style={styles.leaveReasonModern}>{item.reason}</Text>
              ) : null}
              <Text style={styles.leaveStatusModern}>
                {item.is_approve ? t('approved') : t('awaiting')}
              </Text>
              {item.feedback ? (
                <Text style={styles.leaveFeedbackModern}>{item.feedback}</Text>
              ) : null}
              {/* Custom menu overlay and menu view */}
              {openMenuId === item.id && (
                <>
                  <TouchableOpacity
                    style={styles.menuOverlayModern}
                    activeOpacity={1}
                    onPressOut={() => setOpenMenuId(null)}
                  />
                  <View style={styles.menuMenuModern}>
                    <TouchableOpacity
                      style={styles.menuItemModern}
                      onPress={() => {
                        setOpenMenuId(null);
                        openEditModal(item);
                      }}>
                      <Icon name="edit" size={18} color={THEME_COLOR_2} />
                      <Text style={styles.menuTextModern}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItemModern}
                      onPress={() => {
                        setOpenMenuId(null);
                        handleDeleteLeaveRequest(item.id);
                      }}>
                      <Icon name="trash" size={18} color="#e74c3c" />
                      <Text style={[styles.menuTextModern, {color: '#e74c3c'}]}>
                        Xóa
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            {index < leaveRequested.length - 1 && (
              <View style={styles.leaveSeparatorModern} />
            )}
          </>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{paddingBottom: 40, paddingTop: 4}}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={THEME_COLOR} />
          ) : (
            <Text
              style={{
                color: '#b0b3b8',
                textAlign: 'center',
                marginTop: 40,
                fontSize: 15,
              }}>
              {t('no_leaves', 'Chưa có đơn nghỉ nào')}
            </Text>
          )
        }
      />
      <Modal visible={modal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.leaveModalOverlayModern}>
              <View style={styles.leaveModalContentModern}>
                <TouchableOpacity
                  style={styles.leaveModalCloseBtnModern}
                  onPress={() => setModal(false)}>
                  <Icon name="close" size={22} color="#888" />
                </TouchableOpacity>
                <Text style={styles.leaveModalTitleModern}>
                  {editLeave ? t('edit_leave') : t('request_leave')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.leaveInputModern,
                    errorDayOff && styles.inputErrorModern,
                  ]}
                  onPress={() => setIsSelectToModal(true)}>
                  <Icon
                    name="calendar"
                    size={18}
                    color={THEME_COLOR_2}
                    style={{marginRight: 8}}
                  />
                  <Text style={{color: dayOff ? '#222' : '#b0b3b8'}}>
                    {moment(dayOff).format('YYYY-MM-DD')}
                  </Text>
                </TouchableOpacity>
                <Modal
                  visible={isSelectToModal}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setIsSelectToModal(false)}>
                  <View style={styles.leaveModalOverlayModern}>
                    <View style={styles.leaveModalContentSmallModern}>
                      <DatePicker
                        date={dayOff}
                        mode="date"
                        onDateChange={handleSelectToDate}
                        textColor={TEXT_COLOR}
                        dayTextColor="#333"
                        monthTextColor="#333"
                        yearTextColor="#333"
                      />
                      <TouchableOpacity
                        style={styles.leaveModalDateCloseBtnModern}
                        onPress={() => setIsSelectToModal(false)}>
                        <Text
                          style={{color: THEME_COLOR_2, fontWeight: 'bold'}}>
                          {t('close')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                <TextInput
                  style={[
                    styles.leaveInputModern,
                    errorReason && styles.inputErrorModern,
                  ]}
                  placeholder={t('enterR')}
                  placeholderTextColor="#b0b3b8"
                  value={reason}
                  onChangeText={text => {
                    setReason(text);
                    if (errorReason && text.trim()) setErrorReason(false);
                  }}
                  multiline
                  maxLength={300}
                />
                <View style={styles.leaveCheckboxRowModern}>
                  <TouchableOpacity
                    style={[
                      styles.leaveCheckboxBtnModern,
                      is_paid && styles.leaveCheckboxBtnActiveModern,
                    ]}
                    onPress={() => setIs_paid(!is_paid)}>
                    <Icon
                      name={is_paid ? 'check-square' : 'square-o'}
                      size={18}
                      color={is_paid ? THEME_COLOR_2 : '#b0b3b8'}
                    />
                    <Text style={styles.leaveCheckboxLabelModern}>
                      {t('off.p')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.leaveCheckboxBtnModern,
                      is_half && styles.leaveCheckboxBtnActiveModern,
                    ]}
                    onPress={() => setIs_half(!is_half)}>
                    <Icon
                      name={is_half ? 'check-square' : 'square-o'}
                      size={18}
                      color={is_half ? THEME_COLOR_2 : '#b0b3b8'}
                    />
                    <Text style={styles.leaveCheckboxLabelModern}>
                      {t('half.d')}
                    </Text>
                  </TouchableOpacity>
                </View>
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
                  placeholderStyle={{color: '#b0b3b8'}}
                  zIndexInverse={1000}
                  dropDownContainerStyle={{backgroundColor: '#f5f6fa'}}
                  style={styles.leaveInputModern}
                />
                <TouchableOpacity
                  style={styles.leavePostBtnModern}
                  onPress={handleRequestDayOffPaid}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Icon name="send" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
      <TouchableOpacity
        style={styles.leaveFabModern}
        onPress={() => {
          setEditLeave(null);
          setReason('');
          setDayOff(moment().add(1, 'day').toDate());
          setIs_paid(true);
          setIs_half(false);
          setLeaderValue('');
          setModal(true);
        }}>
        <Icon name="plus" size={22} color="#fff" />
      </TouchableOpacity>
      <ModalMessage
        isVisible={modalMessage.visible}
        type={modalMessage.type}
        message={modalMessage.message}
        onClose={() => setModalMessage({...modalMessage, visible: false})}
        duration={1800}
        t={t}
      />
    </KeyboardAvoidingView>
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
    marginTop: Dimensions.get('screen').height * 0.01,
    borderWidth: 0.1,
    borderRadius: 8,
    alignContent: 'center',
    marginHorizontal: Dimensions.get('screen').width * 0.1,
    zIndex: -1,
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
    justifyContent: 'center',
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
  leaveFeedBlock: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  leaveSeparator: {
    height: 1,
    backgroundColor: '#e4e6eb',
    marginHorizontal: 24,
    borderRadius: 1,
    marginVertical: 4,
  },
  leaveDate: {
    fontSize: 15,
    color: '#888',
    marginRight: 8,
  },
  leaveStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaveType: {
    fontSize: 15,
    color: THEME_COLOR_2,
    marginBottom: 2,
    marginTop: 2,
  },
  leaveReason: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    marginTop: 2,
  },
  leaveFeedback: {
    fontSize: 14,
    color: '#e67e22',
    marginTop: 2,
  },
  leaveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveModalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  leaveModalContentSmall: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: 320,
    alignItems: 'center',
  },
  leaveModalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f5f6fa',
  },
  leaveModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  leaveModalFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  leaveModalLabel: {
    fontSize: 15,
    color: '#222',
    minWidth: 70,
    marginRight: 8,
  },
  leaveModalInput: {
    flex: 1,
    minHeight: 40,
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#222',
    marginRight: 8,
  },
  leaveModalCheckbox: {
    marginHorizontal: 8,
  },
  leaveModalSendBtn: {
    backgroundColor: THEME_COLOR,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  leaveModalSendBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveModalDateCloseBtn: {
    marginTop: 12,
    alignSelf: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f6fa',
  },
  leaveFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: THEME_COLOR,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  leaveFeedBlockModern: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 0,
    marginTop: 10,
    marginBottom: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  leaveSeparatorModern: {
    height: 1,
    backgroundColor: '#e4e6eb',
    marginHorizontal: 0,
    borderRadius: 1,
    marginVertical: 4,
  },
  leaveDateModern: {
    fontSize: 14,
    color: '#b0b3b8',
    marginBottom: 2,
  },
  leaveTypeModern: {
    fontSize: 15,
    color: THEME_COLOR_2,
    marginBottom: 2,
    marginTop: 2,
    fontWeight: 'bold',
  },
  leaveReasonModern: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    marginTop: 2,
  },
  leaveStatusModern: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  leaveFeedbackModern: {
    fontSize: 14,
    color: '#e67e22',
    marginTop: 2,
  },
  leaveModalOverlayModern: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveModalContentModern: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    alignItems: 'stretch',
  },
  leaveModalContentSmallModern: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: 320,
    alignItems: 'center',
  },
  leaveModalCloseBtnModern: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f5f6fa',
  },
  leaveModalTitleModern: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  leaveInputModern: {
    minHeight: 44,
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputErrorModern: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  leaveCheckboxRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  leaveCheckboxBtnModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  leaveCheckboxBtnActiveModern: {
    backgroundColor: '#eafaf1',
    borderColor: THEME_COLOR_2,
    borderWidth: 1.2,
  },
  leaveCheckboxLabelModern: {
    fontSize: 15,
    color: '#222',
    marginLeft: 8,
  },
  leavePostBtnModern: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    backgroundColor: THEME_COLOR,
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  leaveFabModern: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: THEME_COLOR,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  menuBtnFlat: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  menuOverlayModern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
    zIndex: 100,
  },
  menuMenuModern: {
    position: 'absolute',
    top: 36,
    right: 16,
    backgroundColor: '#23272f',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 101,
  },
  menuItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: 140,
  },
  menuTextModern: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 10,
  },
  // Employee Card Styles
  employeeCardContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  employeeCardGradient: {
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
  },
  employeeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyNameText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.2,
  },
  profileBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
  },
  employeeCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  employeeCardDetails: {
    flex: 1,
  },
  employeeCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  employeeCardPosition: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 3,
  },
  employeeContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeCardEmail: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginLeft: 4,
    flex: 1,
  },
  employeeCardIdSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 50,
  },
  employeeIdLabelText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 1,
  },
  employeeCardIdText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default Leave;
