import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
      date_check = checkin.date; // Nếu là ca ngày, sử dụng ngày hiện tại
    } else if (shift === 'NIGHT' && action === 'IN') {
      date_check = checkin.date; // Nếu là ca đêm và vào ca đêm, sử dụng ngày hiện tại
    } else if (shift === 'NIGHT' && action === 'OUT') {
      date_check = moment(checkin.date)
        .subtract(1, 'days')
        .format('YYYY-MM-DD'); // Nếu là ca đêm và ra ca đêm, sử dụng ngày hôm trước
    }

    // Dev Try Only
    const time_check = moment(new Date()).format('HH:mm');
    // end dev
    const field = {
      user_id: checkin.user_id,
      date: date_check,
      check_time: time_check, //product (time)
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
          navigate.goBack();
        }, 500); // Đóng modal sau 3 giây
      }
    } catch (error) {
      showMessage('checkin.error', 'error', 1000);
      setTimeout(() => {
        closeModal();
      }, 1000); // Đóng modal sau 1 giây
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={closeModal}>
      <View style={styles.container}>
        <View style={styles.modalView}>
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
                Alert.alert(
                  t('plzcof'),
                  t('inorout'),
                  [
                    {
                      text: t('I'),
                      onPress: () => {
                        handleCheckinWithQrCode('NIGHT', 'IN'); // Xác nhận vào ca đêm
                      },
                    },
                    {
                      text: t('O'),
                      onPress: () => {
                        handleCheckinWithQrCode('NIGHT', 'OUT'); // Xác nhận ra ca đêm
                      },
                    },
                  ],
                  {cancelable: true},
                );
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
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    marginBottom: 20,
    color: 'black',
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  nightButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
