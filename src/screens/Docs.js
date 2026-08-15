import React from 'react';
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

const DOCS = [
  {
    icon: 'shield-checkmark-outline',
    labelKey: 'docs.hr_policy',
    gradient: ['#4F46E5', '#7C3AED'],
  },
  {
    icon: 'book-outline',
    labelKey: 'docs.handbook',
    gradient: ['#0EA5E9', '#6366F1'],
  },
  {
    icon: 'hard-hat-outline',
    labelKey: 'docs.safety',
    gradient: ['#F59E0B', '#EF4444'],
  },
  {
    icon: 'construct-outline',
    labelKey: 'docs.procedure',
    gradient: ['#10B981', '#0EA5E9'],
  },
];

const Docs = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('docs.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={[styles.introTitle, {color: colors.text}]}>
            {t('docs.subtitle')}
          </Text>
          <Text style={[styles.introSub, {color: colors.textSecondary}]}>
            {t('docs.pending')}
          </Text>
        </View>

        {DOCS.map((doc, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            style={[
              styles.docRow,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <LinearGradient
              colors={doc.gradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.docIcon}>
              <Icon name={doc.icon} size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.docInfo}>
              <Text style={[styles.docName, {color: colors.text}]}>
                {t(doc.labelKey)}
              </Text>
              <View
                style={[styles.badge, {backgroundColor: colors.primaryLight}]}>
                <Text style={[styles.badgeText, {color: colors.primary}]}>
                  {t('docs.pending')}
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
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
  introCard: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  introSub: {
    fontSize: 13,
    marginTop: 4,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 10,
  },
  docIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default Docs;
