import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

const animations = [
  require('../assets/json/hpbd_1.json'),
  require('../assets/json/hpbd_2.json'),
  require('../assets/json/hpbd_3.json'),
  require('../assets/json/hpbd.json'),
];

const getRandomAnimation = () => {
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
};

const BirthdayLine = ({text, delay, style}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.wishText,
        style,
        {
          opacity,
          transform: [{translateY}],
        },
      ]}>
      {text}
    </Animated.Text>
  );
};

const HappyModal = ({visible, onClose, userName}) => {
  const {t} = useTranslation();
  const [animation, setAnimation] = useState(getRandomAnimation());
  const [scale] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    if (visible && !hasShownToday) {
      setAnimation(getRandomAnimation());
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Mark as shown for today
      markAsShownToday();
    }
  }, [visible, hasShownToday]);

  const markAsShownToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem('lastBirthdayShow', today);
      setHasShownToday(true);
    } catch (error) {
      console.error('Error saving birthday show date:', error);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.containerModal}>
          <TouchableOpacity style={styles.removeBtn} onPress={handleClose}>
            <Icon name="times-circle" size={30} color="#fff" />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{scale}],
                opacity,
              },
            ]}>
            <LottieView
              source={animation}
              style={styles.animation}
              autoPlay
              loop
            />
            <Text style={styles.birthdayText}>
              {t('Happy Birthday')} {userName}! 🎉
            </Text>
            <View style={styles.wishesContainer}>
              <BirthdayLine text={t('birthday_wish_line1')} delay={0} />
              <BirthdayLine text={t('birthday_wish_line2')} delay={1000} />
              <BirthdayLine text={t('birthday_wish_line3')} delay={2000} />
              <BirthdayLine text={t('birthday_wish_line4')} delay={3000} />
              <BirthdayLine text={t('birthday_wish_line5')} delay={4000} />
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  contentContainer: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  removeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  animation: {
    width: width * 0.7,
    height: width * 0.7,
  },
  birthdayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4B8C',
    marginTop: 20,
    textAlign: 'center',
  },
  wishesContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  wishText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HappyModal;
