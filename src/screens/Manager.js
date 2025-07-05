import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import {useSelector} from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  PAID_LEAVE,
  SEARCH,
  UPDATE,
  OVERTIME_REQUEST,
  CREATE,
  USER_URL,
  GET_ALL,
} from '../utils/constans';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TABS = [
  {
    id: 'leave',
    title: 'Leave',
    icon: 'calendar-remove',
    titleKey: 'manager.tabs.leave',
  },
  {
    id: 'overtime',
    title: 'Overtime',
    icon: 'clock-plus',
    titleKey: 'manager.tabs.overtime',
  },
  {
    id: 'employees',
    title: 'Employees',
    icon: 'account-group',
    titleKey: 'manager.tabs.employees',
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'chart-line',
    titleKey: 'manager.tabs.reports',
  },
];

function Manager() {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('leave');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setError] = useState('');

  // Leave Management State
  const [leaveRequested, setLeaveRequested] = useState([]);
  const [showModalFeedback, setShowModalFeedback] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [leaveId, setLeaveId] = useState('');
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);

  // Overtime Management State
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [overtimeFormData, setOvertimeFormData] = useState({
    user_id: '',
    date: '',
    position: '',
    overtime_hours: '',
    description: '',
    leader_id: '',
  });

  useEffect(() => {
    const role = authData?.data?.data.role;
    if (role === 'STAFF') {
      showAlert(t('auth'));
      navigation.navigate('Main');
      return;
    }
    if (activeTab === 'leave') {
      getValueRequestLeave();
    }
  }, [
    activeTab,
    authData?.data?.data.role,
    getValueRequestLeave,
    navigation,
    t,
  ]);

  const showAlert = message => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getValueRequestLeave();
    setRefreshing(false);
  };

  const getValueRequestLeave = useCallback(async () => {
    try {
      const field = {
        leader_id: authData?.data?.data?.id,
      };
      const leaves = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${SEARCH}`,
        field,
      );

      if (leaves?.data.success) {
        setError('');
        setLeaveRequested(leaves.data.data);
      } else {
        setError(t('error'));
      }
    } catch (error) {
      setError(t('error'));
    }
  }, [authData?.data?.data?.id, t]);

  const handleUnApproveLeaveRequest = async () => {
    try {
      setIsLoading(true);
      const field = {
        id: leaveId,
        feedback: feedback,
      };
      const update = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${UPDATE}`,
        field,
      );
      if (update?.data.success) {
        setIsLoading(false);
        setShowModalFeedback(false);
        onRefresh();
        showAlert('success');
      } else {
        setShowModalFeedback(false);
        setIsLoading(false);
        onRefresh();
        showAlert('unSuccess');
      }
    } catch (error) {
      showAlert('contactAdmin');
    }
  };

  const showModalFeedbackUnApprove = () => {
    try {
      setShowModalFeedback(true);
    } catch (error) {
      showAlert('contactAdmin');
    }
  };

  const handleConfirmApprove = () => {
    if (selectedLeaveId) {
      handleApproveLeaveRequest(selectedLeaveId);
      setShowConfirmModal(false);
      setSelectedLeaveId(null);
    }
  };

  const handleApproveLeaveRequest = async id => {
    try {
      const field = {id};
      const update = await axios.put(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}`,
        field,
      );
      if (update?.data?.success) {
        showAlert('success');
        onRefresh();
      } else {
        showAlert('unSuccess');
        onRefresh();
      }
    } catch (error) {
      showAlert('contactAdmin');
    }
  };

  const onClose = () => {
    setShowModalFeedback(false);
  };

  const handleCancelFeedback = () => {
    setFeedback('');
    setShowModalFeedback(false);
  };

  // Overtime Management Functions
  const handleOvertimeFormChange = (field, value) => {
    setOvertimeFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateOvertimeForm = () => {
    const {user_id, date, position, overtime_hours, description} =
      overtimeFormData;

    if (!user_id) {
      showAlert(t('overtime.validation.user'));
      return false;
    }
    if (!date) {
      showAlert(t('overtime.validation.date'));
      return false;
    }
    if (!position.trim()) {
      showAlert(t('overtime.validation.position'));
      return false;
    }
    if (
      !overtime_hours ||
      isNaN(overtime_hours) ||
      parseFloat(overtime_hours) <= 0
    ) {
      showAlert(t('overtime.validation.hours'));
      return false;
    }
    if (!description.trim()) {
      showAlert(t('overtime.validation.description'));
      return false;
    }
    return true;
  };

  const handleCreateOvertimeRequest = async () => {
    if (!validateOvertimeForm()) return;

    try {
      setIsLoading(true);
      const userData = authData?.data?.data;

      const field = {
        user_id: overtimeFormData.user_id,
        date: overtimeFormData.date,
        position: overtimeFormData.position,
        department_id: userData?.department_id,
        overtime_hours: parseFloat(overtimeFormData.overtime_hours),
        description: overtimeFormData.description,
        leader_id: overtimeFormData.leader_id,
      };

      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${OVERTIME_REQUEST}${CREATE}`,
        field,
      );

      if (response?.data?.success) {
        setIsLoading(false);
        setShowOvertimeModal(false);
        setOvertimeFormData({
          user_id: '',
          date: '',
          position: '',
          overtime_hours: '',
          description: '',
          leader_id: '',
        });
        setSelectedUser(null);
        showAlert(t('overtime.success'));
      } else {
        setIsLoading(false);
        showAlert(t('overtime.error'));
      }
    } catch (error) {
      setIsLoading(false);
      showAlert(t('contactAdmin'));
    }
  };

  const handleCancelOvertimeModal = () => {
    setShowOvertimeModal(false);
    setShowDatePicker(false);
    setShowUserSelection(false);
    setSelectedUser(null);
    setOvertimeFormData({
      user_id: '',
      date: '',
      position: '',
      overtime_hours: '',
      description: '',
      leader_id: '',
    });
  };

  const getAllUsers = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${GET_ALL}`,
      );
      if (response?.data?.success) {
        setUserList(response.data.data);
      } else {
        showAlert(t('contactAdmin'));
      }
    } catch (error) {
      showAlert(t('contactAdmin'));
    }
  };

  const handleDateConfirm = date => {
    setSelectedDate(date);
    const formattedDate = moment(date).format('YYYY-MM-DD');
    handleOvertimeFormChange('date', formattedDate);
    setShowDatePicker(false);
  };

  const handleUserSelect = user => {
    setSelectedUser(user);
    handleOvertimeFormChange('user_id', user.id);
    setShowUserSelection(false);
  };

  const initializeOvertimeForm = () => {
    const userData = authData?.data?.data;
    setOvertimeFormData(prev => ({
      ...prev,
      position: userData?.position || '',
      leader_id: userData?.id || '',
    }));
  };

  const openOvertimeModal = () => {
    initializeOvertimeForm();
    getAllUsers();
    setShowOvertimeModal(true);
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}>
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}>
              {t(tab.titleKey, tab.title)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({item}) => {
    let statusText = '';
    let statusColor = '';
    let statusIcon = '';
    let statusGradient = [];

    if (item.is_approve && !item.feedback) {
      statusText = t('approved');
      statusColor = '#2ecc71';
      statusIcon = 'check-circle';
      statusGradient = ['#2ecc71', '#27ae60'];
    } else if (!item.is_approve && item.feedback) {
      statusText = t('rejected');
      statusColor = '#e74c3c';
      statusIcon = 'close-circle';
      statusGradient = ['#e74c3c', '#c0392b'];
    } else {
      statusText = t('awaiting');
      statusColor = '#f39c12';
      statusIcon = 'clock-outline';
      statusGradient = ['#f39c12', '#e67e22'];
    }

    return (
      <View style={styles.modernLeaveCard}>
        {/* Card Header */}
        <View style={styles.modernCardHeader}>
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              {item.staff.avatar ? (
                <Image
                  source={{uri: item.staff.avatar}}
                  style={styles.userAvatar}
                  defaultSource={require('../assets/images/avatar.jpg')}
                  onError={() => {
                    // If avatar fails to load, will show default image
                  }}
                />
              ) : (
                <LinearGradient
                  colors={[THEME_COLOR, THEME_COLOR_2]}
                  style={styles.avatarGradient}>
                  <Icon name="account" size={20} color="#fff" />
                </LinearGradient>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.modernUserName}>{item.staff.name}</Text>
              <Text style={styles.modernUserPosition}>
                {item.staff.position || 'Nhân viên'}
              </Text>
            </View>
          </View>

          <LinearGradient
            colors={statusGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.modernStatusBadge}>
            <Icon name={statusIcon} size={14} color="#fff" />
            <Text style={styles.modernStatusText}>{statusText}</Text>
          </LinearGradient>
        </View>

        {/* Card Content */}
        <View style={styles.modernCardContent}>
          {/* Date and Type Row */}
          <View style={styles.infoRowModern}>
            <View style={styles.infoItemModern}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar-today" size={16} color={THEME_COLOR} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Ngày nghỉ</Text>
                <Text style={styles.infoValue}>
                  {moment(item.date_leave).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>

            <View style={styles.infoItemModern}>
              <View style={styles.infoIconContainer}>
                <Icon
                  name={item.is_paid ? 'wallet' : 'wallet-outline'}
                  size={16}
                  color={item.is_paid ? '#2ecc71' : '#95a5a6'}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Loại nghỉ</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {color: item.is_paid ? '#2ecc71' : '#95a5a6'},
                  ]}>
                  {item.is_paid ? 'Có lương' : 'Không lương'}
                </Text>
              </View>
            </View>
          </View>

          {/* Reason Section */}
          <View style={styles.reasonSection}>
            <View style={styles.reasonHeader}>
              <Icon name="text-box-outline" size={16} color="#7f8c8d" />
              <Text style={styles.reasonLabel}>Lý do nghỉ</Text>
            </View>
            <Text style={styles.modernReasonText}>{item.reason}</Text>
          </View>

          {/* Feedback Section */}
          {item.feedback && (
            <View style={styles.feedbackSection}>
              <View style={styles.feedbackHeader}>
                <Icon name="message-text-outline" size={16} color="#e67e22" />
                <Text style={styles.feedbackLabel}>Phản hồi</Text>
              </View>
              <View style={styles.feedbackBubble}>
                <Text style={styles.modernFeedbackText}>{item.feedback}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!item.is_approve && !item.feedback && (
          <View style={styles.modernActionButtons}>
            <TouchableOpacity
              style={styles.modernRejectButton}
              onPress={() => {
                setLeaveId(item.id);
                showModalFeedbackUnApprove();
              }}>
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.actionButtonGradient}>
                <Icon name="close" size={16} color="#fff" />
                <Text style={styles.modernButtonText}>{t('un_approve')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernApproveButton}
              onPress={() => {
                setSelectedLeaveId(item.id);
                setShowConfirmModal(true);
              }}>
              <LinearGradient
                colors={['#2ecc71', '#27ae60']}
                style={styles.actionButtonGradient}>
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.modernButtonText}>{t('is_approve')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderLeaveManagement = () => (
    <View style={styles.leaveManagementContainer}>
      <FlatList
        data={leaveRequested}
        renderItem={renderItem}
        keyExtractor={item => item?.id?.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME_COLOR]}
            tintColor={THEME_COLOR}
          />
        }
        contentContainerStyle={[
          styles.modernListContainer,
          leaveRequested.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.modernLoadingContainer}>
              <ActivityIndicator size="large" color={THEME_COLOR} />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <View style={styles.modernEmptyContainer}>
              <LinearGradient
                colors={[THEME_COLOR + '20', THEME_COLOR + '10']}
                style={styles.emptyIconContainer}>
                <Icon name="calendar-check" size={64} color={THEME_COLOR} />
              </LinearGradient>
              <Text style={styles.modernEmptyTitle}>Không có đơn nghỉ nào</Text>
              <Text style={styles.modernEmptySubtitle}>
                Hiện tại chưa có đơn xin nghỉ phép nào cần được duyệt
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}>
                <LinearGradient
                  colors={[THEME_COLOR, THEME_COLOR_2]}
                  style={styles.refreshButtonGradient}>
                  <Icon name="refresh" size={16} color="#fff" />
                  <Text style={styles.refreshButtonText}>Làm mới</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );

  const renderOvertimeManagement = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyStateContainer}>
        <Icon name="clock-plus" size={64} color="#ddd" />
        <Text style={styles.emptyStateTitle}>{t('manager.tabs.overtime')}</Text>
        <Text style={styles.emptyStateText}>
          Create and manage overtime requests
        </Text>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={openOvertimeModal}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderEmployeeManagement = () => (
    <View style={styles.comingSoonContainer}>
      <Icon name="account-group" size={64} color="#ddd" />
      <Text style={styles.comingSoonTitle}>Employee Management</Text>
      <Text style={styles.comingSoonText}>Coming Soon...</Text>
    </View>
  );

  const renderReports = () => (
    <View style={styles.comingSoonContainer}>
      <Icon name="chart-line" size={64} color="#ddd" />
      <Text style={styles.comingSoonTitle}>Reports & Analytics</Text>
      <Text style={styles.comingSoonText}>Coming Soon...</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leave':
        return renderLeaveManagement();
      case 'overtime':
        return renderOvertimeManagement();
      case 'employees':
        return renderEmployeeManagement();
      case 'reports':
        return renderReports();
      default:
        return renderLeaveManagement();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('manager.title', 'Manager')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {err ? <Text style={styles.errorText}>{err}</Text> : null}

      <View style={styles.contentWrapper}>
        {renderTabBar()}
        {renderTabContent()}
      </View>

      {/* Feedback Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModalFeedback}
        onRequestClose={onClose}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('feedback')}</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder={t('enter_feedback')}
              value={feedback}
              onChangeText={setFeedback}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelFeedback}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleUnApproveLeaveRequest}>
                <Text style={styles.submitButtonText}>{t('submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowConfirmModal(false)}>
          <View style={[styles.modalContent, styles.confirmModalContent]}>
            <View style={styles.confirmIconContainer}>
              <Icon name="help-circle" size={50} color={THEME_COLOR} />
            </View>
            <Text style={styles.confirmTitle}>{t('plzcof')}</Text>
            <Text style={styles.confirmMessage}>{t('confirm_approve')}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmApprove}>
                <Icon
                  name="check"
                  size={14}
                  color="#fff"
                  style={{marginRight: 4}}
                />
                <Text style={styles.submitButtonText}>{t('is_approve')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Overtime Request Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showOvertimeModal}
        onRequestClose={handleCancelOvertimeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.modernOvertimeModal]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <LinearGradient
                colors={[THEME_COLOR, '#34495e']}
                style={styles.modalHeaderGradient}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalIconContainer}>
                    <Icon name="clock" size={24} color="#fff" />
                  </View>
                  <Text style={styles.modernModalTitle}>
                    {t('overtime.create_request')}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={handleCancelOvertimeModal}>
                    <Icon name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}>
              {/* User Selection */}
              <View style={styles.modernInputGroup}>
                <Text style={styles.modernInputLabel}>
                  <Icon name="account" size={14} color={THEME_COLOR} />{' '}
                  {t('overtime.select_user')}
                </Text>
                <TouchableOpacity
                  style={[styles.modernTextInput, styles.modernSelectInput]}
                  onPress={() => setShowUserSelection(true)}>
                  <View style={styles.inputIconContainer}>
                    <Icon
                      name="account-outline"
                      size={18}
                      color={THEME_COLOR}
                    />
                  </View>
                  <Text
                    style={
                      selectedUser
                        ? styles.modernSelectedText
                        : styles.modernPlaceholderText
                    }>
                    {selectedUser
                      ? selectedUser.name
                      : t('overtime.select_user')}
                  </Text>
                  <Icon name="chevron-down" size={20} color={THEME_COLOR} />
                </TouchableOpacity>
              </View>

              {/* Date Input */}
              <View style={styles.modernInputGroup}>
                <Text style={styles.modernInputLabel}>
                  <Icon name="calendar" size={14} color={THEME_COLOR} />{' '}
                  {t('overtime.date')}
                </Text>
                <TouchableOpacity
                  style={[styles.modernTextInput, styles.modernSelectInput]}
                  onPress={() => setShowDatePicker(true)}>
                  <View style={styles.inputIconContainer}>
                    <Icon
                      name="calendar-outline"
                      size={18}
                      color={THEME_COLOR}
                    />
                  </View>
                  <Text
                    style={
                      overtimeFormData.date
                        ? styles.modernSelectedText
                        : styles.modernPlaceholderText
                    }>
                    {overtimeFormData.date || t('overtime.select_date')}
                  </Text>
                  <Icon name="chevron-down" size={20} color={THEME_COLOR} />
                </TouchableOpacity>
              </View>

              {/* Position Input (Auto-filled) */}
              <View style={styles.modernInputGroup}>
                <Text style={styles.modernInputLabel}>
                  <Icon name="badge-account" size={14} color={THEME_COLOR} />{' '}
                  {t('overtime.position')}
                </Text>
                <View
                  style={[styles.modernTextInput, styles.modernReadOnlyInput]}>
                  <View style={styles.inputIconContainer}>
                    <Icon
                      name="badge-account-outline"
                      size={18}
                      color="#95a5a6"
                    />
                  </View>
                  <Text style={styles.modernReadOnlyText}>
                    {overtimeFormData.position || t('overtime.position')}
                  </Text>
                  <Icon name="lock" size={16} color="#95a5a6" />
                </View>
              </View>

              {/* Hours Input */}
              <View style={styles.modernInputGroup}>
                <Text style={styles.modernInputLabel}>
                  <Icon name="clock-outline" size={14} color={THEME_COLOR} />{' '}
                  {t('overtime.hours')}
                </Text>
                <View
                  style={[styles.modernTextInput, styles.modernInputWithIcon]}>
                  <View style={styles.inputIconContainer}>
                    <Icon
                      name="clock-time-eight"
                      size={18}
                      color={THEME_COLOR}
                    />
                  </View>
                  <TextInput
                    style={styles.modernTextInputField}
                    placeholder={t('overtime.hours_placeholder')}
                    placeholderTextColor="#bdc3c7"
                    value={overtimeFormData.overtime_hours}
                    onChangeText={value =>
                      handleOvertimeFormChange('overtime_hours', value)
                    }
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputUnit}>giờ</Text>
                </View>
              </View>

              {/* Description Input */}
              <View style={styles.modernInputGroup}>
                <Text style={styles.modernInputLabel}>
                  <Icon name="text" size={14} color={THEME_COLOR} />{' '}
                  {t('overtime.description')}
                </Text>
                <View
                  style={[
                    styles.modernTextInput,
                    styles.modernTextAreaContainer,
                  ]}>
                  <View style={styles.inputIconContainerTop}>
                    <Icon
                      name="text-box-outline"
                      size={18}
                      color={THEME_COLOR}
                    />
                  </View>
                  <TextInput
                    style={[styles.modernTextInputField, styles.modernTextArea]}
                    placeholder={t('overtime.description_placeholder')}
                    placeholderTextColor="#bdc3c7"
                    value={overtimeFormData.description}
                    onChangeText={value =>
                      handleOvertimeFormChange('description', value)
                    }
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modernCancelButton}
                onPress={handleCancelOvertimeModal}>
                <Icon name="close-circle-outline" size={18} color="#e74c3c" />
                <Text style={styles.modernCancelButtonText}>
                  {t('overtime.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modernSubmitButton}
                onPress={handleCreateOvertimeRequest}
                disabled={isLoading}>
                <LinearGradient
                  colors={[THEME_COLOR, '#34495e']}
                  style={styles.submitButtonGradient}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="send" size={18} color="#fff" />
                      <Text style={styles.modernSubmitButtonText}>
                        {t('overtime.submit')}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker}
        date={selectedDate}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />

      {/* User Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUserSelection}
        onRequestClose={() => setShowUserSelection(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.modernUserSelectionModal]}>
            {/* User Selection Header */}
            <View style={styles.modalHeader}>
              <LinearGradient
                colors={[THEME_COLOR, '#34495e']}
                style={styles.modalHeaderGradient}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalIconContainer}>
                    <Icon name="account-group" size={24} color="#fff" />
                  </View>
                  <Text style={styles.modernModalTitle}>
                    {t('overtime.select_user')}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowUserSelection(false)}>
                    <Icon name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* User List */}
            <ScrollView
              style={styles.modernUserList}
              showsVerticalScrollIndicator={false}>
              {userList.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.modernUserItem,
                    selectedUser?.id === user.id && styles.selectedUserItem,
                  ]}
                  onPress={() => handleUserSelect(user)}>
                  <View style={styles.userItemContent}>
                    <View style={styles.userAvatarContainer}>
                      <LinearGradient
                        colors={[THEME_COLOR, '#34495e']}
                        style={styles.userAvatarGradient}>
                        <Text style={styles.userAvatarText}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.modernOvertimeUserInfo}>
                      <Text style={styles.modernOvertimeUserName}>
                        {user.name}
                      </Text>
                      <Text style={styles.modernOvertimeUserPosition}>
                        {user.position}
                      </Text>
                    </View>
                    <View style={styles.selectionIndicator}>
                      {selectedUser?.id === user.id && (
                        <View style={styles.checkIconContainer}>
                          <Icon
                            name="check-circle"
                            size={24}
                            color={THEME_COLOR}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* User Selection Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modernCancelButton}
                onPress={() => setShowUserSelection(false)}>
                <Icon name="close-circle-outline" size={18} color="#e74c3c" />
                <Text style={styles.modernCancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: (StatusBar.currentHeight || 44) + 6,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  backButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 30,
    height: 30,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
    marginTop: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  tabBar: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  activeTabItem: {
    backgroundColor: THEME_COLOR,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingTop: 20,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reportContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 4,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f6fa',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#444',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f6fa',
  },
  submitButton: {
    backgroundColor: THEME_COLOR,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmModalContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  confirmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${THEME_COLOR}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  confirmButton: {
    backgroundColor: THEME_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  // Overtime Management Styles
  tabContent: {
    flex: 1,
    position: 'relative',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  overtimeModalContent: {
    maxHeight: '80%',
  },
  // Modern Overtime Modal Styles
  modernOvertimeModal: {
    maxHeight: '85%',
    maxWidth: '95%',
    width: '95%',
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 400,
  },
  modernInputGroup: {
    marginBottom: 20,
  },
  modernInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernTextInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modernSelectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modernInputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modernTextAreaContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputIconContainerTop: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modernTextInputField: {
    flex: 1,
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  modernTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modernSelectedText: {
    flex: 1,
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '600',
  },
  modernPlaceholderText: {
    flex: 1,
    fontSize: 15,
    color: '#bdc3c7',
    fontWeight: '500',
  },
  modernReadOnlyInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e0e6ed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modernReadOnlyText: {
    flex: 1,
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  inputUnit: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    gap: 12,
  },
  modernCancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e74c3c',
    gap: 8,
  },
  modernCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  modernSubmitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  modernSubmitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Modern User Selection Modal Styles
  modernUserSelectionModal: {
    maxHeight: '75%',
    maxWidth: '95%',
    width: '95%',
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
  },
  modernUserList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 350,
  },
  modernUserItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedUserItem: {
    borderColor: THEME_COLOR,
    backgroundColor: '#f8fafc',
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userAvatarContainer: {
    marginRight: 16,
  },
  userAvatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modernOvertimeUserInfo: {
    flex: 1,
  },
  modernOvertimeUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modernOvertimeUserPosition: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  selectionIndicator: {
    width: 30,
    alignItems: 'center',
  },
  checkIconContainer: {
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#444',
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedText: {
    fontSize: 14,
    color: '#444',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  readOnlyInput: {
    backgroundColor: '#f0f2f5',
    color: '#666',
  },
  userSelectionModal: {
    maxHeight: '70%',
  },
  userList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  overtimeUserInfo: {
    flex: 1,
  },
  overtimeUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  overtimeUserPosition: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  // Modern Leave Management Styles
  leaveManagementContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modernListContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardSeparator: {
    height: 16,
  },
  modernLeaveCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  modernUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },
  modernUserPosition: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  modernStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  modernStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  modernCardContent: {
    padding: 20,
    paddingTop: 16,
  },
  infoRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItemModern: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#95a5a6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reasonSection: {
    marginBottom: 16,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  modernReasonText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLOR,
  },
  feedbackSection: {
    marginTop: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e67e22',
  },
  feedbackBubble: {
    backgroundColor: '#fff5f0',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  modernFeedbackText: {
    fontSize: 14,
    color: '#d35400',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  modernActionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
  },
  modernRejectButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modernApproveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  modernButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modernLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modernEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modernEmptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  modernEmptySubtitle: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  refreshButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Manager;
