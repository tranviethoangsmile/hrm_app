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
  Animated,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';

const {width, height} = Dimensions.get('window');

const Control = ({visible, onClose, t}) => {
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();
  const disPatch = useDispatch();
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = () => {
    onClose();
    navigation.navigate('Login');
  };

  const handleSettings = () => {
    onClose();
    navigation.navigate('Setting');
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
            <Animated.View 
              style={[
                styles.card, 
                {
                  transform: [{scale: scaleAnim}],
                }
              ]}>
              {/* Action buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                  onPress={handleSettings}>
                  <View style={styles.actionIconContainer}>
                    <Icon
                      name="settings-outline"
                      size={24}
                      color="#667eea"
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{t('Set')}</Text>
                  </View>
                  <Icon
                    name="chevron-forward"
                    size={20}
                    color="#C7C7CC"
                  />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={[styles.actionBtn, styles.logoutBtn]}
                  activeOpacity={0.7}
                  onPress={handleLogout}>
                  <View style={[styles.actionIconContainer, styles.logoutIconContainer]}>
                    <Icon
                      name="log-out-outline"
                      size={24}
                      color="#ff6b6b"
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[styles.actionTitle, styles.logoutText]}>
                      {t('Lout')}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-forward"
                    size={20}
                    color="#C7C7CC"
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 25 : 20,
    paddingLeft: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  actionsContainer: {
    paddingVertical: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutBtn: {
    backgroundColor: 'transparent',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoutIconContainer: {
    backgroundColor: '#fff5f5',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a202c',
  },
  logoutText: {
    color: '#ff6b6b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 58,
    marginVertical: 2,
  },
});
