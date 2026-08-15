import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const MOCK_MONTHS = [
  {label: 'T3', value: 9200000},
  {label: 'T4', value: 9800000},
  {label: 'T5', value: 9500000},
  {label: 'T6', value: 10500000},
  {label: 'T7', value: 10100000},
  {label: 'T8', value: 11200000},
];

const vnd = value =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const SalaryTrend = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();

  const max = Math.max(...MOCK_MONTHS.map(m => m.value));
  const latest = MOCK_MONTHS[MOCK_MONTHS.length - 1].value;
  const avg =
    MOCK_MONTHS.reduce((sum, m) => sum + m.value, 0) / MOCK_MONTHS.length;
  const bonus = Math.round(latest * 0.15);

  const summary = [
    {
      icon: 'trending-up-outline',
      label: t('home.checked_in'),
      value: vnd(avg),
      color: '#4F46E5',
    },
    {
      icon: 'cash-outline',
      label: t('salarytrend.title'),
      value: vnd(latest),
      color: '#10B981',
    },
    {
      icon: 'gift-outline',
      label: t('salarytrend.bonus'),
      value: vnd(bonus),
      color: '#F59E0B',
    },
  ];

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header
        title={t('salarytrend.title')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          {summary.map((item, index) => (
            <View
              key={index}
              style={[
                styles.summaryCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <View
                style={[
                  styles.summaryIcon,
                  {backgroundColor: item.color + '22'},
                ]}>
                <Icon name={item.icon} size={20} color={item.color} />
              </View>
              <Text
                style={[styles.summaryLabel, {color: colors.textSecondary}]}>
                {item.label}
              </Text>
              <Text
                style={[styles.summaryValue, {color: colors.text}]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Chart card */}
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{t('salarytrend.title')}</Text>
            <Text style={styles.chartSub}>3 — 8</Text>
          </View>
          <View style={styles.chart}>
            {MOCK_MONTHS.map((month, index) => {
              const height = Math.round((month.value / max) * 120);
              const isLast = index === MOCK_MONTHS.length - 1;
              return (
                <View key={index} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      isLast ? styles.barHighlight : styles.barDefault,
                      {height},
                    ]}
                  />
                  <Text style={styles.barLabel}>{month.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartNote}>
            <Icon
              name="information-circle-outline"
              size={16}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.chartNoteText}>{t('salarytrend.pending')}</Text>
          </View>
        </LinearGradient>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  chartCard: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  chartSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 22,
    borderRadius: 8,
    minHeight: 8,
  },
  barDefault: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  barHighlight: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  barLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  chartNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  chartNoteText: {
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SalaryTrend;
