/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback} from 'react';
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
  Dimensions,
  Alert,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {useTheme} from '../hooks/useTheme';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  TAX_DEPENDENT,
  CREATE,
  UPDATE,
  DELETE,
  GET_ALL_BY_USER_ID,
} from '../utils/constans';
import ModalMessage from '../components/ModalMessage';

const {width} = Dimensions.get('window');

const Dependent = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode} = useTheme();
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const user_id = authData?.data?.data?.id;
  const token = authData?.data?.data?.token;

  const [dependents, setDependents] = useState([]);
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

  // Form states
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [gender, setGender] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaName, setMediaName] = useState('');

  // Relationship options
  const relationshipOptions = [
    {label: t('dependent.relationship_child', 'Con'), value: 'CHILD'},
    {label: t('dependent.relationship_spouse', 'Vợ/Chồng'), value: 'SPOUSE'},
    {label: t('dependent.relationship_parent', 'Bố/Mẹ'), value: 'PARENT'},
    {label: t('dependent.relationship_sibling', 'Anh/Chị/Em'), value: 'SIBLING'},
    {label: t('dependent.relationship_other', 'Khác'), value: 'OTHER'},
  ];

  // Gender options
  const genderOptions = [
    {label: t('dependent.gender_male', 'Nam'), value: 'MALE'},
    {label: t('dependent.gender_female', 'Nữ'), value: 'FEMALE'},
    {label: t('dependent.gender_other', 'Khác'), value: 'OTHER'},
  ];

  const showMessage = useCallback((msg, type) => {
    setModalMessage({
      visible: true,
      type: type || 'success',
      message: msg,
    });
  }, []);

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

  const getDependents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${TAX_DEPENDENT}${GET_ALL_BY_USER_ID}`,
        {user_id: user_id},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res?.data?.success) {
        setDependents(res.data.data || []);
      } else {
        setDependents([]);
      }
    } catch (error) {
      console.error('Error fetching dependents:', error);
      setDependents([]);
    } finally {
      setIsLoading(false);
    }
  }, [user_id, token]);

  useEffect(() => {
    getDependents();
  }, [getDependents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getDependents().then(() => setRefreshing(false));
  }, [getDependents]);

  const resetForm = () => {
    setName('');
    setRelationship('');
    setGender('');
    setDateOfBirth(new Date());
    setIdentificationNumber('');
    setPhone('');
    setAddress('');
    setTaxCode('');
    setDeductionAmount('');
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
    setName(item.name || '');
    setRelationship(item.relationship || '');
    setGender(item.gender || '');
    setDateOfBirth(item.dob ? new Date(item.dob) : new Date());
    setIdentificationNumber(item.identification_number || '');
    setPhone(item.phone || '');
    setAddress(item.address || '');
    setTaxCode(item.tax_code || '');
    setDeductionAmount(item.deduction_amount ? String(item.deduction_amount) : '');
    setNotes(item.notes || '');
    setMediaUri(item.media_path || null);
    setMediaName('');
    setIsEdit(true);
    setEditId(item.id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setRelationshipOpen(false);
    setGenderOpen(false);
    setModalVisible(false);
    resetForm();
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        showMessage(t('dependent.image_picker_error', 'Lỗi chọn ảnh'), 'error');
        return;
      } else {
        const asset = response.assets[0];
        const realUri = await getRealPathFromURI(asset.uri);
        setMediaUri(realUri);
        setMediaName(asset.fileName || 'document.jpg');
      }
    });
  };

  const validateForm = () => {
    if (!name.trim()) {
      showMessage(t('dependent.name_required', 'Vui lòng nhập tên'), 'error');
      return false;
    }
    if (!relationship) {
      showMessage(t('dependent.relationship_required', 'Vui lòng chọn mối quan hệ'), 'error');
      return false;
    }
    if (!gender) {
      showMessage(t('dependent.gender_required', 'Vui lòng chọn giới tính'), 'error');
      return false;
    }
    if (!address.trim()) {
      showMessage(t('dependent.address_required', 'Vui lòng nhập địa chỉ'), 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();

      // Required fields
      formData.append('user_id', user_id);
      formData.append('name', name.trim());
      formData.append('dob', moment(dateOfBirth).format('YYYY-MM-DD'));
      formData.append('gender', gender);
      formData.append('relationship', relationship);
      formData.append('address', address.trim());

      // Optional fields
      if (identificationNumber.trim()) {
        formData.append('identification_number', identificationNumber.trim());
      }
      if (phone.trim()) {
        formData.append('phone', phone.trim());
      }
      if (taxCode.trim()) {
        formData.append('tax_code', taxCode.trim());
      }
      if (deductionAmount.trim()) {
        formData.append('deduction_amount', parseFloat(deductionAmount) || 0);
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }
      if (mediaUri && !mediaUri.startsWith('http')) {
        // Only append if it's a new file (not a URL from server)
        formData.append('media', {
          uri: mediaUri,
          type: 'image/jpeg',
          name: mediaName || 'document.jpg',
        });
      }

      let res;
      if (isEdit) {
        formData.append('id', editId);
        res = await axios.put(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${TAX_DEPENDENT}${UPDATE}`,
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
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${TAX_DEPENDENT}${CREATE}`,
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
          isEdit
            ? t('dependent.update_success', 'Cập nhật thành công')
            : t('dependent.create_success', 'Thêm thành công'),
          'success',
        );
        closeModal();
        getDependents();
      } else {
        showMessage(
          res?.data?.message || t('dependent.save_error', 'Lưu thất bại'),
          'error',
        );
      }
    } catch (error) {
      console.error('Error saving dependent:', error);
      showMessage(t('dependent.save_error', 'Lưu thất bại'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = id => {
    Alert.alert(
      t('dependent.delete_title', 'Xóa người phụ thuộc'),
      t('dependent.delete_message', 'Bạn có chắc chắn muốn xóa người phụ thuộc này?'),
      [
        {
          text: t('cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('delete', 'Xóa'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await axios.post(
                `${BASE_URL}${PORT}${API}${VERSION}${V1}${TAX_DEPENDENT}${DELETE}`,
                {id: id},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              if (res?.data?.success) {
                showMessage(t('dependent.delete_success', 'Xóa thành công'), 'success');
                getDependents();
              } else {
                showMessage(t('dependent.delete_error', 'Xóa thất bại'), 'error');
              }
            } catch (error) {
              console.error('Error deleting dependent:', error);
              showMessage(t('dependent.delete_error', 'Xóa thất bại'), 'error');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = status => {
    switch (status) {
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
        return '#ef4444';
      case 'PENDING':
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'APPROVED':
        return t('dependent.status_approved', 'Đã duyệt');
      case 'REJECTED':
        return t('dependent.status_rejected', 'Từ chối');
      case 'PENDING':
      default:
        return t('dependent.status_pending', 'Chờ duyệt');
    }
  };

  const renderDependent = ({item}) => {
    const age = moment().diff(moment(item.dob), 'years');
    return (
      <View style={[styles.dependentCard, {backgroundColor: colors.surface}]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatarPlaceholder, {backgroundColor: colors.primary}]}>
              <Icon name="person" size={24} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.dependentName, {color: colors.text}]}>
                {item.name}
              </Text>
              <Text style={[styles.dependentRelationship, {color: colors.textSecondary}]}>
                {relationshipOptions.find(r => r.value === item.relationship)?.label || item.relationship}
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={[styles.actionButton, {backgroundColor: colors.primary + '20'}]}>
              <Icon name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={[styles.actionButton, {backgroundColor: '#FF6B6B20'}]}>
              <Icon name="trash" size={18} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {backgroundColor: getStatusColor(item.status || 'PENDING')},
              ]}
            />
            <Text style={[styles.statusText, {color: getStatusColor(item.status || 'PENDING')}]}>
              {getStatusText(item.status || 'PENDING')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
              {t('dependent.date_of_birth', 'Ngày sinh')}:{' '}
            </Text>
            <Text style={[styles.infoValue, {color: colors.text}]}>
              {item.dob ? moment(item.dob).format('DD/MM/YYYY') : '---'}{' '}
              {age >= 0 && `(${age} ${t('dependent.years_old', 'tuổi')})`}
            </Text>
          </View>
          {item.gender && (
            <View style={styles.infoRow}>
              <Icon name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                {t('dependent.gender', 'Giới tính')}:{' '}
              </Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>
                {genderOptions.find(g => g.value === item.gender)?.label || item.gender}
              </Text>
            </View>
          )}
          {item.identification_number && (
            <View style={styles.infoRow}>
              <Icon name="card-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                {t('dependent.id_number', 'CMND/CCCD')}:{' '}
              </Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>
                {item.identification_number}
              </Text>
            </View>
          )}
          {item.phone && (
            <View style={styles.infoRow}>
              <Icon name="call-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                {t('dependent.phone', 'Số điện thoại')}:{' '}
              </Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>
                {item.phone}
              </Text>
            </View>
          )}
          {item.address && (
            <View style={styles.infoRow}>
              <Icon name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                {t('dependent.address', 'Địa chỉ')}:{' '}
              </Text>
              <Text style={[styles.infoValue, {color: colors.text}]} numberOfLines={2}>
                {item.address}
              </Text>
            </View>
          )}
          {item.deduction_amount && (
            <View style={styles.infoRow}>
              <Icon name="cash-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                {t('dependent.deduction_amount', 'Mức giảm trừ')}:{' '}
              </Text>
              <Text style={[styles.infoValue, {color: colors.text}]}>
                {Number(item.deduction_amount).toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          )}
        </View>
        {item.media_path && (
          <TouchableOpacity
            style={styles.mediaContainer}
            onPress={() => {
              // Could open image viewer here
            }}>
            <Image source={{uri: item.media_path}} style={styles.mediaImage} />
            {/* <Icon name="document-attach-outline" size={16} color={colors.primary} />
            <Text style={[styles.mediaText, {color: colors.primary}]}>
              {t('dependent.has_document', 'Có giấy tờ đính kèm')}
            </Text> */}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const styles = createStyles(colors, isDarkMode);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('dependent.title', 'Người phụ thuộc')}
          </Text>
          <TouchableOpacity
            onPress={openAddModal}
            style={styles.addButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : dependents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={80} color={colors.textTertiary} />
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
            {t('dependent.no_dependents', 'Chưa có người phụ thuộc')}
          </Text>
          <Text style={[styles.emptySubText, {color: colors.textTertiary}]}>
            {t('dependent.add_first', 'Nhấn nút + để thêm người phụ thuộc')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={dependents}
          renderItem={renderDependent}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {isEdit
                  ? t('dependent.edit', 'Sửa người phụ thuộc')
                  : t('dependent.add', 'Thêm người phụ thuộc')}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              scrollEnabled={!relationshipOpen && !genderOpen}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.name', 'Tên')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('dependent.name_placeholder', 'Nhập tên')}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={[styles.formGroup, {zIndex: relationshipOpen ? 10000 : 1}]}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.relationship', 'Mối quan hệ')} <Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  open={relationshipOpen}
                  value={relationship}
                  items={relationshipOptions}
                  setOpen={(open) => {
                    setRelationshipOpen(open);
                    if (open) {
                      setGenderOpen(false);
                    }
                  }}
                  setValue={setRelationship}
                  placeholder={t('dependent.relationship_placeholder', 'Chọn mối quan hệ')}
                  placeholderStyle={{color: colors.textTertiary}}
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: colors.background,
                      borderColor: relationshipOpen ? colors.primary : colors.border,
                    },
                  ]}
                  textStyle={{color: colors.text, fontSize: 16}}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderWidth: 2,
                    borderColor: colors.primary,
                    borderRadius: 12,
                    marginTop: 4,
                    marginBottom: 4,
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 6},
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 25,
                    maxHeight: 250,
                  }}
                  selectedItemLabelStyle={{
                    color: colors.primary,
                    fontWeight: '700',
                  }}
                  listItemLabelStyle={{
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                  itemSeparatorStyle={{
                    backgroundColor: colors.border,
                    height: 1,
                    marginHorizontal: 12,
                  }}
                  arrowIconStyle={{tintColor: colors.textSecondary}}
                  tickIconStyle={{tintColor: colors.primary}}
                  zIndex={10000}
                  zIndexInverse={1000}
                  maxHeight={200}
                  autoScroll
                  listMode="FLATLIST"
                  bottomOffset={100}
                  flatListProps={{
                    style: {
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    },
                    contentContainerStyle: {
                      paddingVertical: 4,
                    },
                  }}
                  onClose={() => setRelationshipOpen(false)}
                />
              </View>

              <View style={[styles.formGroup, {zIndex: genderOpen ? 10000 : 1}]}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.gender', 'Giới tính')} <Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  open={genderOpen}
                  value={gender}
                  items={genderOptions}
                  setOpen={(open) => {
                    setGenderOpen(open);
                    if (open) {
                      setRelationshipOpen(false);
                    }
                  }}
                  setValue={setGender}
                  placeholder={t('dependent.gender_placeholder', 'Chọn giới tính')}
                  placeholderStyle={{color: colors.textTertiary}}
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: colors.background,
                      borderColor: genderOpen ? colors.primary : colors.border,
                    },
                  ]}
                  textStyle={{color: colors.text, fontSize: 16}}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderWidth: 2,
                    borderColor: colors.primary,
                    borderRadius: 12,
                    marginTop: 1,
                    marginBottom: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 6},
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 25,
                    maxHeight: 250,
                  }}
                  selectedItemLabelStyle={{
                    color: colors.primary,
                    fontWeight: '700',
                  }}
                  listItemLabelStyle={{
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                  }}
                  itemSeparatorStyle={{
                    backgroundColor: colors.border,
                    height: 1,
                    marginHorizontal: 12,
                  }}
                  arrowIconStyle={{tintColor: colors.textSecondary}}
                  tickIconStyle={{tintColor: colors.primary}}
                  zIndex={10000}
                  zIndexInverse={2000}
                  maxHeight={250}
                  autoScroll
                  listMode="FLATLIST"
                  flatListProps={{
                    style: {
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    },
                    contentContainerStyle: {
                      paddingVertical: 4,
                    },
                  }}
                  onClose={() => setGenderOpen(false)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.date_of_birth', 'Ngày sinh')} <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setDatePickerVisible(true)}
                  style={[styles.dateButton, {backgroundColor: colors.background}]}>
                  <Text style={[styles.dateText, {color: colors.text}]}>
                    {moment(dateOfBirth).format('DD/MM/YYYY')}
                  </Text>
                  <Icon name="calendar-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.id_number', 'CMND/CCCD')}
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                  value={identificationNumber}
                  onChangeText={setIdentificationNumber}
                  placeholder={t('dependent.id_number_placeholder', 'Nhập số CMND/CCCD')}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.phone', 'Số điện thoại')}
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('dependent.phone_placeholder', 'Nhập số điện thoại')}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.address', 'Địa chỉ')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {backgroundColor: colors.background, color: colors.text},
                  ]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('dependent.address_placeholder', 'Nhập địa chỉ')}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.tax_code', 'Mã số thuế')}
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                  value={taxCode}
                  onChangeText={setTaxCode}
                  placeholder={t('dependent.tax_code_placeholder', 'Nhập mã số thuế')}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.deduction_amount', 'Mức giảm trừ')}
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                  value={deductionAmount}
                  onChangeText={setDeductionAmount}
                  placeholder={t('dependent.deduction_amount_placeholder', 'Nhập mức giảm trừ (VNĐ)')}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.notes', 'Ghi chú')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {backgroundColor: colors.background, color: colors.text},
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('dependent.notes_placeholder', 'Nhập ghi chú (nếu có)')}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: colors.text}]}>
                  {t('dependent.document', 'Giấy tờ chứng minh')}
                </Text>
                <TouchableOpacity
                  onPress={handleImagePicker}
                  style={[styles.imagePickerButton, {backgroundColor: colors.background, borderColor: colors.border}]}>
                  {mediaUri ? (
                    <View style={styles.imagePreview}>
                      <Image
                        source={{uri: mediaUri.startsWith('http') ? mediaUri : `file://${mediaUri}`}}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <Icon name="checkmark-circle" size={24} color="#10b981" />
                        <Text style={[styles.imageText, {color: '#10b981'}]}>
                          {t('dependent.image_selected', 'Đã chọn ảnh')}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.imagePickerContent}>
                      <Icon name="camera-outline" size={24} color={colors.primary} />
                      <Text style={[styles.imagePickerText, {color: colors.primary}]}>
                        {t('dependent.select_document', 'Chọn giấy tờ chứng minh')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={closeModal}
                style={[styles.cancelButton, {borderColor: colors.border}]}>
                <Text style={[styles.cancelButtonText, {color: colors.textSecondary}]}>
                  {t('cancel', 'Hủy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isLoading}
                style={styles.saveButton}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.saveButtonGradient}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {t('Save', 'Lưu')}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      <DatePicker
        modal
        open={datePickerVisible}
        date={dateOfBirth}
        mode="date"
        maximumDate={new Date()}
        onConfirm={date => {
          setDateOfBirth(date);
          setDatePickerVisible(false);
        }}
        onCancel={() => {
          setDatePickerVisible(false);
        }}
      />

      {/* Message Modal */}
      <ModalMessage
        visible={modalMessage.visible}
        type={modalMessage.type}
        message={modalMessage.message}
        onClose={() => setModalMessage({...modalMessage, visible: false})}
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
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      letterSpacing: 0.3,
      flex: 1,
      textAlign: 'center',
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
    listContent: {
      padding: 16,
      paddingBottom: 20,
    },
    dependentCard: {
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
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    cardInfo: {
      flex: 1,
    },
    dependentName: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    dependentRelationship: {
      fontSize: 14,
      fontWeight: '500',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBody: {
      padding: 16,
      paddingTop: 12,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignSelf: 'flex-start',
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
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      marginLeft: 8,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    mediaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    mediaText: {
      fontSize: 13,
      fontWeight: '500',
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
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
      paddingBottom: 20,
      maxHeight: 450,
    },
    formGroup: {
      marginBottom: 16,
      zIndex: 1,
      position: 'relative',
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
    dropdown: {
      borderWidth: 1.5,
      borderRadius: 12,
      minHeight: 52,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    dateButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    dateText: {
      fontSize: 16,
    },
    imagePickerButton: {
      borderWidth: 1,
      borderRadius: 12,
      overflow: 'hidden',
      minHeight: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePickerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    imagePickerText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
    imagePreview: {
      width: '100%',
      height: 200,
      position: 'relative',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageText: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 8,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      zIndex: 10001,
      elevation: 10001,
      backgroundColor: colors.surface,
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
    mediaImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
      resizeMode: 'cover',
      backgroundColor: '#f1f5f9',
      alignSelf: 'center',
      marginRight: 8,
    },
  });

export default Dependent;
