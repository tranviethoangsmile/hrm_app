import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';
import {THEME_COLOR_2} from '../utils/Colors';
import {useSelector} from 'react-redux';
import {useTheme} from '../hooks/useTheme';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ja';
import 'moment/locale/pt';
import 'moment/locale/vi';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  OVERTIME_REQUEST,
  GET_ALL_BY_USER_ID,
  UPDATE_IS_CONFIRM_OVERTIME_REQUEST,
} from '../utils/constans';
import {ModalMessage} from '../components';

const OvertimeConfirm = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const {colors, isDarkMode} = useTheme();
  const [showGuide, setShowGuide] = useState(false);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1500);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const authData = useSelector(state => state.auth);
  const user_id = authData?.data?.data?.id;

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${OVERTIME_REQUEST}${GET_ALL_BY_USER_ID}`,
        {
          id: user_id,
        },
      );

      if (response?.data?.success) {
        setOvertimeRequests(response.data.data);
      } else {
        setError(t('not.data'));
        setOvertimeRequests([]);
      }
    } catch (error) {
      setError(t('networkError'));
      setOvertimeRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user_id, t]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  const formatDate = useCallback((date, format = 'L') => {
    return moment(date).format(format);
  }, []);

  const handleConfirm = useCallback(
    async id => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${OVERTIME_REQUEST}${UPDATE_IS_CONFIRM_OVERTIME_REQUEST}`,
          {
            id,
            user_id,
          },
        );

        if (response?.data?.success) {
          // Cập nhật UI trực tiếp
          setOvertimeRequests(prevRequests =>
            prevRequests.map(request =>
              request.id === id ? {...request, is_confirm: true} : request,
            ),
          );
          // Hiển thị thông báo thành công
          setMessageModal('overtime.confirm_success');
          setMessageType('success');
          setDuration(1500);
          setMessageModalVisible(true);
        } else {
          setMessageModal(response?.data?.message || 'networkError');
          setMessageType('error');
          setDuration(1500);
          setMessageModalVisible(true);
        }
      } catch (error) {
        console.log(error);
        setMessageModal(
          error.response?.status === 400
            ? 'overtime.missing_fields'
            : 'networkError',
        );
        setMessageType('error');
        setDuration(1500);
        setMessageModalVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [user_id],
  );

  const toggleExpand = useCallback(id => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const renderDescription = useCallback(
    (description, id) => {
      if (!description) {
        return <Text style={[styles.description, {color: colors.text}]}>-</Text>;
      }

      const isExpanded = expandedItems[id];
      const shouldShowExpandButton = description.length > 100;
      const displayText =
        shouldShowExpandButton && !isExpanded
          ? `${description.substring(0, 100)}...`
          : description;

      return (
        <View style={styles.descriptionWrapper}>
          <Text style={[styles.description, {color: colors.text}]}>{displayText}</Text>
          {shouldShowExpandButton && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleExpand(id)}>
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
                style={styles.expandIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [expandedItems, toggleExpand, colors],
  );

  const renderItem = ({item}) => (
    <View style={[styles.requestCard, {backgroundColor: colors.surface}]}>
      <View style={[styles.cardHeader, {borderBottomColor: colors.border}]}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.is_confirm ? '#2ecc71' : '#f39c12',
              },
            ]}
          />
          <Text style={[styles.statusText, {color: colors.textSecondary}]}>
            {item.is_confirm ? t('overtime.approved') : t('overtime.pending')}
          </Text>
        </View>
        <View style={styles.requestDateContainer}>
          <Icon name="clock-o" size={14} color={colors.textSecondary} style={styles.dateIcon} />
          <Text style={[styles.dateText, {color: colors.textSecondary}]}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="building" size={18} color={colors.primary} />
          <Text style={[styles.label, {color: colors.textSecondary}]}>{t('overtime.work_area')}:</Text>
          <Text style={[styles.value, {color: colors.text}]}>{item.departmentDetail?.name || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="user" size={18} color={colors.primary} />
          <Text style={[styles.label, {color: colors.textSecondary}]}>{t('overtime.requester')}:</Text>
          <View style={styles.requesterContainer}>
            <Text style={[styles.value, {color: colors.text}]}>{item.leaderDetail?.name || '-'}</Text>
            {item.leaderDetail?.avatar && (
              <Image
                source={{
                  uri:
                    item.leaderDetail.avatar ||
                    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                }}
                style={styles.avatar}
              />
            )}
          </View>
        </View>

        <View style={[styles.contentContainer, {backgroundColor: colors.background}]}>
          <View style={styles.infoRow}>
            <Icon name="file-text" size={18} color={colors.primary} />
            <Text style={[styles.label, {color: colors.textSecondary}]}>{t('overtime.work_content')}:</Text>
          </View>
          {renderDescription(item.description, item.id)}
        </View>

        <View style={[styles.dateContainer, {backgroundColor: colors.background}]}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={18} color={colors.primary} />
            <Text style={[styles.label, {color: colors.textSecondary}]}>{t('overtime.work_date')}:</Text>
            <Text style={[styles.value, {color: colors.text}]}>{formatDate(item.date)}</Text>
          </View>
        </View>

        {!item.is_confirm && (
          <View style={[styles.actionContainer, {borderTopColor: colors.border}]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionConfirmButton]}
              onPress={() => handleConfirm(item.id)}>
              <Icon name="check" size={16} color="#fff" />
              <Text style={styles.buttonText}>{t('overtime.confirm')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={isDarkMode ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {t('overtime.title')}
          </Text>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowGuide(true)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="question-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.content, {backgroundColor: colors.background}]}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : error ? (
          <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
        ) : overtimeRequests.length === 0 ? (
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>{t('not.data')}</Text>
        ) : (
          <FlatList
            data={overtimeRequests}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <Modal
        visible={showGuide}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGuide(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGuide(false)}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>{t('overtime.guide_title')}</Text>
              <TouchableOpacity onPress={() => setShowGuide(false)}>
                <Icon name="times" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.guideText, {color: colors.text}]}>
                {t('overtime.guide_content')}
              </Text>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={messageModal}
        type={messageType}
        t={t}
        duration={duration}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    paddingBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  requestDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 13,
  },
  cardBody: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 100,
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  requesterContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
  },
  contentContainer: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  descriptionWrapper: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  dateContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  actionConfirmButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  listContainer: {
    paddingBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  expandButton: {
    padding: 4,
  },
  expandIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 15,
  },
  guideText: {
    fontSize: 16,
    lineHeight: 24,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLOR_2,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmModalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME_COLOR_2,
    marginTop: 15,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  confirmModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: THEME_COLOR_2,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default OvertimeConfirm;
