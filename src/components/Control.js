/* eslint-disable no-alert */
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TEXT_COLOR, THEME_COLOR_2} from '../utils/Colors';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';

const Control = ({visible, onClose, t}) => {
  const [isVisible, setIsvisible] = useState(visible);
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();
  const disPatch = useDispatch();
  const handleLogout = () => {
    setIsvisible(!isVisible);
    // disPatch(setAuthData(null));
    onClose();
    navigation.navigate('Login');
  };
  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.mainView}>
            <Text
              style={styles.textControl}
              onPress={() => {
                onClose();
                navigation.navigate('Important', {
                  USER_INFOR: USER_INFOR,
                });
              }}>
              {t('is_impor')}
            </Text>
            <Text
              style={styles.textControl}
              onPress={() => {
                onClose();
                navigation.navigate('Setting');
              }}>
              {t('Set')}
            </Text>
            <Text style={styles.textControl} onPress={handleLogout}>
              {t('Lout')}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Control;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainView: {
    ...Platform.select({
      ios: {
        backgroundColor: THEME_COLOR_2,
        top: 100,
        width: 150,
        height: 210,
        right: 30,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 10,
        position: 'absolute',
      },
      android: {
        backgroundColor: THEME_COLOR_2,
        top: 45,
        width: 150,
        height: 210,
        right: 30,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 10,
        position: 'absolute',
      },
    }),
  },
  textControl: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
