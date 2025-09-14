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
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import i18next from '../../../services/i18next';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

const {width} = Dimensions.get('window');

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
      gradient: ['#667eea', '#764ba2'],
      iconColor: '#667eea',
    },
    {
      iconName: 'restaurant-outline',
      labelKey: 'or',
      action: () => navigation.navigate('Order'),
      gradient: ['#f093fb', '#f5576c'],
      iconColor: '#f5576c',
    },
    {
      iconName: 'logo-octocat',
      labelKey: 'Ai',
      action: () => navigation.navigate('Ai'),
      hideForRoles: ['STAFF'],
      gradient: ['#4facfe', '#00f2fe'],
      iconColor: '#4facfe',
    },
    {
      iconName: 'shirt-outline',
      labelKey: 'Mk',
      action: () => navigation.navigate('Uniform', {USER_INFOR: USER_INFOR}),
      gradient: ['#43e97b', '#38f9d7'],
      iconColor: '#43e97b',
    },
    {
      iconName: 'calendar-outline',
      labelKey: 'Lea',
      action: () => navigation.navigate('Leave'),
      gradient: ['#fa709a', '#fee140'],
      iconColor: '#fa709a',
    },
    {
      iconName: 'cloud-upload-outline',
      labelKey: 'Up',
      action: () => navigation.navigate('Upload'),
      gradient: ['#a8edea', '#fed6e3'],
      iconColor: '#a8edea',
    },
    {
      iconName: 'book-outline',
      labelKey: 'plan.title',
      action: () => navigation.navigate('PlanProduction'),
      gradient: ['#ffecd2', '#fcb69f'],
      iconColor: '#fcb69f',
    },
    {
      iconName: 'stats-chart-outline',
      labelKey: 'RpV',
      action: () => navigation.navigate('ReportView'),
      hideForRoles: ['STAFF'],
      gradient: ['#ff9a9e', '#fecfef'],
      iconColor: '#ff9a9e',
    },
    {
      iconName: 'today-outline',
      labelKey: 'Dai',
      action: () => navigation.navigate('Daily'),
      gradient: ['#a18aff', '#ff8a80'],
      iconColor: '#a18aff',
    },
    {
      iconName: 'time-outline',
      labelKey: 'Overtime',
      action: () => navigation.navigate('OvertimeConfirm'),
      gradient: ['#ff6b6b', '#ffa726'],
      iconColor: '#ff6b6b',
    },
    {
      iconName: 'star-outline',
      labelKey: 'is_impor',
      action: () => navigation.navigate('Important', {USER_INFOR: USER_INFOR}),
      gradient: ['#ffd89b', '#19547b'],
      iconColor: '#ffd89b',
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
      onPress={feature.action}
      activeOpacity={0.8}>
      <LinearGradient
        colors={feature.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.featureGradient}>
        <View style={styles.featureContent}>
          <View style={styles.iconContainer}>
            <Icon
              name={feature.iconName}
              size={24}
              color="#fff"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.featureText}>{t(feature.labelKey)}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Icon
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        </View>
      </LinearGradient>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('Fea')}</Text>
          <Text style={styles.subtitle}>Chọn tính năng bạn muốn sử dụng</Text>
        </View>
      </LinearGradient>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.featuresGrid}>
          {featuresData.map((feature, index) =>
            renderFeatureButton(feature, index),
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  featuresGrid: {
    paddingTop: 4,
  },
  featureButton: {
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  featureGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  arrowContainer: {
    width: 22,
    alignItems: 'center',
  },
});

export default FeatureTab;
