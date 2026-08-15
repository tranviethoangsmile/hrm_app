/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Animated,
} from 'react-native';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
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
  DELETE,
} from '../utils/constans';
import apiClient from '../services/apiClient';
import OptimizedLoader from '../components/OptimizedLoader';
import ModalMessage from '../components/ModalMessage';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../hooks/useTheme';
import {useUserProfile} from '../hooks/useUserProfile';

const {height} = Dimensions.get('window');

const REASON_TYPES = [
  {value: 'personal', icon: 'briefcase-outline'},
  {value: 'sick', icon: 'medkit-outline'},
  {value: 'regulation', icon: 'shield-checkmark-outline'},
  {value: 'other', icon: 'ellipsis-horizontal-circle-outline'},
];

const getStatus = item => {
  if (item?.is_approve) {
    return 'approved';
  }
  if (item?.feedback) {
    return 'rejected';
  }
  return 'pending';
};

const Leave = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const {colors} = useTheme();
  const {userInfo: leaveProfile} = useUserProfile();

  const [activeTab, setActiveTab] = useState(0);
  const [dayOff, setDayOff] = useState(moment().add(1, 'day').toDate());
  const [leaderList, setLeaderList] = useState([]);
  const [leaderValue, setLeaderValue] = useState('');
  const [leaderLabel, setLeaderLabel] = useState('');
  const [reason, setReason] = useState('');
  const [selectedReasonType, setSelectedReasonType] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [isSelectToModal, setIsSelectToModal] = useState(false);
  const [isLeaderModal, setIsLeaderModal] = useState(false);
  const [is_paid, setIs_paid] = useState(true);
  const [is_half, setIs_half] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [leaveRequested, setLeaveRequested] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    visible: false,
    type: 'info',
    message: '',
  });
  const [errorReason, setErrorReason] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const sheetTranslateY = useRef(new Animated.Value(height)).current;

  const showToast = (message, type = 'info') => {
    setModalMessage({visible: true, type, message});
  };

  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };

  const getReasonText = reasonType => {
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

  const getValueRequestLeave = async () => {
    try {
      const field = {user_id: authData?.data?.data?.id};
      const leaves = await apiClient.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${SEARCH}`,
        {...field},
      );
      if (leaves?.data.success) {
        const sortedPosts = leaves.data.data.sort(
          (a, b) => new Date(b.date_leave) - new Date(a.date_leave),
        );
        setLeaveRequested(sortedPosts);
      } else {
        showToast(t('not.data'), 'warning');
      }
    } catch (error) {
      showToast(
        t('load_leave_error', 'Không thể tải danh sách nghỉ phép'),
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getLeaderList = async () => {
    try {
      setIsLoading(true);
      const field = {department_id: authData?.data?.data?.department_id};
      const listUser = await apiClient.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${GET_USER_WITH_DEPARTMENT_ID}`,
        {...field},
      );
      if (listUser?.data?.success) {
        const formattedList = listUser?.data?.data.map(leader => ({
          label: leader.name,
          value: leader.id,
        }));
        setLeaderList(formattedList);
      } else {
        showToast(
          t('load_leader_error', 'Không thể tải danh sách người duyệt'),
          'error',
        );
      }
    } catch (error) {
      showToast(
        t('load_leader_error', 'Không thể tải danh sách người duyệt'),
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDayOffPaid = async () => {
    let hasError = false;
    const finalReason = selectedReasonType === 'other' ? customReason : reason;

    if (!finalReason.trim()) {
      setErrorReason(true);
      hasError = true;
      if (selectedReasonType === 'other') {
        showToast(
          t('leave_reason_enter_custom_required', 'Vui lòng nhập lý do cụ thể'),
          'error',
        );
        return;
      }
    } else {
      setErrorReason(false);
    }
    if (!leaderValue) {
      showToast(
        t('select_leader_required', 'Vui lòng chọn người duyệt'),
        'error',
      );
      return;
    }
    if (hasError) {
      showToast(t('fill_required'), 'error');
      return;
    }
    setErrorReason(false);
    setIsLoading(true);
    try {
      const field = {
        user_id: authData?.data?.data?.id,
        reason: finalReason,
        leader_id: leaderValue,
        date_request: moment().format('YYYY-MM-DD'),
        is_paid,
        date_leave: moment(dayOff).format('YYYY-MM-DD'),
        position: authData?.data?.data?.position,
        is_half,
      };
      const paidleave = await apiClient.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${CREATE}`,
        {...field},
      );
      if (paidleave?.data?.success) {
        setIsLoading(false);
        hideSheet();
        onRefresh();
        showToast(t('send_request_success'), 'success');
      } else {
        setIsLoading(false);
        hideSheet();
        showToast(t('send_request_failed'), 'error');
      }
    } catch (error) {
      hideSheet();
      setIsLoading(false);
      showToast(t('send_request_failed'), 'error');
    }
  };

  const handleDeleteLeaveRequest = async id => {
    setOpenMenuId(null);
    setConfirmDeleteId(null);
    try {
      setIsLoading(true);
      const response = await apiClient.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${DELETE}`,
        {id, user_id: authData?.data?.data?.id},
      );
      if (response?.data?.success) {
        showToast(t('delete_success', 'Đã xóa đơn nghỉ thành công'), 'success');
        onRefresh();
      } else {
        showToast(t('delete_failed', 'Xóa đơn nghỉ thất bại'), 'error');
      }
    } catch (error) {
      showToast(t('delete_failed', 'Xóa đơn nghỉ thất bại'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getValueRequestLeave();
    setRefreshing(false);
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
  }, []);

  useEffect(() => {
    if (modal) {
      sheetTranslateY.setValue(height);
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  }, [modal, sheetTranslateY]);

  const openSheet = () => {
    setReason('');
    setSelectedReasonType(null);
    setCustomReason('');
    setDayOff(moment().add(1, 'day').toDate());
    setIs_paid(true);
    setIs_half(false);
    setLeaderValue('');
    setLeaderLabel('');
    setErrorReason(false);
    setModal(true);
  };

  const hideSheet = () => {
    Animated.timing(sheetTranslateY, {
      toValue: height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setModal(false));
  };

  const filterLeavesByStatus = () => {
    switch (activeTab) {
      case 0:
        return leaveRequested.filter(item => getStatus(item) === 'pending');
      case 1:
        return leaveRequested.filter(item => getStatus(item) === 'approved');
      case 2:
        return leaveRequested.filter(item => getStatus(item) === 'rejected');
      default:
        return leaveRequested;
    }
  };

  const getCount = status =>
    leaveRequested.filter(item => getStatus(item) === status).length;

  const renderHeader = () => (
    <View>
      {leaveProfile?.paid_days != null ? (
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>
                {t('leave.remaining_label', 'Ngày phép còn lại')}
              </Text>
              <View style={styles.heroValueRow}>
                <Text style={styles.heroValue}>{leaveProfile.paid_days}</Text>
                <Text style={styles.heroUnit}>
                  {t('leave.day_unit', 'ngày')}
                </Text>
              </View>
            </View>
            <View style={styles.heroIconWrap}>
              <Icon name="calendar-outline" size={30} color="#fff" />
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStatsRow}>
            {[
              {
                label: t('pending'),
                value: getCount('pending'),
                color: '#fbbf24',
              },
              {
                label: t('approved'),
                value: getCount('approved'),
                color: '#86efac',
              },
              {
                label: t('rejected'),
                value: getCount('rejected'),
                color: '#fca5a5',
              },
            ].map(stat => (
              <View key={stat.label} style={styles.heroStat}>
                <Text style={[styles.heroStatValue, {color: stat.color}]}>
                  {stat.value}
                </Text>
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      ) : null}

      <View
        style={[
          styles.tabContainer,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}>
        {[
          {key: 0, title: t('pending'), color: '#f59e0b'},
          {key: 1, title: t('approved'), color: '#22c55e'},
          {key: 2, title: t('rejected'), color: '#ef4444'},
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              style={[
                styles.tabButton,
                isActive && {backgroundColor: colors.primary},
              ]}
              onPress={() => setActiveTab(tab.key)}>
              <View style={styles.tabButtonInner}>
                <View
                  style={[
                    styles.tabDot,
                    {backgroundColor: isActive ? '#fff' : tab.color},
                  ]}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    {color: isActive ? '#fff' : colors.textSecondary},
                  ]}>
                  {tab.title}
                </Text>
                <View
                  style={[
                    styles.tabBadge,
                    isActive
                      ? {backgroundColor: 'rgba(255,255,255,0.22)'}
                      : {backgroundColor: colors.surface},
                  ]}>
                  <Text
                    style={[
                      styles.tabBadgeText,
                      {color: isActive ? '#fff' : colors.textSecondary},
                    ]}>
                    {getCount(
                      tab.key === 0
                        ? 'pending'
                        : tab.key === 1
                        ? 'approved'
                        : 'rejected',
                    )}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderLeaveCard = ({item}) => {
    const status = getStatus(item);
    const statusColor =
      status === 'approved'
        ? colors.success
        : status === 'rejected'
        ? colors.danger
        : colors.warning;
    const statusLabel = t(status === 'pending' ? 'awaiting' : status);
    const statusIcon =
      status === 'approved'
        ? 'checkmark-circle'
        : status === 'rejected'
        ? 'close-circle'
        : 'time';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardDateBlock}>
            <Text style={[styles.cardDateDay, {color: colors.primary}]}>
              {moment(item.date_leave).format('DD')}
            </Text>
            <Text style={[styles.cardDateMonth, {color: colors.textSecondary}]}>
              {moment(item.date_leave).format('MMM, YYYY')}
            </Text>
          </View>
          <View
            style={[
              styles.typeChip,
              {
                backgroundColor: item.is_paid
                  ? colors.success + '18'
                  : colors.warning + '18',
              },
            ]}>
            <Icon
              name={item.is_paid ? 'cash-outline' : 'time-outline'}
              size={13}
              color={item.is_paid ? colors.success : colors.warning}
            />
            <Text
              style={[
                styles.typeChipText,
                {color: item.is_paid ? colors.success : colors.warning},
              ]}>
              {item.is_paid ? t('paid') : t('unpaid')}
            </Text>
          </View>
          {status === 'pending' && (
            <TouchableOpacity
              style={[
                styles.menuBtn,
                {backgroundColor: colors.backgroundSecondary},
              ]}
              onPress={() =>
                setOpenMenuId(openMenuId === item.id ? null : item.id)
              }>
              <Icon
                name="ellipsis-vertical"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardBody}>
          {item.reason ? (
            <View style={styles.reasonRow}>
              <Icon
                name="document-text-outline"
                size={15}
                color={colors.textSecondary}
              />
              <Text style={[styles.reasonText, {color: colors.text}]}>
                {item.reason}
              </Text>
            </View>
          ) : null}

          {item.is_half ? (
            <View style={styles.halfChip}>
              <Icon name="sunny-outline" size={13} color={colors.primary} />
              <Text style={[styles.halfChipText, {color: colors.primary}]}>
                {t('half.d')}
              </Text>
            </View>
          ) : null}

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusPill,
                {backgroundColor: statusColor + '18'},
              ]}>
              <Icon name={statusIcon} size={14} color={statusColor} />
              <Text style={[styles.statusPillText, {color: statusColor}]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {item.feedback ? (
            <View
              style={[
                styles.feedbackBox,
                {backgroundColor: colors.backgroundSecondary},
              ]}>
              <Icon
                name="chatbubble-ellipses-outline"
                size={15}
                color={colors.textSecondary}
              />
              <Text style={[styles.feedbackText, {color: colors.text}]}>
                {item.feedback}
              </Text>
            </View>
          ) : null}
        </View>

        {openMenuId === item.id && (
          <>
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setOpenMenuId(null)}
            />
            <View
              style={[
                styles.menuPopup,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                style={[styles.menuItem, {opacity: 0.5}]}
                disabled
                onPress={() => setOpenMenuId(null)}>
                <Icon
                  name="create-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.menuText, {color: colors.textSecondary}]}>
                  {t('edit')}
                </Text>
              </TouchableOpacity>
              <View
                style={[styles.menuDivider, {backgroundColor: colors.border}]}
              />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setOpenMenuId(null);
                  setConfirmDeleteId(item.id);
                }}>
                <Icon name="trash-outline" size={16} color={colors.danger} />
                <Text style={[styles.menuText, {color: colors.danger}]}>
                  {t('delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderLeaderPicker = () => (
    <Modal
      visible={isLeaderModal}
      transparent
      animationType="fade"
      onRequestClose={() => setIsLeaderModal(false)}>
      <TouchableWithoutFeedback onPress={() => setIsLeaderModal(false)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[styles.sheet, {backgroundColor: colors.surface}]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, {color: colors.text}]}>
                  {t('leave.leader_label', 'Người duyệt')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    {backgroundColor: colors.backgroundSecondary},
                  ]}
                  onPress={() => setIsLeaderModal(false)}>
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {leaderList.length === 0 ? (
                <View style={styles.pickerEmpty}>
                  <Icon
                    name="people-outline"
                    size={36}
                    color={colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.pickerEmptyText,
                      {color: colors.textSecondary},
                    ]}>
                    {t('no_leader', 'Chưa có người duyệt')}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={{maxHeight: 320}}
                  showsVerticalScrollIndicator={false}>
                  {leaderList.map((leader, index) => {
                    const selected = leaderValue === leader.value;
                    return (
                      <TouchableOpacity
                        key={String(leader.value)}
                        style={[
                          styles.leaderItem,
                          {borderBottomColor: colors.border},
                          selected && {backgroundColor: colors.primary + '18'},
                        ]}
                        onPress={() => {
                          setLeaderValue(leader.value);
                          setLeaderLabel(leader.label);
                          setIsLeaderModal(false);
                        }}>
                        <View
                          style={[
                            styles.leaderAvatar,
                            {backgroundColor: colors.primaryLight},
                          ]}>
                          <Text
                            style={[
                              styles.leaderAvatarText,
                              {color: colors.primary},
                            ]}>
                            {(leader.label || '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.leaderName, {color: colors.text}]}>
                          {leader.label}
                        </Text>
                        {selected && (
                          <Icon
                            name="checkmark-circle"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderDatePickerModal = () => (
    <Modal
      visible={isSelectToModal}
      transparent
      animationType="fade"
      onRequestClose={() => setIsSelectToModal(false)}>
      <TouchableWithoutFeedback onPress={() => setIsSelectToModal(false)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[styles.dateModalCard, {backgroundColor: colors.surface}]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, {color: colors.text}]}>
                {t('leave.select_date', 'Chọn ngày nghỉ')}
              </Text>
              <DatePicker
                date={dayOff}
                mode="date"
                locale={i18next.language}
                onDateChange={setDayOff}
                textColor={colors.text}
                dayTextColor={colors.text}
                monthTextColor={colors.text}
                yearTextColor={colors.text}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, {backgroundColor: colors.primary}]}
                onPress={() => setIsSelectToModal(false)}>
                <Text style={styles.primaryBtnText}>{t('done')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderConfirmDeleteModal = () => (
    <Modal
      visible={confirmDeleteId != null}
      transparent
      animationType="fade"
      onRequestClose={() => setConfirmDeleteId(null)}>
      <TouchableWithoutFeedback onPress={() => setConfirmDeleteId(null)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[styles.confirmCard, {backgroundColor: colors.surface}]}>
              <View
                style={[
                  styles.confirmIconWrap,
                  {backgroundColor: colors.danger + '15'},
                ]}>
                <Icon name="trash-outline" size={30} color={colors.danger} />
              </View>
              <Text style={[styles.confirmTitle, {color: colors.text}]}>
                {t('delete_confirm_title', 'Xóa đơn nghỉ')}
              </Text>
              <Text style={[styles.confirmBody, {color: colors.textSecondary}]}>
                {t(
                  'delete_confirm_body',
                  'Bạn có chắc chắn muốn xóa đơn nghỉ phép này?',
                )}
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    {backgroundColor: colors.backgroundSecondary},
                  ]}
                  onPress={() => setConfirmDeleteId(null)}>
                  <Text
                    style={[
                      styles.confirmBtnText,
                      {color: colors.textSecondary},
                    ]}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, {backgroundColor: colors.danger}]}
                  onPress={() => handleDeleteLeaveRequest(confirmDeleteId)}>
                  <Text style={styles.confirmBtnTextDanger}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header
        title={t('leave.title', 'Đơn nghỉ phép')}
        onBack={() => navigation.goBack()}
      />
      <OptimizedLoader visible={isLoading} />

      <FlatList
        data={filterLeavesByStatus()}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderLeaveCard}
        ListHeaderComponent={renderHeader}
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
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrap,
                {backgroundColor: colors.backgroundSecondary},
              ]}>
              <Icon
                name="calendar-clear-outline"
                size={42}
                color={colors.textTertiary}
              />
            </View>
            <Text style={[styles.emptyTitle, {color: colors.text}]}>
              {t('no_leaves', 'Chưa có đơn nghỉ nào')}
            </Text>
            <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
              {t('no_leaves_hint', 'Nhấn nút + để tạo đơn nghỉ phép')}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.fab, {backgroundColor: colors.primary}]}
        onPress={openSheet}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Form bottom sheet */}
      <Modal visible={modal} transparent animationType="none">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback onPress={hideSheet}>
                <View style={styles.backdrop} />
              </TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.sheet,
                  {
                    backgroundColor: colors.surface,
                    transform: [{translateY: sheetTranslateY}],
                  },
                ]}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={[styles.sheetTitle, {color: colors.text}]}>
                      {t('request_leave', 'Tạo đơn nghỉ phép')}
                    </Text>
                    <Text
                      style={[
                        styles.sheetSubtitle,
                        {color: colors.textSecondary},
                      ]}>
                      {t(
                        'request_leave_hint',
                        'Điền thông tin bên dưới để gửi yêu cầu',
                      )}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.closeBtn,
                      {backgroundColor: colors.backgroundSecondary},
                    ]}
                    onPress={hideSheet}>
                    <Icon name="close" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.sheetScroll}
                  contentContainerStyle={styles.sheetContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">
                  {/* Date field */}
                  <Text style={[styles.fieldLabel, {color: colors.text}]}>
                    {t('leave.select_date', 'Ngày nghỉ')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.field,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setIsSelectToModal(true)}>
                    <Icon
                      name="calendar-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.fieldValue, {color: colors.text}]}>
                      {moment(dayOff).format('DD/MM/YYYY')}
                    </Text>
                    <Icon
                      name="chevron-forward"
                      size={16}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>

                  {/* Reason type chips */}
                  <Text style={[styles.fieldLabel, {color: colors.text}]}>
                    {t('leave_reason_type')}
                  </Text>
                  <View style={styles.chipGrid}>
                    {REASON_TYPES.map(item => {
                      const selected = selectedReasonType === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: selected
                                ? colors.primary
                                : colors.backgroundSecondary,
                              borderColor: selected
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                          onPress={() => {
                            if (item.value === 'other') {
                              setReason('');
                              setCustomReason('');
                            } else {
                              setReason(getReasonText(item.value));
                              setCustomReason('');
                            }
                            setSelectedReasonType(item.value);
                            setErrorReason(false);
                          }}>
                          <Icon
                            name={item.icon}
                            size={15}
                            color={selected ? '#fff' : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.chipText,
                              {color: selected ? '#fff' : colors.text},
                            ]}>
                            {t(`leave_reason_${item.value}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {selectedReasonType === 'other' && (
                    <>
                      <Text style={[styles.fieldLabel, {color: colors.text}]}>
                        {t('leave_reason_custom')}
                      </Text>
                      <TextInput
                        style={[
                          styles.field,
                          styles.multilineInput,
                          {
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: errorReason
                              ? colors.danger
                              : colors.border,
                            color: colors.text,
                          },
                        ]}
                        placeholder={t('leave_reason_enter_custom')}
                        placeholderTextColor={colors.textTertiary}
                        value={customReason}
                        onChangeText={text => {
                          setCustomReason(text);
                          if (errorReason && text.trim()) {
                            setErrorReason(false);
                          }
                        }}
                        multiline
                        maxLength={300}
                        textAlignVertical="top"
                      />
                    </>
                  )}

                  {/* Paid / half-day toggles */}
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.toggleChip,
                        {
                          backgroundColor: is_paid
                            ? colors.success + '1A'
                            : colors.backgroundSecondary,
                          borderColor: is_paid ? colors.success : colors.border,
                        },
                      ]}
                      onPress={() => setIs_paid(!is_paid)}>
                      <Icon
                        name={is_paid ? 'checkmark-circle' : 'ellipse-outline'}
                        size={17}
                        color={is_paid ? colors.success : colors.textTertiary}
                      />
                      <Text
                        style={[
                          styles.toggleText,
                          {color: is_paid ? colors.success : colors.text},
                        ]}>
                        {t('paid')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleChip,
                        {
                          backgroundColor: is_half
                            ? colors.primary + '1A'
                            : colors.backgroundSecondary,
                          borderColor: is_half ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setIs_half(!is_half)}>
                      <Icon
                        name={is_half ? 'checkmark-circle' : 'ellipse-outline'}
                        size={17}
                        color={is_half ? colors.primary : colors.textTertiary}
                      />
                      <Text
                        style={[
                          styles.toggleText,
                          {color: is_half ? colors.primary : colors.text},
                        ]}>
                        {t('half.d')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Leader field */}
                  <Text style={[styles.fieldLabel, {color: colors.text}]}>
                    {t('leave.leader_label', 'Người duyệt')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.field,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setIsLeaderModal(true)}>
                    <Icon
                      name="person-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.fieldValue,
                        {
                          color: leaderLabel
                            ? colors.text
                            : colors.textTertiary,
                        },
                      ]}>
                      {leaderLabel || t('selectName')}
                    </Text>
                    <Icon
                      name="chevron-forward"
                      size={16}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.submitBtn,
                      {backgroundColor: colors.primary},
                    ]}
                    onPress={handleRequestDayOffPaid}
                    disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Icon
                          name="paper-plane-outline"
                          size={18}
                          color="#fff"
                        />
                        <Text style={styles.submitBtnText}>{t('submit')}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {renderDatePickerModal()}
      {renderLeaderPicker()}
      {renderConfirmDeleteModal()}

      <ModalMessage
        isVisible={modalMessage.visible}
        type={modalMessage.type}
        message={modalMessage.message}
        onClose={() => setModalMessage({...modalMessage, visible: false})}
        duration={1800}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  heroValue: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  heroUnit: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    marginBottom: 8,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDateBlock: {
    marginRight: 12,
  },
  cardDateDay: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  cardDateMonth: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuBtn: {
    marginLeft: 'auto',
    padding: 8,
    borderRadius: 20,
  },
  cardBody: {
    marginTop: 14,
    gap: 10,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  halfChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(79,70,229,0.1)',
  },
  halfChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 20,
  },
  menuPopup: {
    position: 'absolute',
    top: 46,
    right: 8,
    borderRadius: 14,
    paddingVertical: 6,
    width: 150,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(128,128,128,0.35)',
    marginTop: 10,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
  },
  sheetScroll: {
    maxHeight: height * 0.62,
  },
  sheetContent: {
    paddingBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  field: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '48%',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  toggleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.2,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 6,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dateModalCard: {
    width: '88%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 24,
    alignItems: 'center',
    marginBottom: height * 0.12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  pickerEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  pickerEmptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  leaderName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmCard: {
    width: '86%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: height * 0.2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  confirmIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  confirmBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtnTextDanger: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default Leave;
