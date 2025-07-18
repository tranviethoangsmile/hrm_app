import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import ModalMessage from '../components/ModalMessage';
import {useTranslation} from 'react-i18next';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  SAFETY_REPORT,
  GET_ALL_BY_USER_ID,
  DELETE,
  CREATE,
  UPDATE,
} from '../utils/constans';
import {TEXT_COLOR} from '../utils/Colors';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import BeautifulModal from '../components/BeautifulModal';
import Loader from '../components/Loader';

// Tạo component ReportForm giống PostInput
const defaultForm = {
  title: '',
  content: '',
  solution: '',
  media_path: '',
  customTitle: '',
};

const ReportForm = ({
  onSubmit,
  loading,
  initialData = defaultForm,
  t,
  onCancel,
  isEdit,
  editFields = ['title', 'content', 'solution', 'media_path', 'customTitle'],
  onShowMessage,
}) => {
  const [form, setForm] = useState(initialData);
  const [showTitleMenu, setShowTitleMenu] = useState(false);
  const [inputFocus, setInputFocus] = useState('');
  const titleOptions = [
    t('danger', 'Nguy hiểm'),
    t('accident', 'Tai nạn đã xảy ra'),
    t('potential_danger', 'Khả năng nguy hiểm'),
    t('other', 'Khác'),
  ];

  useEffect(() => {
    setForm(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(initialData)) {
        return initialData;
      }
      return prev;
    });
  }, [initialData]);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets && result.assets.length > 0) {
      setForm(prev => ({...prev, media_path: result.assets[0].uri}));
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.content || !form.solution) {
      onShowMessage && onShowMessage('fill_required', 'error', 1500);
      return;
    }
    onSubmit(form, undefined, () => setForm(defaultForm));
  };

  return (
    <View>
      <View style={{zIndex: 1000, marginBottom: 12, position: 'relative'}}>
        <View style={styles.formGroupRedesignModernized}>
          <Text style={styles.inputLabelRedesignModernized}>{t('til')}</Text>
          <TouchableOpacity
            style={[
              styles.inputRedesignModernized,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
              },
            ]}
            activeOpacity={
              !isEdit || (isEdit && editFields.includes('title')) ? 0.85 : 1
            }
            onPress={
              !isEdit || (isEdit && editFields.includes('title'))
                ? () => setShowTitleMenu(true)
                : undefined
            }
            disabled={isEdit && !editFields.includes('title')}>
            <Text
              style={{
                color: form.title ? '#222' : '#aaa',
                fontSize: 17,
              }}>
              {form.title || t('choose_title')}
            </Text>
            <Icon
              name={showTitleMenu ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
          {showTitleMenu && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                pointerEvents: 'box-none',
              }}>
              <Pressable
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                onPress={() => setShowTitleMenu(false)}
              />
              <View
                style={[
                  styles.menuPopupCustom,
                  {
                    position: 'absolute',
                    top: 60,
                    left: 0,
                    right: 0,
                    zIndex: 1001,
                    marginTop: 0,
                  },
                ]}>
                {titleOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.menuItemCustom}
                    onPress={() => {
                      setForm(prev => ({...prev, title: option}));
                      setShowTitleMenu(false);
                    }}>
                    <Text style={styles.menuTextCustom}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {form.title === t('other', 'Khác') && (
            <TextInput
              style={[styles.inputRedesignModernized, {marginTop: 8}]}
              placeholder={t('til')}
              placeholderTextColor={TEXT_COLOR}
              value={form.customTitle || ''}
              onChangeText={text =>
                setForm(prev => ({...prev, customTitle: text}))
              }
              returnKeyType="next"
              accessibilityLabel={t('til')}
              onFocus={() => setInputFocus('title')}
              onBlur={() => setInputFocus('')}
            />
          )}
        </View>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 8}}
        style={{zIndex: 1}}>
        <View style={styles.formGroupRedesignModernized}>
          <Text style={styles.inputLabelRedesignModernized}>
            {t('enter_note')}
          </Text>
          <TextInput
            style={[
              styles.inputRedesignModernized,
              styles.textAreaRedesignModernized,
            ]}
            placeholder={t('enter_note')}
            placeholderTextColor={TEXT_COLOR}
            value={form.content}
            onChangeText={text => setForm(prev => ({...prev, content: text}))}
            multiline
            returnKeyType="next"
            accessibilityLabel={t('enter_note')}
            onFocus={() => setInputFocus('content')}
            onBlur={() => setInputFocus('')}
          />
        </View>
        <View style={styles.formGroupRedesignModernized}>
          <Text style={styles.inputLabelRedesignModernized}>
            {t('solution')}
          </Text>
          <TextInput
            style={styles.inputRedesignModernized}
            placeholder={t('solution')}
            placeholderTextColor={TEXT_COLOR}
            value={form.solution}
            onChangeText={text => setForm(prev => ({...prev, solution: text}))}
            returnKeyType="done"
            accessibilityLabel={t('solution')}
            onFocus={() => setInputFocus('solution')}
            onBlur={() => setInputFocus('')}
          />
        </View>
        <View style={styles.formGroupRedesignModernized}>
          <Text style={styles.inputLabelRedesignModernized}>
            {t('attach_image')}
          </Text>
          <TouchableOpacity
            style={styles.imagePickerBtnRedesignModernized}
            onPress={
              !isEdit || (isEdit && editFields.includes('media_path'))
                ? handlePickImage
                : undefined
            }
            disabled={isEdit && !editFields.includes('media_path')}
            accessibilityLabel={t('attach_image')}
            accessibilityHint={t('attach_image_hint') || ''}>
            <Text style={styles.imagePickerTextRedesignModernized}>
              {form.media_path ? t('change_image') : t('attach_image')}
            </Text>
          </TouchableOpacity>
          {form.media_path ? (
            <View style={styles.imagePreviewWrapperRedesignModernized}>
              <Image
                source={{uri: form.media_path}}
                style={styles.imagePreviewRedesignModernized}
                resizeMode="cover"
                accessibilityLabel={t('attached_image')}
              />
              <TouchableOpacity
                style={styles.removeImageBtnRedesignModernized}
                onPress={() => setForm(prev => ({...prev, media_path: ''}))}
                accessibilityLabel={t('remove_image')}
                accessibilityHint={t('remove_image_hint') || ''}>
                <Icon name="close" size={22} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 18,
            gap: 14,
          }}>
          <TouchableOpacity
            style={[
              styles.actionBtnRedesignModernized,
              styles.cancelBtnRedesignModernized,
            ]}
            onPress={() => {
              setForm(defaultForm);
              onCancel && onCancel();
            }}
            disabled={loading}>
            <Text style={styles.cancelBtnTextRedesignModernized}>{t('c')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtnRedesignModernized,
              isEdit
                ? styles.editBtnRedesignModernized
                : styles.createBtnRedesignModernized,
            ]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnTextRedesignModernized}>
                {isEdit ? t('Save') : t('create')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const {width} = Dimensions.get('window');
const TAB_WIDTH = width / 2;

const STATUS_COLORS = {
  pending: '#f39c12',
  confirmed: '#2ecc71',
};

const Important = ({route}) => {
  const {t, i18n} = useTranslation();
  const {USER_INFOR} = route.params;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [idReportEdit, setIdReportEdit] = useState('');
  const today = moment();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0); // 0: chưa xác nhận, 1: đã xác nhận
  const [openMenuId, setOpenMenuId] = useState(null);
  // Thêm state cho modal xác nhận xóa
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const showMessage = useCallback((msg, type, dur) => {
    setMessageModalVisible(prev => {
      return true;
    });
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  }, []);

  // Sửa triệt để lỗi render liên tục: today chỉ tính trong hàm, dependency đúng
  const getAllSafetyReportByUserI = useCallback(
    async userId => {
      const today = moment().format('YYYY-MM-DD');
      try {
        const result = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${GET_ALL_BY_USER_ID}`,
          {user_id: userId, date: today},
        );
        setData(result.data.data || []);
      } catch (error) {
        showMessage('contactAdmin', 'error', 1000);
      } finally {
        setIsLoading(false);
      }
    },
    [showMessage],
  );
  useEffect(() => {
    getAllSafetyReportByUserI(USER_INFOR.id);
  }, [USER_INFOR.id, getAllSafetyReportByUserI]);

  const handleCancelBtn = () => {
    setModalVisible(false);
    setIsEdit(false);
    setEditForm(null);
  };

  // Hàm tạo mới báo cáo (FormData)
  const createSafetyReport = async (form, setModal, resetForm) => {
    try {
      setIsLoading(true);
      const date = today.format('YYYY-MM-DD');
      const formData = new FormData();
      formData.append('user_id', USER_INFOR.id);
      formData.append(
        'title',
        form.title === t('other') ? form.customTitle : form.title,
      );
      formData.append('content', form.content);
      formData.append('solution', form.solution);
      formData.append('date', date);
      formData.append('department_id', USER_INFOR.department_id);
      if (form.media_path) {
        formData.append('media', {
          uri: form.media_path,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${CREATE}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (result.data.success) {
        setData(prev => [result.data.data, ...prev]);
        setModalVisible(false);
        setIsLoading(false);
        resetForm();
        // Hiển thị ModalMessage thành công
        showMessage('success', 'success', 1500);
      }
    } catch (error) {
      setModal({visible: true, type: 'error', message: t('unSuccess')});
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm cập nhật báo cáo
  const updateSafetyReport = async (form, setModal, resetForm) => {
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${UPDATE}`,
        {
          title: form.title === t('other') ? form.customTitle : form.title,
          content: form.content,
          user_id: USER_INFOR.id,
          id: idReportEdit,
          solution: form.solution,
          media: form.media_path,
        },
      );
      setIsLoading(true);
      if (result.data.success) {
        setModalVisible(false);
        setIsLoading(false);
        setData(reports => {
          return reports.map(report => {
            if (report.id === idReportEdit) {
              return {
                ...report,
                title:
                  form.title === t('other') ? form.customTitle : form.title,
                content: form.content,
                solution: form.solution,
                media: form.media_path,
              };
            }
            return report;
          });
        });
        setEditForm(null);
        setIdReportEdit('');
        setIsEdit(false);
        resetForm();
        // Hiển thị ModalMessage thành công khi cập nhật
        showMessage('success', 'success', 1500);
      }
    } catch (error) {
      setModal({visible: true, type: 'error', message: t('unSuccess')});
      setIsEdit(false);
    } finally {
      setIsLoading(false);
      setIsEdit(false);
    }
  };

  // Hàm submit quyết định gọi create hay update
  const handleSubmitReport = (form, setModal, resetForm) => {
    if (isEdit && idReportEdit) {
      updateSafetyReport(form, setModal, resetForm);
    } else {
      createSafetyReport(form, setModal, resetForm);
    }
  };

  const editReport = item => {
    setEditForm({
      title: item.title || '',
      content: item.content || '',
      solution: item.solution || '',
      customTitle:
        item.title !== t('danger', 'Nguy hiểm') &&
        item.title !== t('accident', 'Tai nạn đã xảy ra') &&
        item.title !== t('potential_danger', 'Khả năng nguy hiểm') &&
        item.title !== t('other', 'Khác')
          ? item.title
          : '',
    });
    setIdReportEdit(item.id);
    setModalVisible(true);
    setIsEdit(true);
  };

  // Sửa hàm deleteReport: chỉ set id và mở modal
  const deleteReport = id => {
    setDeleteId(id);
    setConfirmDeleteModal(true);
  };

  // Hàm thực hiện xóa thật sự
  const handleConfirmDelete = async () => {
    setConfirmDeleteModal(false);
    if (!deleteId) return;
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${DELETE}`,
        {id: deleteId},
      );
      if (result.data.success) {
        setData(prev => prev.filter(item => item.id !== deleteId));
        showMessage('success', 'success', 1500);
      }
    } catch (error) {
      showMessage('contactAdmin', 'warning', 1500);
    } finally {
      setDeleteId(null);
    }
  };

  const memoizedEditForm = useMemo(() => {
    // Nếu đang sửa thì trả về editForm, còn không thì trả về defaultForm
    return isEdit && editForm ? editForm : defaultForm;
  }, [isEdit, editForm]);

  const unconfirmedData = data.filter(item => !item.is_confirm);
  const confirmedData = data.filter(item => item.is_confirm);

  const getPendingCount = () => unconfirmedData.length;
  const getConfirmedCount = () => confirmedData.length;

  const renderStatus = item => {
    const color = item.is_confirm
      ? STATUS_COLORS.confirmed
      : STATUS_COLORS.pending;
    const text = item.is_confirm ? t('completed') : t('pending');
    return (
      <View
        style={[styles.leaveStatusContainer, {backgroundColor: color + '15'}]}>
        <View style={[styles.statusDot, {backgroundColor: color}]} />
        <Text style={[styles.leaveStatusText, {color}]}>{text}</Text>
      </View>
    );
  };

  const renderCard = ({item}) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveCardHeader}>
        <View style={styles.leaveCardDateContainer}>
          <IconFA name="calendar" size={16} color="#1976d2" />
          <Text style={styles.leaveCardDate}>
            {moment(item.date).format(
              i18n.language === 'ja' ? 'YYYY-MM-DD' : 'DD-MM-YYYY',
            )}
          </Text>
        </View>
        {!item.is_confirm && (
          <TouchableOpacity
            style={styles.menuBtnModern}
            onPress={() => setOpenMenuId(item.id)}>
            <IconFA name="ellipsis-h" size={18} color="#b0b3b8" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.leaveCardContent}>
        <View style={styles.leaveTypeContainer}>
          <IconFA name="file-text-o" size={14} color="#1976d2" />
          <Text style={styles.leaveTypeText}>{item.title}</Text>
        </View>
        {item.media_path ? (
          <Image source={{uri: item.media_path}} style={styles.cardImage} />
        ) : null}
        <View style={styles.leaveReasonContainer}>
          <IconFA name="commenting-o" size={14} color="#666" />
          <Text style={styles.leaveReasonText}>{item.content}</Text>
        </View>
        <View style={styles.leaveReasonContainer}>
          <IconFA name="lightbulb-o" size={14} color="#388e3c" />
          <Text style={[styles.leaveReasonText, {color: '#388e3c'}]}>
            {item.solution}
          </Text>
        </View>
        {item.corrective_action ? (
          <View style={styles.correctiveActionBox}>
            <View style={styles.leaveReasonContainer}>
              <IconFA name="wrench" size={14} color="#e67e22" />
              <Text
                style={[
                  styles.leaveReasonText,
                  {color: '#e67e22', fontStyle: 'italic'},
                ]}>
                {item.corrective_action}
              </Text>
            </View>
          </View>
        ) : null}
        {renderStatus(item)}
      </View>
      {openMenuId === item.id && !item.is_confirm && (
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
                editReport(item);
              }}>
              <IconFA name="edit" size={16} color="#1976d2" />
              <Text style={styles.menuTextModern}>{t('edit')}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItemModern}
              onPress={() => {
                setOpenMenuId(null);
                deleteReport(item.id);
              }}>
              <IconFA name="trash" size={16} color="#e74c3c" />
              <Text style={[styles.menuTextModern, {color: '#e74c3c'}]}>
                {t('delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  if (isLoading) {
    return <Loader visible={true} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header
          title={t('important.title', 'Báo cáo quan trọng')}
          onBack={() => navigation.goBack()}
        />
        {/* Tab Bar dạng Leave.js */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 0 && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(0)}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 0 && styles.activeTabButtonText,
              ]}>
              {t('pending', 'Chưa xác nhận')}
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === 0 && styles.activeTabBadge,
              ]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 0 && styles.activeTabBadgeText,
                ]}>
                {getPendingCount()}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 1 && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(1)}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 1 && styles.activeTabButtonText,
              ]}>
              {t('completed', 'Đã xác nhận')}
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === 1 && styles.activeTabBadge,
              ]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 1 && styles.activeTabBadgeText,
                ]}>
                {getConfirmedCount()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Danh sách card */}
        <FlatList
          data={activeTab === 0 ? unconfirmedData : confirmedData}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconFA name="calendar-o" size={48} color="#ddd" />
              <Text style={styles.emptyText}>{t('not.data')}</Text>
            </View>
          }
        />
        {/* Nút tạo báo cáo */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => {
            setEditForm(defaultForm);
            setIsEdit(false);
            setModalVisible(true);
          }}
          activeOpacity={0.85}>
          <IconFA name="plus" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Modal tạo/sửa báo cáo */}
        <BeautifulModal
          visible={modalVisible}
          onClose={handleCancelBtn}
          title={isEdit ? t('editReport') : t('safetyReport')}
          actions={[]}>
          <ReportForm
            onSubmit={handleSubmitReport}
            loading={isLoading}
            initialData={memoizedEditForm}
            t={t}
            onCancel={handleCancelBtn}
            isEdit={isEdit}
            {...(isEdit ? {editFields: ['title', 'content', 'solution']} : {})}
            onShowMessage={showMessage}
          />
          <Loader visible={isLoading} />
        </BeautifulModal>
        {/* ModalMessage */}
        <ModalMessage
          isVisible={isMessageModalVisible}
          onClose={() => {
            setMessageModalVisible(false);
          }}
          message={messageModal}
          type={messageType}
          t={t}
          duration={duration}
        />
        {/* BeautifulModal xác nhận xóa */}
        <BeautifulModal
          visible={confirmDeleteModal}
          onClose={() => setConfirmDeleteModal(false)}
          title={t('confirm_delete')}
          actions={[]}>
          <View style={{alignItems: 'center', paddingVertical: 12}}>
            <IconFA
              name="exclamation-triangle"
              size={48}
              color="#e67e22"
              style={{marginBottom: 12}}
            />

            <View
              style={{flexDirection: 'row', justifyContent: 'center', gap: 16}}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f1f3f6',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 28,
                  marginRight: 8,
                }}
                onPress={() => setConfirmDeleteModal(false)}>
                <Text
                  style={{color: '#1976d2', fontWeight: 'bold', fontSize: 16}}>
                  {t('cancel', 'Hủy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#e74c3c',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 28,
                }}
                onPress={handleConfirmDelete}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
                  {t('delete', 'Xóa')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BeautifulModal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Important;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    elevation: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: TEXT_COLOR,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
    color: TEXT_COLOR,
  },
  textArea: {
    height: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  createButton: {
    backgroundColor: '#28a745',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  imagePickerBtn: {
    backgroundColor: '#667eea',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  selectedImageText: {
    color: '#333',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: 200,
    alignSelf: 'center',
  },
  modalContentModern: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 16,
    marginTop: '30%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'stretch',
  },
  modalTitleModern: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputModern: {
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
  },
  textAreaModern: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePickerBtnModern: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 2,
  },
  imagePreviewWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  imagePreview: {
    width: 120,
    height: 80,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#f2f2f2',
  },
  selectedImageTextModern: {
    color: '#555',
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 180,
  },
  modalActionsModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  buttonModern: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  createButtonModern: {
    backgroundColor: '#28a745',
  },
  editButtonModern: {
    backgroundColor: '#FFD700',
  },
  cancelButtonModern: {
    backgroundColor: '#e2e8f0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonTextCancel: {
    color: '#667eea',
    fontWeight: '700',
    fontSize: 16,
  },
  modalContentModernGonGang: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 12,
    marginTop: '25%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    alignItems: 'stretch',
    maxHeight: '80%',
    justifyContent: 'space-between',
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  imagePreviewWrapperGonGang: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  imagePreviewGonGang: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    marginBottom: 2,
  },
  modalActionsModernGonGang: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 10,
  },
  // Thêm các style mới cho modal redesign
  modalOverlayRedesign: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 1,
  },
  modalCardRedesign: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
    alignItems: 'stretch',
    maxHeight: '85%',
    justifyContent: 'space-between',
  },
  modalTitleRedesign: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  formGroupRedesign: {
    marginBottom: 14,
  },
  inputLabelRedesign: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputRedesign: {
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
  },
  textAreaRedesign: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePickerBtnRedesign: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1FB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  imagePickerTextRedesign: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 6,
  },
  imagePreviewWrapperRedesign: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  imagePreviewRedesign: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    marginRight: 2,
  },
  removeImageBtnRedesign: {
    marginLeft: 2,
    padding: 2,
  },
  modalActionsRedesign: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  actionBtnRedesign: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  createBtnRedesign: {
    backgroundColor: '#28a745',
  },
  editBtnRedesign: {
    backgroundColor: '#FFD700',
  },
  cancelBtnRedesign: {
    backgroundColor: '#f1f3f6',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionBtnTextRedesign: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtnTextRedesign: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalScrollContentRedesign: {
    paddingBottom: 8,
  },
  modalCardRedesignModernized: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '92%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 20,
    alignItems: 'stretch',
    maxHeight: '88%',
    justifyContent: 'space-between',
  },
  modalTitleRedesignModernized: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 22,
    letterSpacing: 0.3,
  },
  formGroupRedesignModernized: {
    marginBottom: 18,
  },
  inputLabelRedesignModernized: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '700',
    marginBottom: 7,
    marginLeft: 2,
  },
  inputRedesignModernized: {
    backgroundColor: '#f7f7fa',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
    color: '#222',
    marginBottom: 2,
  },
  textAreaRedesignModernized: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  imagePickerBtnRedesignModernized: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1FB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    marginTop: 2,
  },
  imagePickerTextRedesignModernized: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },
  imagePreviewWrapperRedesignModernized: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    marginTop: 8,
  },
  imagePreviewRedesignModernized: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginRight: 8,
  },
  removeImageBtnRedesignModernized: {
    marginLeft: 2,
    padding: 4,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
  },
  modalActionsRedesignModernized: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 14,
  },
  actionBtnRedesignModernized: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  createBtnRedesignModernized: {
    backgroundColor: '#28a745',
  },
  editBtnRedesignModernized: {
    backgroundColor: '#FFD700',
  },
  cancelBtnRedesignModernized: {
    backgroundColor: '#f1f3f6',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  actionBtnTextRedesignModernized: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
  cancelBtnTextRedesignModernized: {
    color: '#007AFF',
    fontWeight: '800',
    fontSize: 17,
  },
  modalScrollContentRedesignModernized: {
    paddingBottom: 10,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#28a745',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  // Thêm style cho menuOverlayCustom, menuPopupCustom, menuItemCustom, menuTextCustom
  menuOverlayCustom: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  menuPopupCustom: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 5,
    padding: 5,
  },
  menuItemCustom: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  menuTextCustom: {
    fontSize: 16,
    color: '#333',
  },
  // Thêm style cho tab bar và indicator giống Uniform.js
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 54,
    position: 'relative',
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: TAB_WIDTH,
    backgroundColor: '#1976d2',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#1976d2',
    fontWeight: 'bold',
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
    backgroundColor: '#1976d2',
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
    color: '#1976d2',
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
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: '#f2f2f2',
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
  correctiveActionBox: {
    borderWidth: 1,
    borderColor: '#e67e22',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: '#fffaf3',
  },
});
