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
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const vnd = value =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const MOCK_MONTHS = [
  {
    id: 1,
    month: '08/2026',
    gross: 11200000,
    net: 9830000,
    paid: true,
    earnings: [
      ['paysliph.base', 9500000],
      ['paysliph.allowance', 500000],
      ['paysliph.overtime', 1200000],
    ],
    deductions: [
      ['paysliph.si', 1104000],
      ['paysliph.hi', 166000],
      ['paysliph.ei', 166000],
      ['paysliph.tax', 0],
    ],
  },
  {
    id: 2,
    month: '07/2026',
    gross: 10100000,
    net: 8900000,
    paid: true,
    earnings: [
      ['paysliph.base', 9500000],
      ['paysliph.allowance', 500000],
      ['paysliph.overtime', 600000],
    ],
    deductions: [
      ['paysliph.si', 1004000],
      ['paysliph.hi', 151000],
      ['paysliph.ei', 151000],
      ['paysliph.tax', 0],
    ],
  },
  {
    id: 3,
    month: '06/2026',
    gross: 10500000,
    net: 9220000,
    paid: true,
    earnings: [
      ['paysliph.base', 9500000],
      ['paysliph.allowance', 500000],
      ['paysliph.bonus', 500000],
    ],
    deductions: [
      ['paysliph.si', 1044000],
      ['paysliph.hi', 157000],
      ['paysliph.ei', 157000],
      ['paysliph.tax', 0],
    ],
  },
  {
    id: 4,
    month: '05/2026',
    gross: 9500000,
    net: 8380000,
    paid: true,
    earnings: [
      ['paysliph.base', 9000000],
      ['paysliph.allowance', 500000],
    ],
    deductions: [
      ['paysliph.si', 950000],
      ['paysliph.hi', 142500],
      ['paysliph.ei', 142500],
      ['paysliph.tax', 0],
    ],
  },
  {
    id: 5,
    month: '04/2026',
    gross: 9200000,
    net: 8120000,
    paid: true,
    earnings: [
      ['paysliph.base', 8700000],
      ['paysliph.allowance', 500000],
    ],
    deductions: [
      ['paysliph.si', 920000],
      ['paysliph.hi', 138000],
      ['paysliph.ei', 138000],
      ['paysliph.tax', 0],
    ],
  },
  {
    id: 6,
    month: '03/2026',
    gross: 9200000,
    net: 8120000,
    paid: false,
    earnings: [
      ['paysliph.base', 8700000],
      ['paysliph.allowance', 500000],
    ],
    deductions: [
      ['paysliph.si', 920000],
      ['paysliph.hi', 138000],
      ['paysliph.ei', 138000],
      ['paysliph.tax', 0],
    ],
  },
];

const PayslipHistory = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [expandedId, setExpandedId] = useState(null);

  const toggle = id => setExpandedId(expandedId === id ? null : id);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('paysliph.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {MOCK_MONTHS.map(item => {
          const expanded = expandedId === item.id;
          const earnings = item.earnings.reduce((s, r) => s + r[1], 0);
          const deductions = item.deductions.reduce((s, r) => s + r[1], 0);
          return (
            <View
              key={item.id}
              style={[
                styles.card,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggle(item.id)}
                activeOpacity={0.8}>
                <View style={styles.monthWrap}>
                  <Text style={[styles.month, {color: colors.text}]}>
                    {item.month}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.paid
                          ? colors.success
                          : colors.warning,
                      },
                    ]}>
                    <Text style={styles.statusText}>
                      {t(item.paid ? 'paysliph.paid' : 'paysliph.pending')}
                    </Text>
                  </View>
                </View>
                <View style={styles.miniStats}>
                  <View style={styles.miniStat}>
                    <Text
                      style={[
                        styles.miniStatLabel,
                        {color: colors.textSecondary},
                      ]}>
                      {t('paysliph.gross')}
                    </Text>
                    <Text style={[styles.miniStatValue, {color: colors.text}]}>
                      {vnd(item.gross)}
                    </Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text
                      style={[
                        styles.miniStatLabel,
                        {color: colors.textSecondary},
                      ]}>
                      {t('paysliph.net')}
                    </Text>
                    <Text
                      style={[styles.miniStatValue, {color: colors.primary}]}>
                      {vnd(item.net)}
                    </Text>
                  </View>
                </View>
                <Icon
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>

              {expanded ? (
                <View style={styles.detail}>
                  <View style={styles.detailColumn}>
                    <Text style={[styles.detailTitle, {color: colors.primary}]}>
                      {t('paysliph.earnings')}
                    </Text>
                    {item.earnings.map(([key, value], index) => (
                      <View key={index} style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            {color: colors.textSecondary},
                          ]}>
                          {t(key)}
                        </Text>
                        <Text
                          style={[styles.detailValue, {color: colors.text}]}>
                          {vnd(value)}
                        </Text>
                      </View>
                    ))}
                    <View
                      style={[
                        styles.detailTotal,
                        {borderTopColor: colors.border},
                      ]}>
                      <Text style={[styles.detailLabel, {color: colors.text}]}>
                        {t('paysliph.earnings')}
                      </Text>
                      <Text
                        style={[styles.detailTotalValue, {color: colors.text}]}>
                        {vnd(earnings)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailColumn}>
                    <Text style={[styles.detailTitle, {color: colors.danger}]}>
                      {t('paysliph.deductions')}
                    </Text>
                    {item.deductions.map(([key, value], index) => (
                      <View key={index} style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            {color: colors.textSecondary},
                          ]}>
                          {t(key)}
                        </Text>
                        <Text
                          style={[styles.detailValue, {color: colors.text}]}>
                          {vnd(value)}
                        </Text>
                      </View>
                    ))}
                    <View
                      style={[
                        styles.detailTotal,
                        {borderTopColor: colors.border},
                      ]}>
                      <Text style={[styles.detailLabel, {color: colors.text}]}>
                        {t('paysliph.deductions')}
                      </Text>
                      <Text
                        style={[
                          styles.detailTotalValue,
                          {color: colors.danger},
                        ]}>
                        -{vnd(deductions)}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('paysliph.detail_pending')}
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
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthWrap: {
    flex: 1,
  },
  month: {
    fontSize: 17,
    fontWeight: '800',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  miniStats: {
    flexDirection: 'row',
    gap: 14,
    marginRight: 10,
  },
  miniStat: {
    alignItems: 'flex-end',
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  miniStatValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  detail: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },
  detailColumn: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    marginTop: 6,
    paddingTop: 6,
  },
  detailTotalValue: {
    fontSize: 12,
    fontWeight: '800',
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

export default PayslipHistory;
