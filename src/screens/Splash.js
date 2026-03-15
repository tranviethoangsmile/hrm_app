/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Gradient colors aligned with app (e.g. DependentSupportAmount header)
const LIGHT_GRADIENT = ['#667eea', '#764ba2'];
const DARK_GRADIENT = ['#1a1a2e', '#2d1b4e', '#16213e'];

const Splash = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const authData = useSelector(state => state.auth);
  const {isDarkMode} = useTheme();

  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let timeout;

    const startAnimations = () => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress bar fills over 2.6s then holds (scaleX for native driver)
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2600,
        useNativeDriver: true,
      }).start();

      // Loading text pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(loadingOpacity, {
            toValue: 0.6,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1},
      ).start();
    };

    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        startAnimations();
        timeout = setTimeout(() => {
          if (authData?.data != null) {
            navigation.replace('Main');
          } else {
            navigation.replace('Login');
          }
        }, 3000);
      } else {
        navigation.navigate('Language');
      }
    };
    checkLanguage();
    return () => clearTimeout(timeout);
  }, []);

  const progressScale = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const gradientColors = isDarkMode ? DARK_GRADIENT : LIGHT_GRADIENT;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{scale: logoScale}],
            },
          ]}>
          <Image
            source={require('../assets/images/logo_metal.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.loadingSection}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  transform: [{scaleX: progressScale}],
                  transformOrigin: 'left',
                },
              ]}
            />
          </View>
          <Animated.Text style={[styles.loadingText, {opacity: loadingOpacity}]}>
            {t('Loading')}
          </Animated.Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>V.15.03.26</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: '85%',
    height: Math.min(SCREEN_HEIGHT * 0.42, 320),
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  loadingSection: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.75,
    marginTop: 48,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.5,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
});

export default Splash;
