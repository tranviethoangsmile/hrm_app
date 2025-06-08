/* eslint-disable no-alert */
import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';

const Control = ({visible, onClose, t}) => {
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();
  const disPatch = useDispatch();

  const handleLogout = () => {
    onClose();
    navigation.navigate('Login');
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, SHADOWS.medium]}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Icon name="x" size={22} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  navigation.navigate('Important', {USER_INFOR});
                }}>
                <Icon
                  name="star"
                  size={20}
                  color={COLORS.primary}
                  style={styles.icon}
                />
                <Text style={styles.actionText}>{t('is_impor')}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  navigation.navigate('Setting');
                }}>
                <Icon
                  name="settings"
                  size={20}
                  color={COLORS.info}
                  style={styles.icon}
                />
                <Text style={styles.actionText}>{t('Set')}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={handleLogout}>
                <Icon
                  name="log-out"
                  size={20}
                  color={COLORS.danger}
                  style={styles.icon}
                />
                <Text style={[styles.actionText, {color: COLORS.danger}]}>
                  {t('Lout')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Control;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginTop: Platform.OS === 'ios' ? 100 : 60,
    marginLeft: 20,
    width: 200,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'stretch',
    minHeight: 180,
    ...SHADOWS.medium,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius,
  },
  actionText: {
    ...FONTS.h4,
    color: COLORS.text,
    marginLeft: 12,
  },
  icon: {
    width: 24,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray2,
    marginVertical: 2,
    marginLeft: 32,
  },
});
