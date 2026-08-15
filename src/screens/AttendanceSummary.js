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

const MOCK_SUMMARIES = [
  {
    month: '08/2026',
    workDays: 21,
    otHours: 14.5,
    late: 2,
    leaves: 2,
    weeks: [
      {label: 'Tuần 1', worked: 5, ot: 2, late: 0, leave: 0},
      {label: 'Tuần 2', worked: 5, ot: 3.5, late: 1, leave: 1},
      {label: 'Tuần 3', worked: 5, ot: 4, late: 0, leave: 0},
      {label: 'Tuần 4', worked: 5, ot: 5, late: 0, leave: 0},
      {label: 'Tuần 5', worked: 1, ot: 0, late: 1, leave: 1},
    ],
  },
  {
    month: '07/2026',
    workDays: 23,
    otHours: 10,
    late: 4,
    leaves: 1,
    weeks: [
      {label: 'Tuần 1', worked: 6, ot: 2.5, late: 1, leave: 0},
      {label: 'Tuần 2', worked: 6, ot: 3, late: 1, leave: 0},
      {label: 'Tuần 3', worked: 6, ot: 3.5, late: 1, leave: 1},
      {label: 'Tuần 4', worked: 5, ot: 1, late: 1, leave: 0},
    ],
  },
  {
    month: '06/2026',
    workDays: 22,
    otHours: 8,
    late: 1,
    leaves: 0,
    weeks: [
      {label: 'Tuần 1', worked: 5, ot: 1.5, late: 0, leave: 0},
      {label: 'Tuần 2', worked: 6, ot: 2, late: 0, leave: 0},
      {label: 'Tuần 3', worked: 6, ot: 2.5, late: 0, leave: 0},
      {label: 'Tuần 4', worked: 5, ot: 2, late: 1, leave: 0},
    ],
  },
];

const AttendanceSummary = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [index, setIndex] = useState(0);

  const data = MOCK_SUMMARIES[index];

  const stats = [
    {
      icon: 'calendar-check-outline',
      label: t('attsum.work_days'),
      value: String(data.workDays),
      color: '#4F46E5',
    },
    {
      icon: 'time-outline',
      label: t('attsum.overtime'),
      value: `${data.otHours}h`,
      color: '#F59E0B',
    },
    {
      icon: 'alert-circle-outline',
      label: t('attsum.late'),
      value: String(data.late),
      color: '#EF4444',
    },
    {
      icon: 'bed-outline',
      label: t('attsum.leaves'),
      value: String(data.leaves),
      color: '#10B981',
    },
  ];

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('attsum.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity
              style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
              onPress={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              activeOpacity={0.8}>
              <Icon name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{data.month}</Text>
            <TouchableOpacity
              style={[
                styles.navBtn,
                index === MOCK_SUMMARIES.length - 1 && styles.navBtnDisabled,
              ]}
              onPress={() =>
                setIndex(Math.min(MOCK_SUMMARIES.length - 1, index + 1))
              }
              disabled={index === MOCK_SUMMARIES.length - 1}
              activeOpacity={0.8}>
              <Icon name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <View
                style={[styles.statIcon, {backgroundColor: stat.color + '22'}]}>
                <Icon name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, {color: colors.text}]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('attsum.breakdown')}
          </Text>
        </View>
        <View
          style={[
            styles.breakdownCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <View style={styles.breakdownHeader}>
            <Text
              style={[
                styles.breakdownHeadLabel,
                {color: colors.textSecondary},
              ]}>
              {data.month}
            </Text>
            <Text
              style={[
                styles.breakdownHeadLabel,
                {color: colors.textSecondary},
              ]}>
              {t('attsum.work_days')}
            </Text>
            <Text
              style={[
                styles.breakdownHeadLabel,
                {color: colors.textSecondary},
              ]}>
              {t('attsum.overtime')}
            </Text>
            <Text
              style={[
                styles.breakdownHeadLabel,
                {color: colors.textSecondary},
              ]}>
              {t('attsum.late')}
            </Text>
            <Text
              style={[
                styles.breakdownHeadLabel,
                {color: colors.textSecondary},
              ]}>
              {t('attsum.leaves')}
            </Text>
          </View>
          {data.weeks.map((week, i) => (
            <View
              key={i}
              style={[
                styles.breakdownRow,
                i < data.weeks.length - 1 && styles.breakdownRowBorder,
              ]}>
              <Text style={[styles.breakdownLabel, {color: colors.text}]}>
                {week.label}
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {week.worked}
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {week.ot}h
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {week.late}
              </Text>
              <Text style={[styles.breakdownValue, {color: colors.text}]}>
                {week.leave}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('attsum.pending')}
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
    paddingHorizontal: 16,
    paddingVertical: 26,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  monthText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionLabelWrap: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  breakdownCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  breakdownHeadLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AttendanceSummary;
