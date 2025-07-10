/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  Alert,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('screen');

const Checkin = () => {
  const navigate = useNavigation();
  const {t} = useTranslation();
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [isScanned, setScanned] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [timeCheckin, setTimeCheckin] = useState('');

  const authData = useSelector(state => state.auth);
  const today = moment();

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

  const closeModal = () => {
    setVisible(!isVisible);
  };

  // Check if authData is available before creating checkin object
  const checkin = authData?.data?.data?.id
    ? {
        user_id: authData.data.data.id,
        date: today.format('YYYY-MM-DD'),
      }
    : null;

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
      if (!checkin) {
        showMessage('auth.required', 'error', 1500);
        return;
      }

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
      if (!checkin) {
        showMessage('auth.required', 'error', 1000);
        return;
      }

      const field = {
        user_id: checkin.user_id,
        date: today.format('YYYY-MM-DD'),
        check_time: moment(new Date()).format('HH:mm'),
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
        setTimeout(() => navigate.navigate('Profile'), 1000);
      } else {
        showMessage('pta', 'warning', 1000);
        setTimeout(() => navigate.navigate('Profile'), 1000);
      }
    } catch (error) {
      showMessage('err', 'error', 1000);
    }
  };

  const handleCheckin = qrValue => {
    if (isValidQRCode(qrValue)) {
      if (qrValue === 'picked') {
        handleScannerQRCodePicked();
      } else if (qrValue === 'checkin') {
        if (authData?.data?.data?.is_officer) {
          handleCheckinForOfficer();
        } else {
          setVisible(true);
        }
      }
    } else {
      showMessage('QR not avaiable', 'error', 1000);
    }
  };

  const handleRetryScan = () => {
    setScanned(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Camera View */}
      <CameraScreen
        style={styles.camera}
        scanBarcode={true}
        onReadCode={handleQRCodeScanner}
        showFrame={true}
        laserColor="#4FACFE"
        frameColor="#fff"
      />

      {/* Header Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate.navigate('Main')}
          activeOpacity={0.8}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('scan_qr_code', 'Scan QR Code')}
        </Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Scanning Frame with Instructions */}
      {/* Bottom Overlay with Status */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomOverlay}>
        {isScanned ? (
          <View style={styles.statusContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetryScan}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#4FACFE', '#00F2FE']}
                style={styles.retryGradient}>
                <Icon name="refresh" size={20} color="#fff" />
                <Text style={styles.retryText}>
                  {t('scan_again', 'Scan Again')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.waitingContainer}>
            <View style={styles.scanningIndicator}>
              <Icon name="qr-code-outline" size={48} color="#fff" />
              <Text style={styles.waitingText}>
                {t('waiting_for_qr', 'Waiting for QR Code...')}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4FACFE',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#4FACFE',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4FACFE',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#4FACFE',
    borderBottomRightRadius: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 60,
    zIndex: 10,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  retryButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  waitingContainer: {
    alignItems: 'center',
  },
  scanningIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  waitingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
  },
});

export default Checkin;
