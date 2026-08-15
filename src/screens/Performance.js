/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const PERIOD = 'H1/2026';

const MOCK_KPIS = [
  {
    icon: 'construct-outline',
    labelKey: 'performance.kpi_productivity',
    target: 100,
    achieved: 86,
    color: '#4F46E5',
  },
  {
    icon: 'ribbon-outline',
    labelKey: 'performance.kpi_quality',
    target: 100,
    achieved: 93,
    color: '#10B981',
  },
  {
    icon: 'calendar-check-outline',
    labelKey: 'performance.kpi_attendance',
    target: 100,
    achieved: 97,
    color: '#0EA5E9',
  },
  {
    icon: 'people-outline',
    labelKey: 'performance.kpi_teamwork',
    target: 5,
    achieved: 4.2,
    color: '#F59E0B',
  },
];

const SELF_SCORE = [
  'performance.opt_1',
  'performance.opt_2',
  'performance.opt_3',
  'performance.opt_4',
  'performance.opt_5',
];

const RATE_DEFS = [
  {labelKey: 'performance.rate_progress', max: 5},
  {labelKey: 'performance.rate_quality', max: 5},
  {labelKey: 'performance.rate_attitude', max: 5},
];

const MOCK_MANAGER_NOTE = {
  name: 'Trần Thị Điều',
  role: 'Phó Tổng Giám đốc',
  text: 'performance.manager_comment',
};

const Performance = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [scores, setScores] = useState({
    progress: 0,
    quality: 0,
    attitude: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const setScore = (key, value) => setScores(prev => ({...prev, [key]: value}));

  const overall = Object.values(scores).length
    ? Math.round(
        (Object.values(scores).reduce((sum, v) => sum + v, 0) /
          (RATE_DEFS.length * 5)) *
          100,
      )
    : 0;

  const handleSubmit = () => {
    if (Object.values(scores).some(v => v === 0)) {
      Alert.alert(t('performance.title'), t('performance.rate_required'));
      return;
    }
    setSubmitted(true);
    Alert.alert(
      t('performance.submit_success_title'),
      t('performance.submit_success_msg'),
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header
        title={t('performance.title')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t('performance.period')}</Text>
          <Text style={styles.heroPeriod}>{PERIOD}</Text>
          <View style={styles.heroScoreRow}>
            <Text style={styles.heroScoreValue}>{overall}%</Text>
            <Text style={styles.heroScoreLabel}>
              {submitted
                ? t('performance.submitted')
                : t('performance.your_score')}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('performance.kpi')}
          </Text>
        </View>
        {MOCK_KPIS.map((kpi, index) => {
          const pct = Math.round((kpi.achieved / kpi.target) * 100);
          return (
            <View
              key={index}
              style={[
                styles.kpiCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <View style={styles.kpiHeader}>
                <View
                  style={[styles.kpiIcon, {backgroundColor: kpi.color + '22'}]}>
                  <Icon name={kpi.icon} size={20} color={kpi.color} />
                </View>
                <View style={styles.kpiInfo}>
                  <Text style={[styles.kpiLabel, {color: colors.text}]}>
                    {t(kpi.labelKey)}
                  </Text>
                  <Text style={[styles.kpiMeta, {color: colors.textSecondary}]}>
                    {kpi.achieved} / {kpi.target}
                  </Text>
                </View>
                <Text style={[styles.kpiValue, {color: kpi.color}]}>
                  {pct}%
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.trackFill,
                    {
                      backgroundColor: kpi.color,
                      width: `${Math.min(100, pct)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('performance.self_review')}
          </Text>
        </View>
        <View
          style={[
            styles.reviewCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          {RATE_DEFS.map((rate, index) => {
            const keys = ['progress', 'quality', 'attitude'];
            const selected = scores[keys[index]];
            return (
              <View
                key={index}
                style={[
                  styles.rateRow,
                  index < RATE_DEFS.length - 1 && styles.rateRowBorder,
                ]}>
                <Text style={[styles.rateLabel, {color: colors.text}]}>
                  {t(rate.labelKey)}
                </Text>
                <View style={styles.scoreRow}>
                  {SELF_SCORE.map((opt, i) => {
                    const s = i + 1;
                    const active = selected === s;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => setScore(keys[index], s)}
                        activeOpacity={0.8}
                        style={[
                          styles.scoreBtn,
                          {
                            backgroundColor: active
                              ? colors.primary
                              : colors.backgroundSecondary,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.scoreText,
                            {color: active ? '#fff' : colors.textSecondary},
                          ]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
          <TouchableOpacity
            style={[styles.submitBtn, {backgroundColor: colors.primary}]}
            onPress={handleSubmit}
            activeOpacity={0.85}>
            <Text style={styles.submitText}>{t('performance.submit')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('performance.manager_note')}
          </Text>
        </View>
        <View
          style={[
            styles.noteCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <View style={styles.noteHeader}>
            <View
              style={[
                styles.noteAvatar,
                {backgroundColor: colors.primaryLight},
              ]}>
              <Text style={[styles.noteInitial, {color: colors.primary}]}>
                {MOCK_MANAGER_NOTE.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.noteIdentity}>
              <Text style={[styles.noteName, {color: colors.text}]}>
                {MOCK_MANAGER_NOTE.name}
              </Text>
              <Text style={[styles.noteRole, {color: colors.textSecondary}]}>
                {MOCK_MANAGER_NOTE.role}
              </Text>
            </View>
          </View>
          <Text style={[styles.noteText, {color: colors.textSecondary}]}>
            {t(MOCK_MANAGER_NOTE.text)}
          </Text>
        </View>

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('performance.pending')}
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
  heroPeriod: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
    gap: 8,
  },
  heroScoreValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  heroScoreLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
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
  kpiCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 10,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kpiInfo: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  kpiMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 16,
  },
  rateRow: {
    paddingVertical: 10,
  },
  rateRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 12,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  noteCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  noteInitial: {
    fontSize: 15,
    fontWeight: '700',
  },
  noteIdentity: {
    flex: 1,
  },
  noteName: {
    fontSize: 14,
    fontWeight: '700',
  },
  noteRole: {
    fontSize: 12,
    marginTop: 2,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
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

export default Performance;
