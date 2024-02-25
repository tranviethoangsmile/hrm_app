/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Text, Dimensions, Alert, TouchableOpacity} from 'react-native';
import {CameraScreen} from 'react-native-camera-kit';
import moment from 'moment';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/Strings';
import ConfirmDayOrNight from '../components/ComfirmDayOrNight';
const Checkin = () => {
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
    const checked = await axios.put(
      `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/user/`,
      {
        ...checkin,
      },
    );
    if (checked?.success) {
      showAlert(checked?.data?.message);
    } else {
      showAlert(checked?.data?.message);
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

  const handleCheckin = qrValue => {
    if (isValidQRCode(qrValue)) {
      if (qrValue === 'picked') {
        handleScannerQRCodePicked();
      } else {
        setVisible(true);
        handleCheckinWithQr(qrValue);
      }
    } else {
      console.log(qrValue);
      showAlert('QR not avaiable');
    }
  };

  const handleCheckinWithQr = qrValue => {
    setTimeCheckin(qrValue);
  };

  const showAlert = message => {
    Alert.alert('Checkin Status: ', message);
  };

  const handleRetryScan = () => {
    setScanned(false);
  };

  const SCREEN_HEIGHT = Dimensions.get('screen').height;

  return (
    <View style={{flex: 1, backgroundColor: 'black'}}>
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
          <Text style={{color: 'white', fontSize: 18}}>Retry Scan</Text>
        </TouchableOpacity>
      )}
      <ConfirmDayOrNight
        visible={isVisible}
        onClose={() => {
          setVisible(!isVisible);
        }}
        closeModal={closeModal}
        checkin={checkin}
        time={timeCheckin}
      />
    </View>
  );
};

export default Checkin;
