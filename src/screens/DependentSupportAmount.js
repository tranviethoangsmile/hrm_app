/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {useTheme} from '../hooks/useTheme';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  DEPENDENT_SUPPORT_AMOUNT,
  CREATE,
  UPDATE,
  DELETE,
  CONFIRM,
  GET_BY_TAX_DEPENDENT_ID_AND_YEAR,
} from '../utils/constans';
import ModalMessage from '../components/ModalMessage';

const DependentSupportAmount = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {colors, isDarkMode} = useTheme();
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const user_id = authData?.data?.data?.id;
  const token = authData?.data?.data?.token;
  const isAdmin = authData?.data?.data?.role === 'ADMIN';

  const dependent = route.params?.dependent || null;

  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalMessage, setModalMessage] = useState({
    visible: false,
    type: 'info',
    message: '',
  });

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [supportedAmount, setSupportedAmount] = useState('');
  const [isSupportingCurrentYear, setIsSupportingCurrentYear] = useState(true);
  const [expectedSupportYears, setExpectedSupportYears] = useState('');
  const [notes, setNotes] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaName, setMediaName] = useState('');

  const showMessage = useCallback((msg, type) => {
    setModalMessage({
      visible: true,
      type: type || 'success',
      message: msg,
    });
  }, []);

  const getList = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentYear = new Date().getFullYear();
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DEPENDENT_SUPPORT_AMOUNT}${GET_BY_TAX_DEPENDENT_ID_AND_YEAR}`,
        {
          tax_dependent_id: dependent.id,
          year: currentYear,
        },
      );
      if (res?.data?.success) {
        setList(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setList([]);
      }
    } catch (error) {
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [dependent?.id]);

  useEffect(() => {
    if (dependent?.id) {
      getList();
    }
  }, [dependent?.id, getList]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getList().then(() => setRefreshing(false));
  }, [getList]);

  const resetForm = () => {
    setYear(String(new Date().getFullYear()));
    setSupportedAmount('');
    setIsSupportingCurrentYear(true);
    setExpectedSupportYears('');
    setNotes('');
    setMediaUri(null);
    setMediaName('');
    setIsEdit(false);
    setEditId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = item => {
    setEditId(item.id);
    setYear(String(item.year || new Date().getFullYear()));
    setSupportedAmount(item.supported_amount != null ? String(item.supported_amount) : '');
    setIsSupportingCurrentYear(item.is_supporting_current_year !== false);
    setExpectedSupportYears(item.expected_support_years != null ? String(item.expected_support_years) : '');
    setNotes(item.notes || '');
    setMediaUri(item.media_path || null);
    setMediaName('');
    setIsEdit(true);
    setModalVisible(true);
  };

  const getRealPathFromURI = async uri => {
    if (Platform.OS === 'android') {
      try {
        const fileStat = await RNFS.stat(uri);
        return fileStat.path;
      } catch (e) {
        return uri;
      }
    }
    return uri;
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    };
    launchImageLibrary(options, async response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        showMessage(t('dependentSupportAmount.image_picker_error', 'Lỗi chọn ảnh'), 'error');
        return;
      }
      const asset = response.assets[0];
      const realUri = await getRealPathFromURI(asset.uri);
      setMediaUri(realUri);
      setMediaName(asset.fileName || 'document.jpg');
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const validateForm = () => {
    const y = parseInt(year, 10);
    if (!year.trim() || isNaN(y) || y < 2000 || y > 2200) {
      showMessage(t('dependentSupportAmount.year_invalid', 'Năm không hợp lệ'), 'error');
      return false;
    }
    if (supportedAmount.trim() && (isNaN(parseFloat(supportedAmount)) || parseFloat(supportedAmount) < 0)) {
      showMessage(t('dependentSupportAmount.amount_invalid', 'Số tiền không hợp lệ'), 'error');
      return false;
    }
    const expYears = expectedSupportYears.trim() ? parseInt(expectedSupportYears, 10) : null;
    if (expYears != null && (isNaN(expYears) || expYears < 0)) {
      showMessage(t('dependentSupportAmount.expected_years_invalid', 'Số năm dự kiến không hợp lệ'), 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (isEdit) {
      if (!editId) {
        showMessage(t('dependentSupportAmount.missing_data', 'Thiếu thông tin'), 'error');
        return;
      }
    } else {
      if (!dependent?.id) {
        showMessage(t('dependentSupportAmount.missing_data', 'Thiếu thông tin'), 'error');
        return;
      }
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      if (isEdit) {
        formData.append('id', editId);
        formData.append('user_id', user_id);
      } else {
        formData.append('tax_dependent_id', dependent.id);
        formData.append('user_id', user_id);
        formData.append('year', parseInt(year, 10));
      }
      if (supportedAmount.trim()) {
        formData.append('supported_amount', parseFloat(supportedAmount));
      }
      formData.append('is_supporting_current_year', isSupportingCurrentYear);
      if (expectedSupportYears.trim()) {
        const expYears = parseInt(expectedSupportYears, 10);
        if (!isNaN(expYears) && expYears >= 0) {
          formData.append('expected_support_years', expYears);
        }
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }
      if (mediaUri && !mediaUri.startsWith('http')) {
        formData.append('media', {
          uri: mediaUri,
          type: 'image/jpeg',
          name: mediaName || 'document.jpg',
        });
      }

      let res;
      if (isEdit) {
        res = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${DEPENDENT_SUPPORT_AMOUNT}${UPDATE}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        res = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${DEPENDENT_SUPPORT_AMOUNT}${CREATE}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      if (res?.data?.success) {
        showMessage(
          isEdit ? t('dependentSupportAmount.update_success', 'Cập nhật thành công') : t('dependentSupportAmount.create_success', 'Thêm thành công'),
          'success',
        );
        closeModal();
        getList();
      } else {
        showMessage(
          res?.data?.message || (isEdit ? t('dependentSupportAmount.update_error', 'Cập nhật thất bại') : t('dependentSupportAmount.create_error', 'Thêm thất bại')),
          'error',
        );
      }
    } catch (error) {
      showMessage(isEdit ? t('dependentSupportAmount.update_error', 'Cập nhật thất bại') : t('dependentSupportAmount.create_error', 'Thêm thất bại'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = id => {
    Alert.alert(
      t('dependentSupportAmount.delete_title', 'Xóa bản ghi'),
      t('dependentSupportAmount.delete_message', 'Bạn có chắc muốn xóa bản ghi số tiền hỗ trợ này?'),
      [
        {text: t('cancel', 'Hủy'), style: 'cancel'},
        {
          text: t('delete', 'Xóa'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await axios.post(
                `${BASE_URL}${PORT}${API}${VERSION}${V1}${DEPENDENT_SUPPORT_AMOUNT}${DELETE}`,
                {id, user_id},
                {headers: {Authorization: `Bearer ${token}`}},
              );
              if (res?.data?.success) {
                showMessage(t('dependentSupportAmount.delete_success', 'Xóa thành công'), 'success');
                setList(prev => prev.filter(x => x.id !== id));
              } else {
                showMessage(res?.data?.message || t('dependentSupportAmount.delete_error', 'Xóa thất bại'), 'error');
              }
            } catch (err) {
              showMessage(t('dependentSupportAmount.delete_error', 'Xóa thất bại'), 'error');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleConfirm = id => {
    Alert.alert(
      t('dependentSupportAmount.confirm_title', 'Xác nhận'),
      t('dependentSupportAmount.confirm_message', 'Xác nhận bản ghi số tiền nuôi người phụ thuộc?'),
      [
        {text: t('cancel', 'Hủy'), style: 'cancel'},
        {
          text: t('confirm', 'Xác nhận'),
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await axios.post(
                `${BASE_URL}${PORT}${API}${VERSION}${V1}${DEPENDENT_SUPPORT_AMOUNT}${CONFIRM}`,
                {id},
                {headers: {Authorization: `Bearer ${token}`}},
              );
              if (res?.data?.success) {
                showMessage(t('dependentSupportAmount.confirm_success', 'Xác nhận thành công'), 'success');
                getList();
              } else {
                showMessage(res?.data?.message || t('dependentSupportAmount.confirm_error', 'Xác nhận thất bại'), 'error');
              }
            } catch (err) {
              showMessage(t('dependentSupportAmount.confirm_error', 'Xác nhận thất bại'), 'error');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}) => (
    <View style={[styles.card, {backgroundColor: colors.surface}]}>
      <View style={styles.cardHeader}>
        <View style={[styles.yearBadge, {backgroundColor: colors.primary + '25'}]}>
          <Icon name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.yearText, {color: colors.primary}]}>{item.year}</Text>
        </View>
        <View style={styles.cardActions}>
          {!item.is_confirm && (
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={[styles.actionBtn, {backgroundColor: colors.primary + '20'}]}>
              <Icon name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[styles.actionBtn, {backgroundColor: '#FF6B6B20'}]}>
            <Icon name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
          {isAdmin && !item.is_confirm && (
            <TouchableOpacity
              onPress={() => handleConfirm(item.id)}
              style={[styles.actionBtn, {backgroundColor: '#10b98120'}]}>
              <Icon name="checkmark-circle" size={18} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.cardBody}>
        {item.supported_amount != null && (
          <View style={styles.infoRow}>
            <Icon name="cash-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
              {t('dependentSupportAmount.supported_amount', 'Số tiền hỗ trợ')}:
            </Text>
            <Text style={[styles.infoValue, {color: colors.text}]}>
              {Number(item.supported_amount).toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Icon name="today-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
            {t('dependentSupportAmount.supporting_current_year', 'Đang nuôi trong năm')}:
          </Text>
          <Text style={[styles.infoValue, {color: colors.text}]}>
            {item.is_supporting_current_year ? t('common.yes', 'Có') : t('common.no', 'Không')}
          </Text>
        </View>
        {item.expected_support_years != null && (
          <View style={styles.infoRow}>
            <Icon name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
              {t('dependentSupportAmount.expected_years', 'Số năm dự kiến')}: {item.expected_support_years}
            </Text>
          </View>
        )}
        {item.notes ? (
          <View style={styles.infoRow}>
            <Icon name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoValue, {color: colors.text}]} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        ) : null}
        {item.media_path ? (
          <View style={styles.infoRow}>
            <Icon name="document-attach-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>
              {t('dependentSupportAmount.document', 'Chứng từ')}:
            </Text>
            <Text style={[styles.infoValue, {color: colors.primary}]} numberOfLines={1}>
              {t('dependentSupportAmount.has_document', 'Có file đính kèm')}
            </Text>
          </View>
        ) : null}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: item.is_confirm ? '#10b981' : '#f59e0b'},
            ]}
          />
          <Text style={[styles.statusText, {color: item.is_confirm ? '#10b981' : '#f59e0b'}]}>
            {item.is_confirm ? t('dependentSupportAmount.confirmed', 'Đã xác nhận') : t('dependentSupportAmount.pending', 'Chờ xác nhận')}
          </Text>
        </View>
      </View>
    </View>
  );

  const styles = createStyles(colors, isDarkMode);

  if (!dependent?.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
          {t('dependentSupportAmount.no_dependent', 'Không có thông tin người phụ thuộc')}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backLink, {borderColor: colors.primary}]}>
          <Text style={[styles.backLinkText, {color: colors.primary}]}>{t('common.back', 'Quay lại')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t('dependentSupportAmount.title', 'Số tiền hỗ trợ')}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {dependent.name}
            </Text>
          </View>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="wallet-outline" size={80} color={colors.textTertiary} />
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
            {t('dependentSupportAmount.no_records', 'Chưa có thông tin số tiền hỗ trợ')}
          </Text>
          <Text style={[styles.emptySubText, {color: colors.textTertiary}]}>
            {t('dependentSupportAmount.add_first_hint', 'Nhấn nút + ở góc phải trên để tạo bản ghi mới')}
          </Text>
          <TouchableOpacity
            onPress={openAddModal}
            style={[styles.emptyAddButton, {backgroundColor: colors.primary}]}
            activeOpacity={0.8}>
            <Icon name="add" size={22} color="#fff" />
            <Text style={styles.emptyAddButtonText}>
              {t('dependentSupportAmount.add', 'Thêm bản ghi')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKeyboard}>
            <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {isEdit ? t('dependentSupportAmount.edit', 'Sửa bản ghi') : t('dependentSupportAmount.add', 'Thêm bản ghi')}
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {!isEdit && (
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, {color: colors.text}]}>
                      {t('dependentSupportAmount.year', 'Năm')} <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                      value={year}
                      onChangeText={setYear}
                      placeholder="2024"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  </View>
                )}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, {color: colors.text}]}>
                    {t('dependentSupportAmount.supported_amount', 'Số tiền hỗ trợ (VNĐ)')}
                  </Text>
                  <TextInput
                    style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                    value={supportedAmount}
                    onChangeText={setSupportedAmount}
                    placeholder="4400000"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.formGroup}>
                  <TouchableOpacity
                    onPress={() => setIsSupportingCurrentYear(!isSupportingCurrentYear)}
                    style={[styles.switchRow, {backgroundColor: colors.background}]}>
                    <Text style={[styles.label, {color: colors.text, marginBottom: 0}]}>
                      {t('dependentSupportAmount.supporting_current_year', 'Đang nuôi trong năm hiện tại')}
                    </Text>
                    <View style={[styles.checkbox, isSupportingCurrentYear && styles.checkboxChecked]}>
                      {isSupportingCurrentYear && <Icon name="checkmark" size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, {color: colors.text}]}>
                    {t('dependentSupportAmount.expected_support_years', 'Số năm dự kiến nuôi')}
                  </Text>
                  <TextInput
                    style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                    value={expectedSupportYears}
                    onChangeText={setExpectedSupportYears}
                    placeholder="5"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, {color: colors.text}]}>{t('dependentSupportAmount.notes', 'Ghi chú')}</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, {backgroundColor: colors.background, color: colors.text}]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={t('dependentSupportAmount.notes_placeholder', 'Nhập ghi chú')}
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, {color: colors.text}]}>
                    {t('dependentSupportAmount.document', 'File chứng từ')}
                  </Text>
                  <TouchableOpacity
                    onPress={handleImagePicker}
                    style={[styles.mediaButton, {backgroundColor: colors.background, borderColor: colors.border}]}>
                    {mediaUri ? (
                      <View style={styles.mediaPreviewRow}>
                        {mediaUri.startsWith('http') ? (
                          <Image source={{uri: mediaUri}} style={styles.mediaThumb} />
                        ) : null}
                        <Icon name="document-attach" size={24} color={colors.primary} />
                        <Text style={[styles.mediaLabel, {color: colors.primary}]}>
                          {mediaUri.startsWith('http') ? t('dependentSupportAmount.has_document', 'Có file đính kèm') : mediaName || t('dependentSupportAmount.image_selected', 'Đã chọn ảnh')}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.mediaPreviewRow}>
                        <Icon name="add-circle-outline" size={24} color={colors.textSecondary} />
                        <Text style={[styles.mediaLabel, {color: colors.textSecondary}]}>
                          {t('dependentSupportAmount.select_document', 'Chọn file chứng từ (tùy chọn)')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
              <View style={[styles.modalFooter, {borderTopColor: colors.border, backgroundColor: colors.surface}]}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={[styles.cancelButton, {borderColor: colors.border}]}>
                  <Text style={[styles.cancelButtonText, {color: colors.text}]}>{t('cancel', 'Hủy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton} activeOpacity={0.8} disabled={isLoading}>
                  <LinearGradient colors={['#667eea', '#764ba2']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.saveButtonGradient}>
                    <Text style={styles.saveButtonText}>{isEdit ? t('common.save', 'Lưu') : t('dependentSupportAmount.add', 'Thêm')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ModalMessage
        isVisible={modalMessage.visible}
        type={modalMessage.type}
        message={modalMessage.message}
        onClose={() => setModalMessage({...modalMessage, visible: false})}
        t={t}
      />
    </View>
  );
};

const createStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    headerGradient: {
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
      paddingBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 5,
    },
    backButton: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitleWrap: {
      flex: 1,
      marginHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      letterSpacing: 0.3,
    },
    headerSubtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.9)',
      marginTop: 2,
    },
    addButton: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubText: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    emptyAddButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 24,
      gap: 8,
    },
    emptyAddButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    backLink: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderRadius: 12,
    },
    backLinkText: {
      fontSize: 16,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
      paddingBottom: 20,
    },
    card: {
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    yearBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      gap: 6,
    },
    yearText: {
      fontSize: 16,
      fontWeight: '700',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBody: {
      padding: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      marginLeft: 8,
      flex: 0,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
      marginLeft: 4,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalKeyboard: {
      maxHeight: '90%',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      padding: 16,
      maxHeight: 400,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    required: {
      color: '#FF6B6B',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    mediaButton: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      minHeight: 52,
      justifyContent: 'center',
    },
    mediaPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    mediaThumb: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    mediaLabel: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
    },
    cancelButton: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    saveButton: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    saveButtonGradient: {
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default DependentSupportAmount;
