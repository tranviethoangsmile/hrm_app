import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import moment from 'moment';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  CHECKIN,
  CREATE,
} from '../utils/constans';
import {useNavigation} from '@react-navigation/native';
import ModalMessage from './ModalMessage';

const ConfirmDayOrNight = ({visible, closeModal, checkin, time, t}) => {
  const navigate = useNavigation();
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [showNightShiftModal, setShowNightShiftModal] = useState(false);

  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };

  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const handleCheckinWithQrCode = async (shift, action) => {
    let date_check;

    if (shift === 'DAY') {
      date_check = checkin.date;
    } else if (shift === 'NIGHT' && action === 'IN') {
      date_check = checkin.date;
    } else if (shift === 'NIGHT' && action === 'OUT') {
      date_check = moment(checkin.date)
        .subtract(1, 'days')
        .format('YYYY-MM-DD');
    }

    const time_check = moment(new Date()).format('HH:mm');
    const field = {
      user_id: checkin.user_id,
      date: date_check,
      check_time: time_check,
      work_shift: shift,
    };

    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${CREATE}`,
        {
          ...field,
        },
      );
      if (!result?.data?.success) {
        showAlert('pta');
        closeModal();
      } else {
        showMessage('checkin.success', 'success', 500);
        setTimeout(() => {
          closeModal();
          navigate.navigate('Main');
        }, 500);
      }
    } catch (error) {
      showMessage('checkin.error', 'error', 1000);
      setTimeout(() => {
        closeModal();
      }, 1000);
    }
  };

  if (showNightShiftModal) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setShowNightShiftModal(false)}>
        <View style={styles.nightShiftModalContainer}>
          <View style={styles.nightShiftModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNightShiftModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.nightShiftModalTitle}>
              {t('confirm_night_shift')}
            </Text>
            <Text style={styles.nightShiftModalSubtitle}>
              {t('night_shift_confirm_message')}
            </Text>
            <View style={styles.nightShiftButtonContainer}>
              <TouchableOpacity
                style={[styles.nightShiftButton, styles.inButton]}
                onPress={() => {
                  handleCheckinWithQrCode('NIGHT', 'IN');
                }}>
                <Text style={styles.nightShiftButtonText}>
                  {t('night_shift_in')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nightShiftButton, styles.outButton]}
                onPress={() => {
                  handleCheckinWithQrCode('NIGHT', 'OUT');
                }}>
                <Text style={styles.nightShiftButtonText}>
                  {t('night_shift_out')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ModalMessage
          isVisible={isMessageModalVisible}
          onClose={() => setMessageModalVisible(false)}
          message={messageModal}
          type={messageType}
          t={t}
          duration={duration}
        />
      </Modal>
    );
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={closeModal}>
      <View style={styles.container}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalText}>{t('selS')}</Text>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => {
                handleCheckinWithQrCode('DAY');
              }}>
              <Text style={styles.buttonText}>{t('dS')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nightButton}
              onPress={() => {
                setShowNightShiftModal(true);
              }}>
              <Text style={styles.buttonText}>{t('nS')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ModalMessage
          isVisible={isMessageModalVisible}
          onClose={() => setMessageModalVisible(false)}
          message={messageModal}
          type={messageType}
          t={t}
          duration={duration}
        />
      </View>
    </Modal>
  );
};

export default ConfirmDayOrNight;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalText: {
    fontSize: 20,
    marginBottom: 20,
    color: 'black',
    fontWeight: '600',
    marginTop: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  dayButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 3,
  },
  nightButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nightShiftModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  nightShiftModalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nightShiftModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    marginTop: 10,
  },
  nightShiftModalSubtitle: {
    fontSize: 16,
    marginBottom: 25,
    color: '#666',
    textAlign: 'center',
  },
  nightShiftButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  nightShiftButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    elevation: 2,
  },
  inButton: {
    backgroundColor: '#27ae60',
  },
  outButton: {
    backgroundColor: '#e74c3c',
  },
  nightShiftButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
});
