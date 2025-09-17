import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const DarkModeToggle = ({style, showLabel = true, size = 'medium'}) => {
  const {isDarkMode, toggleTheme, colors} = useTheme();
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: isDarkMode ? 1 : 0,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
      Animated.timing(rotateValue, {
        toValue: isDarkMode ? 1 : 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDarkMode, animatedValue, rotateValue]);

  const handlePress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    toggleTheme();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          toggle: styles.smallToggle,
          text: styles.smallText,
          icon: 16,
          backgroundSize: 40,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          toggle: styles.largeToggle,
          text: styles.largeText,
          icon: 24,
          backgroundSize: 60,
        };
      default:
        return {
          container: styles.mediumContainer,
          toggle: styles.mediumToggle,
          text: styles.mediumText,
          icon: 20,
          backgroundSize: 50,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Animated styles
  const toggleBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFD700', '#1a1a2e'], // Gold to dark blue
  });

  const iconOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const moonOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const starsOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const sunRaysRotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, sizeStyles.text, {color: colors.text}]}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
      )}
      
      <Animated.View style={{transform: [{scale: scaleValue}]}}>
        <TouchableOpacity
          style={[styles.toggleButton, sizeStyles.toggle]}
          onPress={handlePress}
          activeOpacity={0.8}>
          
          {/* Background with gradient */}
          <Animated.View
            style={[
              styles.backgroundContainer,
              {
                width: sizeStyles.backgroundSize,
                height: sizeStyles.backgroundSize,
                backgroundColor: toggleBackgroundColor,
              },
            ]}>
            
            {/* Light mode - Sun with rays */}
            <Animated.View
              style={[
                styles.sunContainer,
                {
                  opacity: iconOpacity,
                },
              ]}>
              <Icon
                name="sunny"
                size={sizeStyles.icon}
                color="#FFA500"
                style={styles.sunIcon}
              />
              {/* Sun rays */}
              <Animated.View 
                style={[
                  styles.sunRays,
                  {
                    transform: [{rotate: sunRaysRotation}],
                  },
                ]}>
                <View style={[styles.ray, styles.ray1]} />
                <View style={[styles.ray, styles.ray2]} />
                <View style={[styles.ray, styles.ray3]} />
                <View style={[styles.ray, styles.ray4]} />
                <View style={[styles.ray, styles.ray5]} />
                <View style={[styles.ray, styles.ray6]} />
                <View style={[styles.ray, styles.ray7]} />
                <View style={[styles.ray, styles.ray8]} />
              </Animated.View>
            </Animated.View>

            {/* Dark mode - Moon with stars */}
            <Animated.View
              style={[
                styles.moonContainer,
                {
                  opacity: moonOpacity,
                },
              ]}>
              <Icon
                name="moon"
                size={sizeStyles.icon}
                color="#E6E6FA"
                style={styles.moonIcon}
              />
              
              {/* Stars */}
              <Animated.View
                style={[
                  styles.starsContainer,
                  {
                    opacity: starsOpacity,
                  },
                ]}>
                <View style={[styles.star, styles.star1]} />
                <View style={[styles.star, styles.star2]} />
                <View style={[styles.star, styles.star3]} />
                <View style={[styles.star, styles.star4]} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontWeight: '500',
  },
  toggleButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backgroundContainer: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sunContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunIcon: {
    zIndex: 2,
  },
  sunRays: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  ray: {
    position: 'absolute',
    backgroundColor: '#FFA500',
    borderRadius: 1,
  },
  ray1: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
  },
  ray2: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
    transform: [{rotate: '45deg'}],
  },
  ray3: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
    transform: [{rotate: '90deg'}],
  },
  ray4: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
    transform: [{rotate: '135deg'}],
  },
  ray5: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
    transform: [{rotate: '180deg'}],
  },
  ray6: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
    transform: [{rotate: '225deg'}],
  },
  ray7: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
    transform: [{rotate: '270deg'}],
  },
  ray8: {
    width: 2,
    height: 8,
    top: 0,
    left: '50%',
    marginLeft: -1,
    transform: [{rotate: '315deg'}],
  },
  moonContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonIcon: {
    zIndex: 2,
  },
  starsContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 0.5,
  },
  star1: {
    width: 1,
    height: 1,
    top: 8,
    left: 12,
  },
  star2: {
    width: 1,
    height: 1,
    top: 12,
    right: 10,
  },
  star3: {
    width: 1,
    height: 1,
    bottom: 10,
    left: 8,
  },
  star4: {
    width: 1,
    height: 1,
    bottom: 8,
    right: 12,
  },
  // Small size
  smallContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  smallToggle: {
    width: 40,
    height: 40,
  },
  smallText: {
    fontSize: 12,
  },
  // Medium size
  mediumContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumToggle: {
    width: 50,
    height: 50,
  },
  mediumText: {
    fontSize: 14,
  },
  // Large size
  largeContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeToggle: {
    width: 60,
    height: 60,
  },
  largeText: {
    fontSize: 16,
  },
});

export default DarkModeToggle;
