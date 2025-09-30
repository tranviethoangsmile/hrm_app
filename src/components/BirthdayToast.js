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

const BirthdayToast = ({visible, onClose, onShowModal}) => {
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
        <View style={styles.iconContainer}>
          <Icon name="gift" size={24} color="#FFD700" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('Happy Birthday')}!</Text>
          <Text style={styles.subtitle}>🎉 {t('birthday_toast_subtitle', 'Tap to celebrate!')} 🎉</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={16} color="#FFD700" />
        </View>
      </Pressable>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="times" size={16} color="rgba(255,255,255,0.8)" />
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
    backgroundColor: '#FF6B9D',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginLeft: 8,
  },
});

export default BirthdayToast;
