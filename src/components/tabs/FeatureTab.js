/* eslint-disable no-unused-vars */
import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import i18next from '../../../services/i18next';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {useTheme} from '../../hooks/useTheme';
import SectionHeader from '../common/SectionHeader';

const {width} = Dimensions.get('window');

const CATEGORY_ORDER = ['hrm', 'attendance', 'work', 'admin', 'other'];

const ROLE_LEVELS = {STAFF: 0, LEADER: 1, MANAGER: 2, ADMIN: 3};

const FeatureTab = ({onScrollList}) => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const {t} = useTranslation();
  const {colors} = useTheme();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
  }, []);

  const allFeatures = useMemo(
    () => [
      {
        iconName: 'calendar-clear-outline',
        labelKey: 'schedule.title',
        category: 'hrm',
        action: () => navigation.navigate('Schedule'),
        gradient: ['#4facfe', '#00f2fe'],
        iconColor: '#4facfe',
      },
      {
        iconName: 'id-card-outline',
        labelKey: 'idcard.title',
        category: 'hrm',
        action: () => navigation.navigate('IDCard'),
        gradient: ['#43e97b', '#38f9d7'],
        iconColor: '#43e97b',
      },
      {
        iconName: 'people-outline',
        labelKey: 'directory.title',
        category: 'hrm',
        action: () => navigation.navigate('Directory'),
        gradient: ['#a18aff', '#ff8a80'],
        iconColor: '#a18aff',
      },
      {
        iconName: 'document-text-outline',
        labelKey: 'docs.title',
        category: 'hrm',
        action: () => navigation.navigate('Docs'),
        gradient: ['#ffecd2', '#fcb69f'],
        iconColor: '#fcb69f',
      },
      {
        iconName: 'trending-up-outline',
        labelKey: 'salarytrend.title',
        category: 'hrm',
        action: () => navigation.navigate('SalaryTrend'),
        gradient: ['#ffd89b', '#19547b'],
        iconColor: '#ffd89b',
      },
      {
        iconName: 'school-outline',
        labelKey: 'learning.title',
        category: 'hrm',
        action: () => navigation.navigate('Learning'),
        gradient: ['#f093fb', '#f5576c'],
        iconColor: '#f5576c',
      },
      {
        iconName: 'receipt-outline',
        labelKey: 'paysliph.title',
        category: 'hrm',
        action: () => navigation.navigate('PayslipHistory'),
        gradient: ['#43e97b', '#38f9d7'],
        iconColor: '#43e97b',
      },
      {
        iconName: 'analytics-outline',
        labelKey: 'attsum.title',
        category: 'hrm',
        action: () => navigation.navigate('AttendanceSummary'),
        gradient: ['#4facfe', '#00f2fe'],
        iconColor: '#4facfe',
      },
      {
        iconName: 'chatbox-ellipses-outline',
        labelKey: 'survey.title',
        category: 'hrm',
        action: () => navigation.navigate('Survey'),
        gradient: ['#ff9a9e', '#fecfef'],
        iconColor: '#ff9a9e',
      },
      {
        iconName: 'gift-outline',
        labelKey: 'benefits.title',
        category: 'hrm',
        action: () => navigation.navigate('Benefits'),
        gradient: ['#ffd89b', '#19547b'],
        iconColor: '#ffd89b',
      },
      {
        iconName: 'git-network-outline',
        labelKey: 'orgchart.title',
        category: 'hrm',
        action: () => navigation.navigate('OrgChart'),
        gradient: ['#0ba360', '#3cba92'],
        iconColor: '#0ba360',
      },
      {
        iconName: 'ribbon-outline',
        labelKey: 'performance.title',
        category: 'hrm',
        action: () => navigation.navigate('Performance'),
        gradient: ['#ff512f', '#f09819'],
        iconColor: '#f09819',
      },
      {
        iconName: 'person-add-outline',
        labelKey: 'referral.title',
        category: 'hrm',
        action: () => navigation.navigate('Referral'),
        gradient: ['#7f00ff', '#e100ff'],
        iconColor: '#e100ff',
      },
      {
        iconName: 'swap-horizontal-outline',
        labelKey: 'shiftswap.title',
        category: 'hrm',
        action: () => navigation.navigate('ShiftSwap'),
        gradient: ['#00c6ff', '#0072ff'],
        iconColor: '#0072ff',
      },
      {
        iconName: 'cube-outline',
        labelKey: 'asset.title',
        category: 'hrm',
        action: () => navigation.navigate('Asset'),
        gradient: ['#2b5876', '#4e4376'],
        iconColor: '#4e4376',
      },
      {
        iconName: 'checkmark-done-outline',
        labelKey: 'approval.title',
        category: 'hrm',
        action: () => navigation.navigate('Approvals'),
        minRole: 'LEADER',
        gradient: ['#11998e', '#38ef7d'],
        iconColor: '#38ef7d',
      },
      {
        iconName: 'clipboard-outline',
        labelKey: 'inventory',
        category: 'work',
        action: () => navigation.navigate('Report'),
        gradient: ['#667eea', '#764ba2'],
        iconColor: '#667eea',
      },
      {
        iconName: 'restaurant-outline',
        labelKey: 'or',
        category: 'work',
        action: () => navigation.navigate('Order'),
        gradient: ['#f093fb', '#f5576c'],
        iconColor: '#f5576c',
      },
      {
        iconName: 'logo-octocat',
        labelKey: 'Ai',
        category: 'other',
        action: () => navigation.navigate('Ai'),
        minRole: 'LEADER',
        gradient: ['#4facfe', '#00f2fe'],
        iconColor: '#4facfe',
      },
      {
        iconName: 'mic-outline',
        labelKey: 'translator.title',
        category: 'other',
        action: () => navigation.navigate('Translator'),
        gradient: ['#f857a6', '#ff5858'],
        iconColor: '#f857a6',
      },
      {
        iconName: 'shirt-outline',
        labelKey: 'Mk',
        category: 'admin',
        action: () => navigation.navigate('Uniform', {USER_INFOR: USER_INFOR}),
        gradient: ['#43e97b', '#38f9d7'],
        iconColor: '#43e97b',
      },
      {
        iconName: 'calendar-outline',
        labelKey: 'Lea',
        category: 'attendance',
        action: () => navigation.navigate('Leave'),
        gradient: ['#fa709a', '#fee140'],
        iconColor: '#fa709a',
      },
      {
        iconName: 'cloud-upload-outline',
        labelKey: 'Up',
        category: 'work',
        action: () => navigation.navigate('Upload'),
        minRole: 'LEADER',
        gradient: ['#a8edea', '#fed6e3'],
        iconColor: '#a8edea',
      },
      {
        iconName: 'book-outline',
        labelKey: 'plan.title',
        category: 'work',
        action: () => navigation.navigate('PlanProduction'),
        gradient: ['#ffecd2', '#fcb69f'],
        iconColor: '#fcb69f',
      },
      {
        iconName: 'stats-chart-outline',
        labelKey: 'RpV',
        category: 'work',
        action: () => navigation.navigate('ReportView'),
        minRole: 'LEADER',
        gradient: ['#ff9a9e', '#fecfef'],
        iconColor: '#ff9a9e',
      },
      {
        iconName: 'today-outline',
        labelKey: 'Dai',
        category: 'work',
        action: () => navigation.navigate('Daily'),
        gradient: ['#a18aff', '#ff8a80'],
        iconColor: '#a18aff',
      },
      {
        iconName: 'time-outline',
        labelKey: 'Overtime',
        category: 'attendance',
        action: () => navigation.navigate('OvertimeConfirm'),
        gradient: ['#ff6b6b', '#ffa726'],
        iconColor: '#ff6b6b',
      },
      {
        iconName: 'star-outline',
        labelKey: 'is_impor',
        category: 'admin',
        action: () =>
          navigation.navigate('Important', {USER_INFOR: USER_INFOR}),
        minRole: 'LEADER',
        gradient: ['#ffd89b', '#19547b'],
        iconColor: '#ffd89b',
      },
    ],
    [USER_INFOR, navigation],
  );

  const groupedFeatures = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const userRoleLevel =
      ROLE_LEVELS[String(USER_INFOR?.role || '').toUpperCase()] ?? 0;
    const filtered = allFeatures.filter(feature => {
      if (feature.minRole) {
        const minLevel = ROLE_LEVELS[feature.minRole] ?? 0;
        if (userRoleLevel < minLevel) {
          return false;
        }
      }
      if (query && !t(feature.labelKey).toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
    return CATEGORY_ORDER.map(category => ({
      category,
      features: filtered.filter(f => f.category === category),
    })).filter(group => group.features.length > 0);
  }, [allFeatures, searchText, USER_INFOR?.role, t]);

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
            <Icon name={feature.iconName} size={24} color="#fff" />
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
        colors={colors.primaryGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('Fea')}</Text>
          <Text style={styles.subtitle}>{t('feat.subtitle')}</Text>
        </View>
      </LinearGradient>

      <View
        style={[
          styles.searchWrap,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        <Icon name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, {color: colors.text}]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('feat.search_placeholder')}
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchText !== '' ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {groupedFeatures.map(group => (
          <View style={styles.groupContainer} key={group.category}>
            <SectionHeader title={t(`feat.cat.${group.category}`)} />
            <View style={styles.featuresGrid}>
              {group.features.map((feature, index) =>
                renderFeatureButton(feature, index),
              )}
            </View>
          </View>
        ))}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  groupContainer: {
    marginTop: 16,
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
