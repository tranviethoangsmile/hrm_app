/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef} from 'react';
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
  Animated,
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
  DELETE
} from '../utils/constans';
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import CheckBox from '@react-native-community/checkbox';
import OptimizedLoader from '../components/OptimizedLoader';
import {SwipeListView} from 'react-native-swipe-list-view';
import ModalMessage from '../components/ModalMessage';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../hooks/useTheme';

const Leave = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const {colors, isDarkMode} = useTheme();
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
  const [selectedReasonType, setSelectedReasonType] = useState(null);
  const [customReason, setCustomReason] = useState('');
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
  const [reasonDropdownOpen, setReasonDropdownOpen] = useState(false);
  
  // Animation values for modal
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Reason types for dropdown
  const reasonTypes = [
    { label: t('leave_reason_personal', 'Có việc riêng'), value: 'personal' },
    { label: t('leave_reason_sick', 'Ốm'), value: 'sick' },
    { label: t('leave_reason_regulation', 'Nghỉ theo quy định'), value: 'regulation' },
    { label: t('leave_reason_other', 'Khác'), value: 'other' },
  ];

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
    const finalReason = selectedReasonType === 'other' ? customReason : reason;
    
    
    if (!finalReason.trim()) {
      setErrorReason(true);
      hasError = true;
      // Show specific error message for custom reason
      if (selectedReasonType === 'other') {
        setModalMessage({
          visible: true,
          type: 'error',
          message: t('leave_reason_enter_custom_required', 'Vui lòng nhập lý do cụ thể'),
        });
        return;
      }
    } else {
      setErrorReason(false);
    }
    if (!dayOff) {
      setErrorDayOff(true);
      hasError = true;
    } else {
      setErrorDayOff(false);
    }
    if (!leaderValue) {
      setModalMessage({
        visible: true,
        type: 'error',
        message: t('select_leader_required', 'Vui lòng chọn người duyệt'),
      });
      return;
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
        reason: finalReason,
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

  // Reset animation values when modal closes
  useEffect(() => {
    if (!modal) {
      modalScale.setValue(0);
      modalOpacity.setValue(0);
    }
  }, [modal, modalScale, modalOpacity]);
  const handleSelectLeader = value => {
    setLeaderValue(value);
    setValue(value); // Also update the dropdown value
  };

  const handleLeaderDropdownToggle = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      setReasonDropdownOpen(false); // Close reason dropdown when opening leader dropdown
    }
  };

  const handleReasonTypeSelect = (reasonType) => {
    if (reasonType) {
      setSelectedReasonType(reasonType);
      if (reasonType === 'other') {
        setReason('');
        setCustomReason('');
      } else {
        // Set predefined reason based on type
        const reasonText = getReasonText(reasonType);
        setReason(reasonText);
        setCustomReason('');
      }
      // Close dropdown immediately after selection
      setReasonDropdownOpen(false);
    }
  };

  const handleReasonDropdownToggle = (isOpen) => {
    setReasonDropdownOpen(isOpen);
    if (isOpen) {
      setOpen(false); // Close leader dropdown when opening reason dropdown
    }
  };

  const getReasonText = (reasonType) => {
    switch (reasonType) {
      case 'personal':
        return t('leave_reason_personal', 'Có việc riêng');
      case 'sick':
        return t('leave_reason_sick', 'Ốm');
      case 'regulation':
        return t('leave_reason_regulation', 'Nghỉ theo quy định');
      default:
        return '';
    }
  };
  const showHandleButtonModal = () => {
    setEditLeave(null);
    setReason('');
    setSelectedReasonType(null);
    setCustomReason('');
    setDayOff(moment().add(1, 'day').toDate());
    setIs_paid(true);
    setIs_half(false);
    setLeaderValue('');
    setOpen(false); // Close leader dropdown
    setReasonDropdownOpen(false); // Close reason dropdown
    setModal(true);
    // Animate modal in
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    // Close all dropdowns
    setReasonDropdownOpen(false);
    setOpen(false);
    
    // Animate modal out
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModal(false);
    });
  };

  const openEditModal = item => {
    setEditLeave(item);
    setReason(item.reason || '');
    setSelectedReasonType(null);
    setCustomReason('');
    setDayOff(moment(item.date_leave).toDate());
    setIs_paid(item.is_paid);
    setIs_half(item.is_half);
    setLeaderValue(item.leader_id || '');
    setOpen(false); // Close leader dropdown
    setReasonDropdownOpen(false); // Close reason dropdown
    setModal(true);
    // Animate modal in
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const handleDeleteLeaveRequest = async id => {
    setOpenMenuId(null);
    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${DELETE}`, {
        id: id,
        user_id: authData?.data?.data?.id,
      });
       if (response?.data?.success) {
         setModalMessage({
           visible: true,
           type: 'success',
           message: t('delete_success', 'Đã xóa đơn nghỉ thành công'),
         });
         // Refresh the list to reflect changes
         onRefresh();
       } else {
         setModalMessage({
           visible: true,
           type: 'error',
           message: t('delete_failed', 'Xóa đơn nghỉ thất bại'),
         });
       }
    } catch (error) {
      setModalMessage({
        visible: true,
        type: 'error',
        message: t('delete_failed', 'Xóa đơn nghỉ thất bại'),
      });
    } finally {
      setIsLoading(false);
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

  const TabButton = ({title, isActive, onPress, count, colors}) => (
    <TouchableOpacity
      style={[
        styles.tabButton, 
        {backgroundColor: isActive ? colors.primary : colors.background},
        isActive && styles.activeTabButton
      ]}
      onPress={onPress}>
      <Text
        style={[
          styles.tabButtonText, 
          {color: isActive ? '#fff' : colors.textSecondary},
          isActive && styles.activeTabButtonText
        ]}>
        {title}
      </Text>
      <View style={[
        styles.tabBadge, 
        {backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colors.surface},
        isActive && styles.activeTabBadge
      ]}>
        <Text
          style={[
            styles.tabBadgeText, 
            {color: isActive ? '#fff' : colors.textSecondary},
            isActive && styles.activeTabBadgeText
          ]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLeaveCard = ({item, colors}) => {
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
      <View style={[
        styles.leaveCard, 
        {
          backgroundColor: item.is_paid 
            ? (isDarkMode ? '#1a3d1a' : '#f8fff8')  // Dark/light green background for paid
            : (isDarkMode ? '#3d2a1a' : '#fff8f0'), // Dark/light orange background for unpaid
          borderLeftWidth: 4,
          borderLeftColor: item.is_paid 
            ? '#27ae60'  // Green border for paid
            : '#e67e22'  // Orange border for unpaid
        }
      ]}>
        <View style={styles.leaveCardHeader}>
          <View style={styles.leaveCardDateContainer}>
            <Icon name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.leaveCardDate, {color: colors.textSecondary}]}>
              {moment(item.date_leave).format('DD/MM/YYYY')}
            </Text>
          </View>
          {activeTab === 0 && (
            <TouchableOpacity
              style={[styles.menuBtnModern, {backgroundColor: colors.background}]}
              onPress={() => setOpenMenuId(item.id)}>
              <Icon name="ellipsis-h" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.leaveCardContent}>
          <View style={[styles.leaveTypeContainer, {backgroundColor: colors.background}]}>
            <Icon
              name={item.is_paid ? 'money' : 'clock-o'}
              size={14}
              color={item.is_paid ? '#27ae60' : '#e67e22'}
            />
            <Text style={[
              styles.leaveTypeText, 
              {color: item.is_paid ? '#27ae60' : '#e67e22'}
            ]}>
              {item.is_paid ? t('paid') : t('unpaid')}
            </Text>
          </View>

          {item.reason && (
            <View style={[styles.leaveReasonContainer, {backgroundColor: colors.background}]}>
              <Icon name="file-text-o" size={14} color={colors.textSecondary} />
              <Text style={[styles.leaveReasonText, {color: colors.text}]}>{item.reason}</Text>
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
            <View style={[styles.feedbackContainer, {backgroundColor: colors.background}]}>
              <Icon name="comment-o" size={14} color={colors.textSecondary} />
              <Text style={[styles.feedbackText, {color: colors.text}]}>{item.feedback}</Text>
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
            <View style={[styles.menuModern, {backgroundColor: colors.surface}]}>
              <TouchableOpacity
                style={[styles.menuItemModern, {opacity: 0.5}]}
                disabled={true}
                onPress={() => {
                  setOpenMenuId(null);
                  // openEditModal(item); // Disabled - API not ready
                }}>
                <Icon name="edit" size={16} color={colors.textSecondary} />
                <Text style={[styles.menuTextModern, {color: colors.textSecondary}]}>{t('edit')}</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, {backgroundColor: colors.border}]} />
              {activeTab === 0 && (
                <>
                  <TouchableOpacity
                    style={[styles.menuItemModern]}
                    onPress={() => {
                      setOpenMenuId(null);
                      handleDeleteLeaveRequest(item.id);
                    }}>
                    <Icon name="trash" size={16} color="#e74c3c" />
                    <Text style={[styles.menuTextModern, {color: '#e74c3c'}]}>
                      {t('delete')}
                    </Text>
                  </TouchableOpacity>
                  <View style={[styles.menuDivider, {backgroundColor: colors.border}]} />
                </>
              )}
              <View style={[styles.menuItemModern, {opacity: 0.7, paddingVertical: 8}]}>
                <Icon name="info-circle" size={14} color={colors.textSecondary} />
                <Text style={[styles.menuTextModern, {color: colors.textSecondary, fontSize: 12}]}>
                  {t('feature_coming_soon', 'Tính năng đang phát triển')}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header
        title={t('leave.title', 'Đơn nghỉ phép')}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        keyboardVerticalOffset={100}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <OptimizedLoader visible={isLoading} />
        {err ? <Text style={[styles.errorText, {color: colors.error}]}>{err}</Text> : null}

        <View style={[styles.tabContainer, {backgroundColor: colors.surface}]}>
          <TabButton
            title={t('pending')}
            isActive={activeTab === 0}
            onPress={() => setActiveTab(0)}
            count={getPendingCount()}
            colors={colors}
          />
          <TabButton
            title={t('approved')}
            isActive={activeTab === 1}
            onPress={() => setActiveTab(1)}
            count={getApprovedCount()}
            colors={colors}
          />
          <TabButton
            title={t('rejected')}
            isActive={activeTab === 2}
            onPress={() => setActiveTab(2)}
            count={getRejectedCount()}
            colors={colors}
          />
        </View>

        <FlatList
          data={filterLeavesByStatus()}
          keyExtractor={item => item.id?.toString()}
          renderItem={({item}) => renderLeaveCard({item, colors})}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary, colors.primary2]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="calendar-o" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                  {t('no_leaves', 'Chưa có đơn nghỉ nào')}
                </Text>
              </View>
            )
          }
        />

        <TouchableOpacity
          style={[styles.fabButton, {backgroundColor: colors.primary}]}
          onPress={showHandleButtonModal}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>

        <Modal visible={modal} transparent animationType="none">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <Animated.View style={[
                styles.leaveModalOverlayModern, 
                {backgroundColor: 'rgba(0,0,0,0.5)', opacity: modalOpacity}
              ]}>
                <TouchableWithoutFeedback onPress={hideModal}>
                  <View style={styles.modalBackdrop} />
                </TouchableWithoutFeedback>
                <Animated.View style={[
                  styles.leaveModalContentModern, 
                  {backgroundColor: colors.surface},
                  {transform: [{scale: modalScale}]}
                ]}>
                  <TouchableOpacity
                    style={[styles.leaveModalCloseBtnModern, {backgroundColor: colors.background}]}
                    onPress={hideModal}>
                    <Icon name="close" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={[styles.leaveModalTitleModern, {color: colors.text}]}>
                    {editLeave ? t('edit_leave') : t('request_leave')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.leaveInputModern,
                      {backgroundColor: colors.background, borderColor: colors.border},
                      errorDayOff && styles.inputErrorModern,
                    ]}
                    onPress={() => setIsSelectToModal(true)}>
                    <Icon
                      name="calendar"
                      size={18}
                      color={colors.primary}
                      style={{marginRight: 8}}
                    />
                    <Text style={{color: dayOff ? colors.text : colors.textSecondary}}>
                      {moment(dayOff).format('YYYY-MM-DD')}
                    </Text>
                  </TouchableOpacity>
                  <Modal
                    visible={isSelectToModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsSelectToModal(false)}>
                    <View style={[styles.leaveModalOverlayModern, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
                      <TouchableWithoutFeedback onPress={() => setIsSelectToModal(false)}>
                        <View style={styles.modalBackdrop} />
                      </TouchableWithoutFeedback>
                      <View style={[styles.leaveModalContentSmallModern, {backgroundColor: colors.surface}]}>
                        <DatePicker
                          date={dayOff}
                          mode="date"
                          onDateChange={handleSelectToDate}
                          textColor={colors.text}
                          dayTextColor={colors.text}
                          monthTextColor={colors.text}
                          yearTextColor={colors.text}
                        />
                        <TouchableOpacity
                          style={styles.leaveModalDateCloseBtnModern}
                          onPress={() => setIsSelectToModal(false)}>
                          <Text
                            style={{color: colors.primary, fontWeight: 'bold'}}>
                            {t('close')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                  {/* Reason Type Dropdown */}
                  <Text style={[styles.inputLabel, {color: colors.text}]}>
                    {t('leave_reason_type', 'Loại lý do')}
                  </Text>
                  <View style={styles.dropdownWrapper}>
                    <TouchableOpacity
                      style={[styles.leaveInputModern, {backgroundColor: colors.background, borderColor: colors.border}]}
                      onPress={() => {
                        setReasonDropdownOpen(!reasonDropdownOpen);
                        if (!reasonDropdownOpen) {
                          setOpen(false);
                        }
                      }}
                      activeOpacity={0.7}>
                      <Text style={[styles.dropdownText, {color: selectedReasonType ? colors.text : colors.textSecondary}]}>
                        {selectedReasonType ? reasonTypes.find(item => item.value === selectedReasonType)?.label : t('leave_reason_select_type', 'Chọn loại lý do')}
                      </Text>
                      <Icon 
                        name={reasonDropdownOpen ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {reasonDropdownOpen && (
                      <>
                        <TouchableWithoutFeedback onPress={() => setReasonDropdownOpen(false)}>
                          <View style={styles.dropdownOverlay} />
                        </TouchableWithoutFeedback>
                        <View style={[styles.dropdownContainer, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                          {reasonTypes.map((item, index) => (
                            <TouchableOpacity
                              key={item.value}
                              style={[
                                styles.dropdownItem,
                                {backgroundColor: colors.surface},
                                selectedReasonType === item.value && {backgroundColor: colors.primary + '20'}
                              ]}
                              onPress={() => {
                                handleReasonTypeSelect(item.value);
                              }}>
                              <Text style={[
                                styles.dropdownItemText,
                                {color: colors.text},
                                selectedReasonType === item.value && {color: colors.primary, fontWeight: '600'}
                              ]}>
                                {item.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}
                  </View>

                  {/* Custom Reason Input - Only show when "Other" is selected */}
                  {selectedReasonType === 'other' && (
                    <>
                      <Text style={[styles.inputLabel, {color: colors.text}]}>
                        {t('leave_reason_custom', 'Lý do cụ thể')}
                      </Text>
                      <TextInput
                        style={[
                          styles.leaveInputModern,
                          {backgroundColor: colors.background, borderColor: colors.border, color: colors.text},
                          errorReason && styles.inputErrorModern,
                        ]}
                        placeholder={t('leave_reason_enter_custom', 'Nhập lý do cụ thể')}
                        placeholderTextColor={colors.textSecondary}
                        value={customReason}
                        onChangeText={text => {
                          setCustomReason(text);
                          if (errorReason && text.trim()) setErrorReason(false);
                        }}
                        multiline
                        maxLength={300}
                      />
                    </>
                  )}
                  <View style={styles.leaveCheckboxRowModern}>
                    <TouchableOpacity
                      style={[
                        styles.leaveCheckboxBtnModern,
                        {backgroundColor: colors.background},
                        is_paid && styles.leaveCheckboxBtnActiveModern,
                        is_paid && {backgroundColor: colors.primary + '20', borderColor: colors.primary},
                      ]}
                      onPress={() => setIs_paid(!is_paid)}>
                      <Icon
                        name={is_paid ? 'check-square' : 'square-o'}
                        size={18}
                        color={is_paid ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[styles.leaveCheckboxLabelModern, {color: colors.text}]}>
                        {t('paid')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.leaveCheckboxBtnModern,
                        {backgroundColor: colors.background},
                        is_half && styles.leaveCheckboxBtnActiveModern,
                        is_half && {backgroundColor: colors.primary + '20', borderColor: colors.primary},
                      ]}
                      onPress={() => setIs_half(!is_half)}>
                      <Icon
                        name={is_half ? 'check-square' : 'square-o'}
                        size={18}
                        color={is_half ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[styles.leaveCheckboxLabelModern, {color: colors.text}]}>
                        {t('half.d')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DropDownPicker
                    open={open}
                    value={value}
                    setValue={val => setValue(val)}
                    setOpen={handleLeaderDropdownToggle}
                    items={leaderList}
                    maxHeight={300}
                    autoScroll
                    onChangeValue={item => handleSelectLeader(item)}
                    placeholder={t('selectName')}
                    placeholderStyle={{color: colors.textSecondary}}
                    zIndex={4000}
                    zIndexInverse={3000}
                    dropDownContainerStyle={{backgroundColor: colors.surface}}
                    style={[styles.leaveInputModern, {backgroundColor: colors.background, borderColor: colors.border}]}
                    textStyle={{color: colors.text}}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                  />
                  <View style={styles.submitButtonContainer}>
                    <TouchableOpacity
                      style={[styles.submitButtonModern, {backgroundColor: colors.primary}]}
                      onPress={handleRequestDayOffPaid}
                      disabled={isLoading}>
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.submitButtonTextModern}>
                          {editLeave ? t('update') : t('submit')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </Animated.View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTabButton: {
    // Dynamic styling handled in component
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeTabButtonText: {
    // Dynamic styling handled in component
  },
  tabBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBadge: {
    // Dynamic styling handled in component
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  activeTabBadgeText: {
    // Dynamic styling handled in component
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 8,
  },
  leaveCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveCardDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveCardDate: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  menuBtnModern: {
    padding: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveCardContent: {
    gap: 16,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  leaveTypeText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  leaveReasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  leaveReasonText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  leaveStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leaveStatusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  menuOverlayModern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
  },
  menuModern: {
    position: 'absolute',
    top: 56,
    right: 20,
    borderRadius: 16,
    paddingVertical: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  menuItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  menuTextModern: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  loader: {
    marginTop: 40,
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  leaveModalOverlayModern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  leaveModalContentModern: {
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    alignItems: 'stretch',
    transform: [{scale: 1}],
  },
  leaveModalContentSmallModern: {
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  leaveModalCloseBtnModern: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveModalTitleModern: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  leaveInputModern: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 9999,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: 1000,
    bottom: -1000,
    zIndex: 99998,
    backgroundColor: 'transparent',
  },
  dropdownText: {
    fontSize: 15,
    flex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 99999,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 9999,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dropdownItemText: {
    fontSize: 15,
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
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  leaveCheckboxBtnActiveModern: {
    borderWidth: 1.2,
  },
  leaveCheckboxLabelModern: {
    fontSize: 15,
    marginLeft: 8,
  },
  submitButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonModern: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonTextModern: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Leave;
