/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {CameraScreen} from 'react-native-camera-kit';
import moment from 'moment';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {
  API,
  BASE_URL,
  ORDER_URL,
  PORT,
  V1,
  VERSION,
  CHECKIN,
  CREATE,
} from '../utils/constans';
import {useNavigation} from '@react-navigation/native';
import {ModalMessage} from '../components';
import ConfirmDayOrNight from '../components/ComfirmDayOrNight';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
const Checkin = () => {
  const navigate = useNavigation();
  const {t} = useTranslation();
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
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
  });
  const today = moment();
  const authData = useSelector(state => state.auth);
  const [isScanned, setScanned] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [timeCheckin, setTimeCheckin] = useState('');
  const closeModal = () => {
    setVisible(!isVisible);
  };
  const checkin = {
    user_id: authData.data.data.id,
    date: today.format('YYYY-MM-DD'),
  };
  const handleQRCodeScanner = value => {
    if (!isScanned) {
      const qrValue = value.nativeEvent.codeStringValue;
      handleCheckin(qrValue);
      setScanned(true);
      setTimeout(() => {
        setScanned(false);
      }, 10000);
    }
  };
  const handleScannerQRCodePicked = async () => {
    try {
      const time = moment().format('HH:mm:ss A');
      if (
        moment(time, 'HH:mm:ss A').isBefore(moment('12:00:00 PM', 'HH:mm:ss A'))
      ) {
        checkin.date = moment(today).subtract(1, 'day');
        const checked = await axios.put(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/user/`,
          {
            ...checkin,
          },
        );
        if (checked?.success) {
          showMessage('picked success', 'success', 1000);
        } else {
          showMessage('unSuccess', 'error', 1500);
        }
      } else {
        const checked = await axios.put(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/user/`,
          {
            ...checkin,
          },
        );
        if (checked?.success) {
          showMessage('success', 'success', 1000);
        } else {
          showMessage('unSuccess', 'error', 1500);
        }
      }
    } catch (error) {
      showMessage('err', 'error', 1500);
    }
  };

  const isValidQRCode = qrValue => {
    if (qrValue.startsWith('http://')) {
      return false;
    } else if (qrValue.length > 10) {
      return false;
    } else {
      return true;
    }
  };

  const handleCheckinForOfficer = async () => {
    try {
      const field = {
        user_id: checkin.user_id,
        date: today.format('YYYY-MM-DD'),
        check_time: moment(new Date()).format('HH:mm'), //product (USE qrVlaue)
        work_shift: 'DAY',
      };

      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CHECKIN}${CREATE}`,
        {
          ...field,
        },
      );
      if (result?.data?.success) {
        showMessage('checkin.success', 'success', 1000);
        navigate.goBack();
      } else {
        showMessage('pta', 'warning', 1000);
        navigate.goBack();
      }
    } catch (error) {
      showMessage('err', 'error', 1000);
    }
  };

  // dev only use
  const handleCheckin = qrValue => {
    if (isValidQRCode(qrValue)) {
      if (qrValue === 'picked') {
        handleScannerQRCodePicked();
      } else if (qrValue === 'checkin') {
        if (authData.data.data.is_officer) {
          handleCheckinForOfficer();
        } else {
          setVisible(true);
        }
        // handleCheckinWithQr();
      }
    } else {
      showMessage('QR not avaiable', 'error', 1000);
    }
  };
  // end dev

  // product
  // const handleCheckin = qrValue => {
  //   if (isValidQRCode(qrValue)) {
  //     if (qrValue === 'picked') {
  //       handleScannerQRCodePicked();
  //     } else {
  //       setVisible(true);
  //       handleCheckinWithQr(qrValue);
  //     }
  //   } else {
  //     showAlert('QR not avaiable');
  //   }
  // };
  // const handleCheckinWithQr = qrValue => {
  //   setTimeCheckin(qrValue);
  // };

  const handleRetryScan = () => {
    setScanned(false);
  };

  const SCREEN_HEIGHT = Dimensions.get('screen').height;

  return (
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CameraScreen
        style={{flex: 1, height: SCREEN_HEIGHT}}
        scanBarcode={true}
        onReadCode={handleQRCodeScanner}
        showFrame={true}
        laserColor="red"
        frameColor="white"
      />

      {/* Retry Button */}
      {isScanned && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            alignSelf: 'center',
            padding: 10,
            backgroundColor: 'blue',
            borderRadius: 8,
          }}
          onPress={handleRetryScan}>
          <Text style={{color: 'white', fontSize: 18}}>{t('reS')}</Text>
        </TouchableOpacity>
      )}
      <ConfirmDayOrNight
        auth={authData}
        visible={isVisible}
        onClose={() => {
          setVisible(!isVisible);
        }}
        closeModal={closeModal}
        checkin={checkin}
        time={timeCheckin}
        t={t}
      />
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

export default Checkin;
