import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const OptimizedLoader = ({visible = false}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  
  // Store animation references for cleanup
  const animationRefs = useRef([]);

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous spin animation - simplified
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000, // Slower for better performance
          useNativeDriver: true,
        }),
        {iterations: -1}
      );
      animationRefs.current.push(spinAnimation);

      // Pulse animation - simplified
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05, // Reduced scale for better performance
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1}
      );
      animationRefs.current.push(pulseAnimation);

      // Start animations
      animationRefs.current.forEach(anim => anim.start());
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Stop all animations
      animationRefs.current.forEach(anim => {
        if (anim && anim.stop) {
          anim.stop();
        }
      });
      animationRefs.current = [];
    }

    // Cleanup function
    return () => {
      animationRefs.current.forEach(anim => {
        if (anim && anim.stop) {
          anim.stop();
        }
      });
      animationRefs.current = [];
    };
  }, [visible, spinValue, pulseValue, scaleValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Platform-specific optimization
  const isIOS = Platform.OS === 'ios';
  const logoSize = isIOS ? 60 : 70;
  const containerSize = isIOS ? 100 : 120;

  return (
    <Modal transparent={true} animationType={'fade'} visible={visible}>
      <Animated.View 
        style={[
          styles.modalBackground,
          {opacity: fadeValue}
        ]}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
          style={styles.gradientBackground}>
          
          {/* Main loader container - simplified */}
          <Animated.View
            style={[
              styles.loaderContainer, 
              {
                transform: [
                  {scale: scaleValue},
                  {scale: pulseValue}
                ]
              }
            ]}>
            
            {/* Outer ring - simplified */}
            <View style={[styles.outerRing, {width: containerSize, height: containerSize}]}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.outerGradient}
              />
            </View>

            {/* Middle ring - simplified */}
            <View style={[styles.middleRing, {width: containerSize - 20, height: containerSize - 20}]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']}
                style={styles.middleGradient}
              />
            </View>

            {/* Logo container - simplified */}
            <View style={[styles.logoContainer, {width: containerSize - 40, height: containerSize - 40}]}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.logoBackground}>
                <Animated.View
                  style={[
                    styles.logoWrapper,
                    {
                      transform: [{rotate: spin}],
                    },
                  ]}>
                  <Image
                    source={require('../assets/images/daihatsu-metal-logo.jpg')}
                    style={[styles.logo, {width: logoSize, height: logoSize}]}
                    resizeMode="contain"
                  />
                </Animated.View>
              </LinearGradient>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderRadius: 50,
    // Simplified shadow for better performance
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  outerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    opacity: 0.6,
  },
  middleRing: {
    position: 'absolute',
    borderRadius: 40,
  },
  middleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    opacity: 0.8,
  },
  logoContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    // Simplified shadow
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 30,
  },
});

export default OptimizedLoader;
