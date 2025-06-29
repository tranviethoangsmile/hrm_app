import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';

const {width} = Dimensions.get('window');

const NewYearToast = ({visible, onClose, onShowModal}) => {
  const {t} = useTranslation();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const handlePress = () => {
    onShowModal();
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY}],
        },
      ]}>
      <Pressable style={styles.content} onPress={handlePress}>
        <Icon name="star" size={20} color="#FFD700" />
        <Text style={styles.text}>{t('Happy New Year')}! 🎊</Text>
      </Pressable>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="times" size={16} color="#666" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    padding: 5,
  },
});

export default NewYearToast;
