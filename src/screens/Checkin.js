/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Text, Dimensions, Alert, TouchableOpacity} from 'react-native';
import {CameraScreen} from 'react-native-camera-kit';
import moment from 'moment';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/Strings';
const Checkin = () => {
  const today = moment();
  const authData = useSelector(state => state.auth);
  const [isScanned, setScanned] = useState(false);
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
  const handleScannerQRCode = async () => {
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

  const handleCheckin = qrValue => {
    switch (qrValue) {
      case 'eiuakpougg':
        showAlert('You have checked in!');
        break;
      case 'http://en.m.wikipedia.org':
        handleScannerQRCode();
        break;
      default:
        showAlert('Failed');
        break;
    }
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
    </View>
  );
};

export default Checkin;
