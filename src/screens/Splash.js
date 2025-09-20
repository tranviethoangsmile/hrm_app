/* eslint-disable react-hooks/exhaustive-deps */
import {View, StyleSheet, Image, Text, Animated, Dimensions} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Car Component
const CarComponent = ({wheelRotation}) => {
  const wheelRotationInterpolate = wheelRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.carBody}>
      {/* Car Body */}
      <View style={styles.carMainBody}>
        {/* Windshield */}
        <View style={styles.windshield} />
        {/* Side Windows */}
        <View style={styles.sideWindow} />
        {/* Headlights */}
        <View style={styles.headlight} />
      </View>
      
      {/* Wheels */}
      <View style={styles.wheelContainer}>
        <Animated.View 
          style={[
            styles.wheel,
            {
              transform: [{rotate: wheelRotationInterpolate}],
            },
          ]} 
        />
        <Animated.View 
          style={[
            styles.wheel,
            {
              transform: [{rotate: wheelRotationInterpolate}],
            },
          ]} 
        />
      </View>
      
      {/* Car Details */}
      <View style={styles.carDetails}>
        <View style={styles.doorLine} />
        <View style={styles.bumper} />
      </View>
    </View>
  );
};

const Splash = () => {
  const {t} = useTranslation();
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const navigation = useNavigation();
  const authData = useSelector(state => state.auth);
  
  // Animation values
  const carPosition = useRef(new Animated.Value(-100)).current;
  const carRotation = useRef(new Animated.Value(0)).current;
  const smokeTrail = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const smokeParticle1 = useRef(new Animated.Value(0)).current;
  const smokeParticle2 = useRef(new Animated.Value(0)).current;
  const smokeParticle3 = useRef(new Animated.Value(0)).current;
  const wheelRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout;
    
    // Start car animation
    const startCarAnimation = () => {
      // Car movement animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(carPosition, {
            toValue: SCREEN_WIDTH + 50,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(carPosition, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1}
      ).start();

      // Car rotation animation (bounce effect)
      Animated.loop(
        Animated.sequence([
          Animated.timing(carRotation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(carRotation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1}
      ).start();

      // Smoke trail animation (follows the car)
      Animated.loop(
        Animated.sequence([
          Animated.timing(smokeTrail, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(smokeTrail, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
        {iterations: -1}
      ).start();

      // Loading text fade animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingTextOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(loadingTextOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1}
      ).start();

      // Wheel rotation animation
      Animated.loop(
        Animated.timing(wheelRotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        {iterations: -1}
      ).start();

      // Smoke particles animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(smokeParticle1, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(smokeParticle1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1}
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(smokeParticle2, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(smokeParticle2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1}
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(smokeParticle3, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(smokeParticle3, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        {iterations: -1}
      ).start();
    };

    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        startCarAnimation();
        timeout = setTimeout(() => {
          if (authData.data != null) {
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
  const carRotationInterpolate = carRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const smokeTrailWidth = smokeTrail.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH + 150],
  });

  const smokeOpacity = smokeTrail.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.8, 0.3],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo_metal.png')}
        style={styles.logo}
      />
      
      {/* Loading Section */}
      <View style={styles.loadingContainer}>
        {/* Road */}
        <View style={styles.road}>
          <View style={[styles.roadLine, {left: 20}]} />
          <View style={[styles.roadLine, {left: 60}]} />
          <View style={[styles.roadLine, {left: 100}]} />
          <View style={[styles.roadLine, {left: 140}]} />
          <View style={[styles.roadLine, {left: 180}]} />
          <View style={[styles.roadLine, {left: 220}]} />
          <View style={[styles.roadLine, {left: 260}]} />
          <View style={[styles.roadLine, {left: 300}]} />
        </View>
        
        {/* Smoke Trail (Progress Bar) */}
        <Animated.View
          style={[
            styles.smokeTrail,
            {
              width: smokeTrailWidth,
              opacity: smokeOpacity,
            },
          ]}>
          <View style={styles.smokeEffect} />
        </Animated.View>
        
        {/* Animated Car */}
        <Animated.View
          style={[
            styles.carContainer,
            {
              transform: [
                {translateX: carPosition},
                {rotate: carRotationInterpolate},
              ],
            },
          ]}>
          <CarComponent wheelRotation={wheelRotation} />
          {/* Car exhaust smoke */}
          <View style={styles.carExhaust}>
            <Animated.View 
              style={[
                styles.smokeParticle1,
                {
                  opacity: smokeParticle1,
                  transform: [
                    {
                      scale: smokeParticle1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.2],
                      }),
                    },
                  ],
                },
              ]} 
            />
            <Animated.View 
              style={[
                styles.smokeParticle2,
                {
                  opacity: smokeParticle2,
                  transform: [
                    {
                      scale: smokeParticle2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]} 
            />
            <Animated.View 
              style={[
                styles.smokeParticle3,
                {
                  opacity: smokeParticle3,
                  transform: [
                    {
                      scale: smokeParticle3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 0.8],
                      }),
                    },
                  ],
                },
              ]} 
            />
          </View>
        </Animated.View>
        
        {/* Loading Text */}
        <Animated.Text
          style={[
            styles.loadingText,
            {opacity: loadingTextOpacity},
          ]}>
          {t('Loading')}
        </Animated.Text>
      </View>
      
      <View style={styles.versionTextView}>
        <Text style={styles.text}>V.20.08.25</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  versionTextView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },

  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: '50%',
    resizeMode: 'contain',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    width: '90%',
    height: 120,
    marginTop: 20,
    position: 'relative',
  },
  road: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  roadLine: {
    position: 'absolute',
    top: 1,
    height: 2,
    width: 20,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  carContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  carBody: {
    width: 50,
    height: 30,
    position: 'relative',
  },
  carMainBody: {
    width: 50,
    height: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  windshield: {
    position: 'absolute',
    top: 2,
    left: 8,
    width: 12,
    height: 8,
    backgroundColor: '#87CEEB',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#4682B4',
  },
  sideWindow: {
    position: 'absolute',
    top: 2,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#87CEEB',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#4682B4',
  },
  headlight: {
    position: 'absolute',
    top: 6,
    left: 2,
    width: 4,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  wheelContainer: {
    position: 'absolute',
    bottom: -2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  wheel: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    // Wheel spokes
    position: 'relative',
  },
  carDetails: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  doorLine: {
    position: 'absolute',
    top: 4,
    left: 20,
    width: 1,
    height: 12,
    backgroundColor: '#000',
    opacity: 0.3,
  },
  bumper: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#000',
    opacity: 0.2,
  },
  smokeTrail: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    height: 8,
    backgroundColor: 'transparent',
  },
  smokeEffect: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    // Gradient effect simulation
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  carExhaust: {
    position: 'absolute',
    right: -15,
    top: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smokeParticle1: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 2,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  smokeParticle2: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginRight: 2,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  smokeParticle3: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});
export default Splash;
