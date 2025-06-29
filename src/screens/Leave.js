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
  const [activeTab, setActiveTab] = useState(0);

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
        message: t('fill_required'),
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
          message: t('send_request_success'),
        });
      } else {
        setIsLoading(false);
        setModal(false);
        setModalMessage({
          visible: true,
          type: 'error',
          message: t('send_request_failed'),
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
        {item.is_paid ? t('paid') : t('unpaid')}
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

  const filterLeavesByStatus = () => {
    switch (activeTab) {
      case 0: // Pending
        return leaveRequested.filter(
          item => !item.is_approve && !item.feedback,
        );
      case 1: // Approved
        return leaveRequested.filter(item => item.is_approve);
      case 2: // Rejected
        return leaveRequested.filter(item => !item.is_approve && item.feedback);
      default:
        return leaveRequested;
    }
  };

  const getPendingCount = () => {
    return leaveRequested.filter(item => !item.is_approve && !item.feedback)
      .length;
  };

  const getApprovedCount = () => {
    return leaveRequested.filter(item => item.is_approve).length;
  };

  const getRejectedCount = () => {
    return leaveRequested.filter(item => !item.is_approve && item.feedback)
      .length;
  };

  const TabButton = ({title, isActive, onPress, count}) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}>
      <Text
        style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
      <View style={[styles.tabBadge, isActive && styles.activeTabBadge]}>
        <Text
          style={[styles.tabBadgeText, isActive && styles.activeTabBadgeText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLeaveCard = ({item}) => {
    const statusColor = item.is_approve
      ? '#2ecc71'
      : item.feedback
      ? '#e74c3c'
      : '#f39c12';
    const statusText = item.is_approve
      ? t('approved')
      : item.feedback
      ? t('rejected')
      : t('awaiting');

    return (
      <View style={styles.leaveCard}>
        <View style={styles.leaveCardHeader}>
          <View style={styles.leaveCardDateContainer}>
            <Icon name="calendar" size={16} color={THEME_COLOR_2} />
            <Text style={styles.leaveCardDate}>
              {moment(item.date_leave).format('DD/MM/YYYY')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.menuBtnModern}
            onPress={() => setOpenMenuId(item.id)}>
            <Icon name="ellipsis-h" size={18} color="#b0b3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.leaveCardContent}>
          <View style={styles.leaveTypeContainer}>
            <Icon
              name={item.is_paid ? 'money' : 'clock-o'}
              size={14}
              color={THEME_COLOR_2}
            />
            <Text style={styles.leaveTypeText}>
              {item.is_paid ? t('paid') : t('unpaid')}
            </Text>
          </View>

          {item.reason && (
            <View style={styles.leaveReasonContainer}>
              <Icon name="file-text-o" size={14} color="#666" />
              <Text style={styles.leaveReasonText}>{item.reason}</Text>
            </View>
          )}

          <View
            style={[
              styles.leaveStatusContainer,
              {backgroundColor: `${statusColor}15`},
            ]}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <Text style={[styles.leaveStatusText, {color: statusColor}]}>
              {statusText}
            </Text>
          </View>

          {item.feedback && (
            <View style={styles.feedbackContainer}>
              <Icon name="comment-o" size={14} color="#666" />
              <Text style={styles.feedbackText}>{item.feedback}</Text>
            </View>
          )}
        </View>

        {openMenuId === item.id && (
          <>
            <TouchableOpacity
              style={styles.menuOverlayModern}
              activeOpacity={1}
              onPressOut={() => setOpenMenuId(null)}
            />
            <View style={styles.menuModern}>
              <TouchableOpacity
                style={styles.menuItemModern}
                onPress={() => {
                  setOpenMenuId(null);
                  openEditModal(item);
                }}>
                <Icon name="edit" size={16} color={THEME_COLOR_2} />
                <Text style={styles.menuTextModern}>{t('edit')}</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItemModern}
                onPress={() => {
                  setOpenMenuId(null);
                  handleDeleteLeaveRequest(item.id);
                }}>
                <Icon name="trash" size={16} color="#e74c3c" />
                <Text style={[styles.menuTextModern, {color: '#e74c3c'}]}>
                  {t('delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={100}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />
      <Header
        title={t('leave.title', 'Đơn nghỉ phép')}
        onBack={() => navigation.goBack()}
      />
      <Loader visible={isLoading} />
      {err ? <Text style={styles.errorText}>{err}</Text> : null}

      <View style={styles.tabContainer}>
        <TabButton
          title={t('pending')}
          isActive={activeTab === 0}
          onPress={() => setActiveTab(0)}
          count={getPendingCount()}
        />
        <TabButton
          title={t('approved')}
          isActive={activeTab === 1}
          onPress={() => setActiveTab(1)}
          count={getApprovedCount()}
        />
        <TabButton
          title={t('rejected')}
          isActive={activeTab === 2}
          onPress={() => setActiveTab(2)}
          count={getRejectedCount()}
        />
      </View>

      <FlatList
        data={filterLeavesByStatus()}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderLeaveCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={THEME_COLOR} style={styles.loader} />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-o" size={48} color="#ddd" />
              <Text style={styles.emptyText}>
                {t('no_leaves', 'Chưa có đơn nghỉ nào')}
              </Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => {
          setEditLeave(null);
          setReason('');
          setDayOff(moment().add(1, 'day').toDate());
          setIs_paid(true);
          setIs_half(false);
          setLeaderValue('');
          setModal(true);
        }}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

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
                      {t('paid')}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
  },
  activeTabButton: {
    backgroundColor: THEME_COLOR,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  activeTabBadgeText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: 8,
  },
  leaveCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveCardDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveCardDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  menuBtnModern: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f6fa',
  },
  leaveCardContent: {
    gap: 12,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaveTypeText: {
    fontSize: 15,
    color: THEME_COLOR_2,
    fontWeight: '600',
  },
  leaveReasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 4,
  },
  leaveReasonText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  leaveStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  leaveStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff9ec',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  menuOverlayModern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
  },
  menuModern: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    width: 140,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  menuItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f5f6fa',
    marginVertical: 4,
  },
  menuTextModern: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
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
});

export default Leave;
