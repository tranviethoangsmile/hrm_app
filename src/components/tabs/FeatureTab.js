/* eslint-disable no-unused-vars */
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Platform} from 'react-native';
import {TEXT_COLOR, THEME_COLOR_2, BG_COLOR} from '../../utils/Colors';
import {useNavigation} from '@react-navigation/native';
import i18next from '../../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeatureTab = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const {t} = useTranslation();
  const navigation = useNavigation();
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Fea')}</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                /* Handle 'Report' button press */
              }}>
              {t('rp')}
            </Text>
          </View>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                navigation.navigate('Order');
              }}>
              {t('or')}
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                navigation.navigate('Ai');
              }}>
              {t('Ai')}
            </Text>
          </View>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>{t('Mk')}</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>{t('Lea')}</Text>
          </View>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>{t('Mess')}</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>{t('Up')}</Text>
          </View>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>{t('Learn')}</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>{t('RpV')}</Text>
          </View>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                navigation.navigate('Daily');
              }}>
              {t('Dai')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FeatureTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: BG_COLOR,
  },
  title: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLOR_2,
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
  },
  featureBtn: {
    flex: 1,
    height: 70,
    borderWidth: 1,
    borderRadius: 30,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR_2,
  },
  scrollView: {
    flex: 1,
  },
  featureText: {
    color: TEXT_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
