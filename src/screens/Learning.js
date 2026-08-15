import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const MOCK_COURSES = [
  {
    icon: 'construct-outline',
    titleKey: 'learning.c_skill',
    lessons: 6,
    done: 4,
    gradient: ['#4F46E5', '#7C3AED'],
  },
  {
    icon: 'hard-hat-outline',
    titleKey: 'learning.c_safety',
    lessons: 4,
    done: 4,
    gradient: ['#F59E0B', '#EF4444'],
  },
  {
    icon: 'ribbon-outline',
    titleKey: 'learning.c_quality',
    lessons: 5,
    done: 2,
    gradient: ['#0EA5E9', '#6366F1'],
  },
  {
    icon: 'school-outline',
    titleKey: 'learning.c_orientation',
    lessons: 3,
    done: 0,
    gradient: ['#10B981', '#0EA5E9'],
  },
];

const Learning = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();

  const totalDone = MOCK_COURSES.reduce((sum, c) => sum + c.done, 0);
  const totalLessons = MOCK_COURSES.reduce((sum, c) => sum + c.lessons, 0);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('learning.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t('learning.subtitle')}</Text>
          <View style={styles.heroStatRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{totalDone}</Text>
              <Text style={styles.heroStatLabel}>
                {t('learning.completed')}
              </Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{totalLessons}</Text>
              <Text style={styles.heroStatLabel}>{t('learning.lessons')}</Text>
            </View>
          </View>
          <View style={styles.heroProgressTrack}>
            <View
              style={[
                styles.heroProgressFill,
                {width: `${(totalDone / totalLessons) * 100}%`},
              ]}
            />
          </View>
          <Text style={styles.heroProgressText}>
            {totalDone}/{totalLessons}
          </Text>
        </LinearGradient>

        {MOCK_COURSES.map((course, index) => {
          const progress = Math.round((course.done / course.lessons) * 100);
          const completed = course.done === course.lessons;
          return (
            <View
              key={index}
              style={[
                styles.courseCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <LinearGradient
                colors={course.gradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.courseIcon}>
                <Icon name={course.icon} size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.courseBody}>
                <View style={styles.courseTitleRow}>
                  <Text
                    style={[styles.courseTitle, {color: colors.text}]}
                    numberOfLines={1}>
                    {t(course.titleKey)}
                  </Text>
                  {completed ? (
                    <View
                      style={[styles.badge, {backgroundColor: colors.success}]}>
                      <Text style={styles.badgeText}>
                        {t('learning.completed')}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={[styles.courseMeta, {color: colors.textSecondary}]}>
                  {course.lessons} {t('learning.lessons')}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {backgroundColor: colors.primary, width: `${progress}%`},
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, {color: colors.textSecondary}]}>
                  {course.done}/{course.lessons}
                </Text>
              </View>
            </View>
          );
        })}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('learning.pending')}
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
  heroCard: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  heroProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  heroProgressText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'right',
  },
  courseCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 10,
  },
  courseIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  courseBody: {
    flex: 1,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  courseMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
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

export default Learning;
