/* eslint-disable react/self-closing-comp */
import React from 'react';
import {View, ActivityIndicator, StyleSheet, Modal} from 'react-native';
import {COLORS} from '../config/theme';

const Loader = ({visible = false}) => {
  return (
    <Modal transparent={true} animationType={'none'} visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  activityIndicatorWrapper: {
    backgroundColor: COLORS.white,
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loader;
