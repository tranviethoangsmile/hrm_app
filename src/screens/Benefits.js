import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const MOCK_BENEFITS = [
  {
    icon: 'shield-checkmark-outline',
    titleKey: 'benefits.b_insurance',
    descKey: 'benefits.d_insurance',
    gradient: ['#4F46E5', '#7C3AED'],
  },
  {
    icon: 'umbrella-outline',
    titleKey: 'benefits.b_annual',
    descKey: 'benefits.d_annual',
    gradient: ['#0EA5E9', '#6366F1'],
  },
  {
    icon: 'medkit-outline',
    titleKey: 'benefits.b_checkup',
    descKey: 'benefits.d_checkup',
    gradient: ['#10B981', '#0EA5E9'],
  },
  {
    icon: 'gift-outline',
    titleKey: 'benefits.b_tet',
    descKey: 'benefits.d_tet',
    gradient: ['#F59E0B', '#EF4444'],
  },
  {
    icon: 'school-outline',
    titleKey: 'benefits.b_training',
    descKey: 'benefits.d_training',
    gradient: ['#EC4899', '#F59E0B'],
  },
  {
    icon: 'restaurant-outline',
    titleKey: 'benefits.b_meal',
    descKey: 'benefits.d_meal',
    gradient: ['#22C55E', '#84CC16'],
  },
];

const Benefits = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('benefits.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {t('benefits.subtitle')}
        </Text>

        {MOCK_BENEFITS.map((benefit, index) => {
          const open = openIndex === index;
          return (
            <View
              key={index}
              style={[
                styles.card,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setOpenIndex(open ? null : index)}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={benefit.gradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.cardIcon}>
                  <Icon name={benefit.icon} size={22} color="#fff" />
                </LinearGradient>
                <Text
                  style={[styles.cardTitle, {color: colors.text}]}
                  numberOfLines={2}>
                  {t(benefit.titleKey)}
                </Text>
                <Icon
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
              {open ? (
                <View style={styles.cardBody}>
                  <Text
                    style={[styles.cardDesc, {color: colors.textSecondary}]}>
                    {t(benefit.descKey)}
                  </Text>
                  <Text style={[styles.readMore, {color: colors.primary}]}>
                    {t('benefits.read_more')} ›
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('benefits.pending')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Benefits;
