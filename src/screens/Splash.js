import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Image, Text, Animated, StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';
import {SIZES, FONTS} from '../config/theme';

const Splash = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const authData = useSelector(state => state.auth);
  const {colors, isDarkMode} = useTheme();
  const [loading, setLoading] = useState(true);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const didRoute = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {toValue: 1, duration: 450, useNativeDriver: true}),
      Animated.spring(scale, {toValue: 1, friction: 8, tension: 70, useNativeDriver: true}),
    ]).start();

    let mounted = true;
    const initialize = async () => {
      try {
        const [language, firstLoginFlag, savedUser] = await Promise.all([
          AsyncStorage.getItem('Language'),
          AsyncStorage.getItem('FIRST_LOGIN_REQUIRED'),
          AsyncStorage.getItem('userInfor'),
        ]);
        if (!mounted || didRoute.current) return;
        didRoute.current = true;
        if (!language) {
          navigation.reset({index: 0, routes: [{name: 'Language'}]});
        } else if (firstLoginFlag === 'true' && savedUser) {
          navigation.reset({
            index: 0,
            routes: [{name: 'FirstLoginPassword', params: {userInfo: JSON.parse(savedUser)}}],
          });
        } else if (authData?.data) {
          navigation.reset({index: 0, routes: [{name: 'Main'}]});
        } else {
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        }
      } catch (error) {
        if (mounted && !didRoute.current) {
          didRoute.current = true;
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    initialize();
    return () => {
      mounted = false;
    };
  }, [authData?.data, navigation, opacity, scale]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Animated.View style={[styles.content, {opacity, transform: [{scale}]}]}>
        <View style={[styles.logoMark, {backgroundColor: colors.primaryLight}]}>
          <Image source={require('../assets/images/logo_metal.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={[styles.brand, {color: colors.text}]}>HRM Metal</Text>
        <Text style={[styles.tagline, {color: colors.textSecondary}]}>{t('splash.tagline')}</Text>
        <View style={[styles.loadingTrack, {backgroundColor: colors.surfaceSecondary}]}>
          <View style={[styles.loadingFill, {backgroundColor: colors.primary}]} />
        </View>
        <View style={styles.loadingLabel}>
          <Icon name="sparkles-outline" size={15} color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.textSecondary}]}>{loading ? t('Loading') : ''}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {alignItems: 'center', paddingHorizontal: SIZES.spacing.xxl},
  logoMark: {width: 104, height: 104, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.spacing.xl},
  logo: {width: 78, height: 78},
  brand: {...FONTS.title},
  tagline: {...FONTS.body, textAlign: 'center', marginTop: SIZES.spacing.sm},
  loadingTrack: {width: 132, height: 4, borderRadius: 2, overflow: 'hidden', marginTop: SIZES.spacing.section},
  loadingFill: {width: '64%', height: '100%', borderRadius: 2},
  loadingLabel: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SIZES.spacing.md, minHeight: 18},
  loadingText: {...FONTS.caption},
});

export default Splash;
