/* eslint-disable no-unused-vars */
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {TEXT_COLOR, THEME_COLOR_2} from '../../utils/Colors';
import i18next from '../../../services/i18next';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

const FeatureTab = ({onScrollList}) => {
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

  const allFeatures = [
    {
      iconName: 'clipboard-outline',
      labelKey: 'inventory',
      action: () => navigation.navigate('Report'),
    },
    {
      iconName: 'restaurant-outline',
      labelKey: 'or',
      action: () => navigation.navigate('Order'),
    },
    {
      iconName: 'logo-octocat',
      labelKey: 'Ai',
      action: () => navigation.navigate('Ai'),
      hideForRoles: ['STAFF'],
    },
    {
      iconName: 'shirt-outline',
      labelKey: 'Mk',
      action: () => navigation.navigate('Uniform', {USER_INFOR: USER_INFOR}),
    },
    {
      iconName: 'calendar-outline',
      labelKey: 'Lea',
      action: () => navigation.navigate('Leave'),
    },

    {
      iconName: 'cloud-upload-outline',
      labelKey: 'Up',
      action: () => navigation.navigate('Upload'),
    },
    {
      iconName: 'book-outline',
      labelKey: 'plan.title',
      action: () => navigation.navigate('PlanProduction'),
    },
    {
      iconName: 'stats-chart-outline',
      labelKey: 'RpV',
      action: () => navigation.navigate('ReportView'),
      hideForRoles: ['STAFF'],
    },
    {
      iconName: 'today-outline',
      labelKey: 'Dai',
      action: () => navigation.navigate('Daily'),
    },
    {
      iconName: 'time-outline',
      labelKey: 'Overtime',
      action: () => navigation.navigate('OvertimeConfirm'),
    },
  ];

  // Filter features based on user role
  const featuresData = allFeatures.filter(feature => {
    if (!feature.hideForRoles) return true;
    return !feature.hideForRoles.includes(USER_INFOR?.role);
  });

  const renderFeatureButton = (feature, index) => (
    <TouchableOpacity
      key={index}
      style={styles.featureButton}
      onPress={feature.action}>
      <Icon
        name={feature.iconName}
        size={26}
        color={THEME_COLOR_2}
        style={styles.featureIcon}
      />
      <Text style={styles.featureText}>{t(feature.labelKey)}</Text>
      <Icon
        name="chevron-forward-outline"
        size={22}
        color="#C7C7CC"
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  );

  const handleScroll = event => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const isScrollingDown = offsetY > 0;

    if (Platform.OS === 'ios') {
      // For iOS, we need to handle the scroll event differently
      if (isScrollingDown) {
        onScrollList({nativeEvent: {contentOffset: {y: offsetY}}});
      } else {
        onScrollList({nativeEvent: {contentOffset: {y: 0}}});
      }
    } else {
      // For Android, use the original scroll event
      onScrollList(event);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <Text style={styles.title}>{t('Fea')}</Text>
      </LinearGradient>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollViewContent}>
        {featuresData.map((feature, index) =>
          renderFeatureButton(feature, index),
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    marginRight: 15,
  },
  featureText: {
    flex: 1,
    fontSize: 17,
    color: TEXT_COLOR,
  },
  chevronIcon: {
    opacity: 0.5,
  },
});

export default FeatureTab;
