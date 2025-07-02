/* eslint-disable react/self-closing-comp */
import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../config/theme';

const {width, height} = Dimensions.get('window');

const Loader = ({visible = false}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const glowOpacityValue = useRef(new Animated.Value(0.3)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Continuous spin animation
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();

      // Pulse animation
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();

      // Glow opacity animation (separate from transforms)
      const glow = () => {
        Animated.sequence([
          Animated.timing(glowOpacityValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacityValue, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => glow());
      };
      glow();

      // Shimmer animation
      const shimmer = () => {
        Animated.sequence([
          Animated.timing(shimmerOpacity, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerOpacity, {
            toValue: 0.1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => shimmer());
      };
      shimmer();

      // Floating particles
      const floatParticle = (particle, delay) => {
        particle.setValue(0);
        Animated.loop(
          Animated.timing(particle, {
            toValue: 1,
            duration: 4000 + delay,
            useNativeDriver: true,
          }),
        ).start();
      };

      setTimeout(() => floatParticle(particle1, 0), 500);
      setTimeout(() => floatParticle(particle2, 1000), 1000);
      setTimeout(() => floatParticle(particle3, 2000), 1500);
    } else {
      // Exit animation
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [
    visible,
    spinValue,
    pulseValue,
    scaleValue,
    glowOpacityValue,
    particle1,
    particle2,
    particle3,
    shimmerOpacity,
  ]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const particle1Y = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: [50, -50],
  });

  const particle2Y = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -70],
  });

  const particle3Y = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [40, -60],
  });

  const particle1X = particle1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 30, -20],
  });

  const particle2X = particle2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -25, 35],
  });

  const particle3X = particle3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 20, -30],
  });

  const particleOpacity = particle1.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Modal transparent={true} animationType={'fade'} visible={visible}>
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
        style={styles.modalBackground}>
        {/* Animated particles */}
        <Animated.View
          style={[
            styles.particle,
            {
              transform: [
                {translateX: particle1X},
                {translateY: particle1Y},
                {scale: pulseValue},
              ],
              opacity: particleOpacity,
            },
          ]}>
          <View style={[styles.particleDot, {backgroundColor: '#fff'}]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.particle,
            {
              transform: [
                {translateX: particle2X},
                {translateY: particle2Y},
                {scale: pulseValue},
              ],
              opacity: particleOpacity,
            },
          ]}>
          <View style={[styles.particleDot, {backgroundColor: '#fbbf24'}]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.particle,
            {
              transform: [
                {translateX: particle3X},
                {translateY: particle3Y},
                {scale: pulseValue},
              ],
              opacity: particleOpacity,
            },
          ]}>
          <View style={[styles.particleDot, {backgroundColor: '#f87171'}]} />
        </Animated.View>

        {/* Main loader container */}
        <Animated.View
          style={[styles.loaderContainer, {transform: [{scale: scaleValue}]}]}>
          {/* Outer glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacityValue,
                transform: [{scale: pulseValue}],
              },
            ]}>
            <LinearGradient
              colors={['#667eea', '#764ba2', '#667eea']}
              style={styles.glowGradient}
            />
          </Animated.View>

          {/* Middle ring */}
          <View style={styles.middleRing}>
            <LinearGradient
              colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']}
              style={styles.middleGradient}
            />
          </View>

          {/* Logo container */}
          <View style={styles.loaderWrapper}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.logoBackground}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [{rotate: spin}, {scale: pulseValue}],
                  },
                ]}>
                <Image
                  source={require('../assets/images/daihatsu-metal-logo.jpg')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Inner sparkle effect */}
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    opacity: glowOpacityValue,
                    transform: [{rotate: spin}],
                  },
                ]}>
                <View style={styles.sparkleCenter} />
                <View style={[styles.sparkleLine, styles.sparkleHorizontal]} />
                <View style={[styles.sparkleLine, styles.sparkleVertical]} />
              </Animated.View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Background shimmer effect */}
        <Animated.View style={[styles.shimmer, {opacity: shimmerOpacity}]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    opacity: 0.6,
  },
  middleRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  middleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    opacity: 0.8,
  },
  loaderWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  logo: {
    width: 70,
    height: 70,
  },
  sparkle: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleCenter: {
    width: 4,
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    position: 'absolute',
  },
  sparkleLine: {
    backgroundColor: '#fbbf24',
    position: 'absolute',
  },
  sparkleHorizontal: {
    width: 20,
    height: 1,
  },
  sparkleVertical: {
    width: 1,
    height: 20,
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
  },
});

export default Loader;
