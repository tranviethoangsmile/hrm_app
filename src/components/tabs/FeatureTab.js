/* eslint-disable no-unused-vars */
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {TEXT_COLOR, THEME_COLOR_2, BG_COLOR} from '../../utils/Colors';
import i18next from '../../../services/i18next';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
const FeatureTab = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
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

  const renderFeatureButton = (iconName, label, onPress) => (
    <TouchableOpacity style={styles.featureBtn} onPress={onPress}>
      <Icon name={iconName} size={30} color={THEME_COLOR_2} />
      <Text style={styles.featureText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.title}>{t('Fea')}</Text>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.featureRow}>
          {renderFeatureButton('clipboard-outline', t('inventory'), () =>
            navigation.navigate('Report'),
          )}
          {renderFeatureButton('restaurant-outline', t('or'), () =>
            navigation.navigate('Order'),
          )}
        </View>
        <View style={styles.featureRow}>
          {renderFeatureButton('logo-octocat', t('Ai'), () =>
            navigation.navigate('Ai'),
          )}
          {renderFeatureButton('shirt-outline', t('Mk'), () => {
            navigation.navigate('Uniform', {
              USER_INFOR: USER_INFOR,
            });
          })}
        </View>
        <View style={styles.featureRow}>
          {renderFeatureButton('calendar-outline', t('Lea'), () =>
            navigation.navigate('Leave'),
          )}
          {renderFeatureButton('chatbubbles-outline', t('Mess'), () => {
            navigation.navigate('Message');
          })}
        </View>
        <View style={styles.featureRow}>
          {renderFeatureButton('cloud-upload-outline', t('Up'), () =>
            navigation.navigate('Upload'),
          )}
          {renderFeatureButton('book-outline', t('planPro'), () => {
            navigation.navigate('PlanProduction');
          })}
        </View>
        <View style={styles.featureRow}>
          {renderFeatureButton('stats-chart-outline', t('RpV'), () =>
            navigation.navigate('ReportView'),
          )}
          {renderFeatureButton('today-outline', t('Dai'), () =>
            navigation.navigate('Daily'),
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginVertical: 16,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureBtn: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  featureText: {
    marginTop: 8,
    fontSize: 16,
    color: TEXT_COLOR,
  },
});

export default FeatureTab;
