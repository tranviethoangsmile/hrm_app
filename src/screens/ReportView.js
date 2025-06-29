/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  PAID_LEAVE,
  SEARCH,
  UPDATE,
} from '../utils/constans';
import axios from 'axios';
import {THEME_COLOR} from '../utils/Colors';
import Loader from '../components/Loader';
import Header from '../components/common/Header';

function ReportView() {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);

  const [err, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leaveRequested, setLeaveRequested] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModalFeedback, setShowModalFeedback] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [leaveId, setLeaveId] = useState('');
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);

  useEffect(() => {
    const role = authData?.data?.data.role;
    if (role === 'STAFF') {
      showAlert(t('auth'));
      navigation.navigate('Main');
      return;
    }
    getValueRequestLeave();
  }, []);

  const showAlert = message => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  };

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

  const renderItem = ({item}) => {
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
      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.userInfo}>
            <Icon name="user" size={16} color="#666" />
            <Text style={styles.userName}>{item.staff.name}</Text>
          </View>
          <View
            style={[styles.statusBadge, {backgroundColor: `${statusColor}15`}]}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <Text style={[styles.statusText, {color: statusColor}]}>
              {statusText}
            </Text>
          </View>
        </View>

        <View style={styles.reportContent}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={14} color="#666" />
            <Text style={styles.infoText}>
              {moment(item.date_leave).format('DD/MM/YYYY')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon
              name={item.is_paid ? 'money' : 'clock-o'}
              size={14}
              color="#666"
            />
            <Text style={styles.infoText}>
              {item.is_paid ? t('paid') : t('unpaid')}
            </Text>
          </View>

          <View style={styles.reasonContainer}>
            <Icon name="file-text-o" size={14} color="#666" />
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>

          {item.feedback && (
            <View style={styles.feedbackContainer}>
              <Icon name="comment-o" size={14} color="#666" />
              <Text style={styles.feedbackText}>{item.feedback}</Text>
            </View>
          )}
        </View>

        {!item.is_approve && !item.feedback && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => {
                setLeaveId(item.id);
                showModalFeedbackUnApprove();
              }}>
              <Icon name="times" size={14} color="#fff" />
              <Text style={styles.buttonText}>{t('un_approve')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => {
                setSelectedLeaveId(item.id);
                setShowConfirmModal(true);
              }}>
              <Icon name="check" size={14} color="#fff" />
              <Text style={styles.buttonText}>{t('is_approve')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    getValueRequestLeave();
    setRefreshing(false);
  };

  const getValueRequestLeave = async () => {
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
  };

  const onClose = () => {
    setShowModalFeedback(false);
  };

  const handleCancelFeedback = () => {
    setFeedback('');
    setShowModalFeedback(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />
      <Header
        title={t('report.title', 'Báo cáo đơn nghỉ')}
        onBack={() => navigation.goBack()}
      />
      <Loader visible={isLoading} />
      {err ? <Text style={styles.errorText}>{err}</Text> : null}

      <FlatList
        data={leaveRequested}
        renderItem={renderItem}
        keyExtractor={item => item.id?.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={THEME_COLOR} style={styles.loader} />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="file-text-o" size={48} color="#ddd" />
              <Text style={styles.emptyText}>
                {t('no_reports', 'Chưa có đơn nghỉ nào cần duyệt')}
              </Text>
            </View>
          )
        }
      />

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
              <Icon name="question-circle" size={50} color={THEME_COLOR} />
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
    </View>
  );
}

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
  listContainer: {
    padding: 16,
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
  },
});

export default ReportView;
