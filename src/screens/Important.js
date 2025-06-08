import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
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
import {ModalMessage} from '../components';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';

const Important = ({route}) => {
  const {t} = useTranslation();
  const {USER_INFOR} = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newReport, setNewReport] = useState({title: '', content: ''});
  const [isEdit, setIsEdit] = useState(false);
  const [longPressedItem, setLongPressedItem] = useState(null);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [idReportEdit, setIdReportEdit] = useState('');
  const today = moment();
  const navigation = useNavigation();

  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };
  const getAllSafetyReportByUserI = async userID => {
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${GET_ALL_BY_USER_ID}`,
        {id: userID},
      );
      setData(result.data.data || []);
    } catch (error) {
      showMessage('contactAdmin', 'error', 1000);
    } finally {
      setLoading(false);
    }
  };

  const createSafetyReport = async () => {
    if (newReport.title && newReport.content) {
      try {
        const result = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${CREATE}`,
          {
            title: newReport.title,
            content: newReport.content,
            user_id: USER_INFOR.id,
            date: today.format('YYYY-MM-DD'),
            department_id: USER_INFOR.department_id,
          },
        );
        setLoading(true);
        if (result.data.success) {
          setData(prev => [result.data.data, ...prev]);
          setModalVisible(false);
          setNewReport({title: '', content: ''});
          setLoading(false);
        }
      } catch (error) {
        showMessage('unSuccess', 'error', 1000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveAfterEditReport = async () => {
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${UPDATE}`,
        {
          title: newReport.title,
          content: newReport.content,
          user_id: USER_INFOR.id,
          id: idReportEdit,
        },
      );
      setLoading(true);
      if (result.data.success) {
        setModalVisible(false);
        setLoading(false);
        setData(reports => {
          return reports.map(report => {
            if (report.id === idReportEdit) {
              return {
                ...report,
                title: newReport.title,
                content: newReport.content,
              };
            }
            return report;
          });
        });
        setNewReport({title: '', content: ''});
        setIdReportEdit('');
        setIsEdit(false);
      }
    } catch (error) {
      showMessage('unSuccess', 'error', 1000);
      setIsEdit(false);
    } finally {
      setLoading(false);
      setIsEdit(false);
    }
  };

  const deleteReport = async id => {
    Alert.alert(t('plzcof'), t('wantDelete'), [
      {
        text: t('c'),
        style: 'cancel',
      },
      {
        text: t('dl'),
        onPress: async () => {
          try {
            const result = await axios.post(
              `${BASE_URL}${PORT}${API}${VERSION}${V1}${SAFETY_REPORT}${DELETE}`,
              {
                id: id,
              },
            );
            if (result.data.success) {
              setData(prev => prev.filter(item => item.id !== id));
              showMessage('success', 'success', 1000);
            }
          } catch (error) {
            showMessage('contactAdmin', 'warning', 1000);
          }
        },
      },
    ]);
  };

  const handleCancelBtn = () => {
    setModalVisible(false);
    setNewReport({title: '', content: ''});
  };

  const editReport = item => {
    setNewReport({title: item.title, content: item.content});
    setIdReportEdit(item.id);
    setModalVisible(true);
    setIsEdit(true);
  };

  const handleLongPress = item => {
    setLongPressedItem(item);
  };

  const handleCloseOptions = () => {
    setLongPressedItem(null);
  };

  const handleOptionPress = action => {
    if (action === 'edit') {
      editReport(longPressedItem);
    } else if (action === 'delete') {
      deleteReport(longPressedItem.id);
    }
    handleCloseOptions(); // Close options after action
  };

  useEffect(() => {
    getAllSafetyReportByUserI(USER_INFOR.id);
  }, []);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setLongPressedItem(null);
      }}
      onLongPress={() => handleLongPress(item)}
      activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.meta}>
          {t('D')}: {item.created_at}
        </Text>
        <Text
          style={[
            styles.meta,
            {color: item.is_confirm ? '#28a745' : '#dc3545'},
          ]}>
          {item.is_confirm ? t('completed') : t('pending')}
        </Text>
      </View>

      {/* Footer: Hiển thị các nút Sửa và Xóa nếu nhấn giữ */}
      {longPressedItem === item && !item.is_confirm && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => handleOptionPress('edit')}>
            <Text style={styles.buttonText}>{t('EDIT')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleOptionPress('delete')}>
            <Text style={styles.buttonText}>{t('DELETE')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title={t('important.title', 'Báo cáo quan trọng')}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('not.data')}</Text>
          </View>
        }
      />

      {/* Nút tạo báo cáo */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Modal tạo báo cáo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {newReport.title && isEdit ? t('editReport') : t('safetyReport')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('til')}
            placeholderTextColor={TEXT_COLOR}
            value={newReport.title}
            onChangeText={text =>
              setNewReport(prev => ({...prev, title: text}))
            }
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('enter_note')}
            placeholderTextColor={TEXT_COLOR}
            value={newReport.content}
            onChangeText={text =>
              setNewReport(prev => ({...prev, content: text}))
            }
            multiline
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelBtn}>
              <Text style={styles.buttonText}>{t('c')}</Text>
            </TouchableOpacity>
            {newReport.title && isEdit ? (
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleSaveAfterEditReport}>
                <Text style={styles.buttonText}>{t('Save')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={createSafetyReport}>
                <Text style={styles.buttonText}>{t('create')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={messageModal}
        type={messageType}
        t={t}
        duration={duration}
      />
    </SafeAreaView>
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    padding: 15,
    marginHorizontal: 10,
    overflow: 'hidden', // Đảm bảo không có phần nào tràn ra ngoài
  },
  cardContent: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  content: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  meta: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#FFD700',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    padding: 15,
    elevation: 5,
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
  editButton: {
    backgroundColor: '#dfa745',
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
});
