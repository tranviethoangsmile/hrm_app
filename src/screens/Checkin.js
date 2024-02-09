/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Text, Dimensions, Alert, TouchableOpacity} from 'react-native';
import {CameraScreen} from 'react-native-camera-kit';

const Checkin = () => {
  const [isScanned, setScanned] = useState(false);

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

  const handleCheckin = qrValue => {
    switch (qrValue) {
      case 'eiuakpougg':
        showAlert('You have checked in!');
        break;
      case 'http://en.m.wikipedia.org':
        showAlert('You have checked in canteen!');
        break;
      default:
        showAlert('Failed');
        break;
    }
  };

  const showAlert = message => {
    Alert.alert('Checkin Status', message);
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
