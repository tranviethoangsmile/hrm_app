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
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const NewYearLine = ({text, delay, style}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

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
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, opacity, translateY, scale]);

  return (
    <Animated.Text
      style={[
        styles.wishText,
        style,
        {
          opacity,
          transform: [{translateY}, {scale}],
        },
      ]}>
      {text}
    </Animated.Text>
  );
};

const NewYearModal = ({visible, onClose, userName}) => {
  const {t} = useTranslation();
  const [scale] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    if (visible && !hasShownToday) {
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

      markAsShownToday();
    }
  }, [visible, hasShownToday, opacity, scale]);

  const markAsShownToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem('lastNewYearShow', today);
      setHasShownToday(true);
    } catch (error) {
      console.error('Error saving new year show date:', error);
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
      <View style={styles.containerModal}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{scale}],
              opacity,
            },
          ]}>
          
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="times-circle" size={28} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          
          {/* Background Gradient */}
          <LinearGradient
            colors={['#FFD700', '#FF6B35', '#C44569', '#2D1B69', '#FFD700']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientBackground}
          />
          
          {/* Animation Container */}
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../assets/json/fireworks2.json')}
              style={styles.animation}
              autoPlay
              loop
            />
          </View>
          
          {/* New Year Content */}
          <View style={styles.newYearContent}>
            <Text style={styles.newYearTitle}>
              🎊 {t('Happy New Year')} 🎊
            </Text>
            <Text style={styles.userNameText}>
              {userName}!
            </Text>
            <Text style={styles.newYearSubtitle}>
              {t('new_year_subtitle', 'Chúc mừng năm mới!')}
            </Text>
            <Text style={styles.yearText}>
              {new Date().getFullYear()}
            </Text>
          </View>
          
          {/* Wishes Container */}
          <View style={styles.wishesContainer}>
            <NewYearLine
              text={t('new_year_wish_line1')}
              delay={0}
              style={styles.goldText}
            />
            <NewYearLine
              text={t('new_year_wish_line2')}
              delay={1000}
              style={styles.redText}
            />
            <NewYearLine
              text={t('new_year_wish_line3')}
              delay={2000}
              style={styles.goldText}
            />
            <NewYearLine
              text={t('new_year_wish_line4')}
              delay={3000}
              style={styles.redText}
            />
            <NewYearLine
              text={t('new_year_wish_line5')}
              delay={4000}
              style={styles.goldText}
            />
          </View>
          
          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <Text style={styles.emoji}>🎆</Text>
            <Text style={styles.emoji}>🎇</Text>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.emoji}>🎊</Text>
            <Text style={styles.emoji}>🎉</Text>
          </View>
          
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  contentContainer: {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  animationContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 180,
    height: 180,
  },
  newYearContent: {
    position: 'absolute',
    top: 220,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  newYearTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  userNameText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  newYearSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 10,
  },
  yearText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 3, height: 3},
    textShadowRadius: 8,
  },
  wishesContainer: {
    position: 'absolute',
    top: 400,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  decorativeElements: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 30,
    opacity: 0.8,
  },
  wishText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  goldText: {
    color: '#FFD700',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  redText: {
    color: '#FF6B35',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
});

export default NewYearModal;
