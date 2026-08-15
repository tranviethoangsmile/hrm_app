/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const WEEK_DAYS_KEY = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MOCK_COLLEAGUES = [
  {id: 1, name: 'Nguyễn Văn A', shift: 'A', team: 'Sản xuất Kim loại'},
  {id: 2, name: 'Trần Thị B', shift: 'B', team: 'Sản xuất Kim loại'},
  {id: 3, name: 'Lê Văn C', shift: 'A', team: 'Kỹ thuật & QC'},
  {id: 4, name: 'Phạm Văn D', shift: 'B', team: 'Kỹ thuật & QC'},
];

const CaCircle = ({ca, size, letter = false, colors}) => {
  const isA = ca === 'A';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: isA ? colors.textSecondary : colors.primary,
        backgroundColor: isA ? 'transparent' : colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {letter ? (
        <Text
          style={{
            fontSize: size * 0.5,
            fontWeight: '800',
            color: isA ? colors.textSecondary : '#ffffff',
          }}>
          {ca}
        </Text>
      ) : null}
    </View>
  );
};

const ShiftSwap = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();

  const weekDays = Array.from({length: 7}, (_, i) =>
    moment().startOf('isoWeek').add(i, 'days'),
  );
  const todayIndex = (moment().day() + 6) % 7;

  const [selectedDate, setSelectedDate] = useState(todayIndex);
  const [targetShift, setTargetShift] = useState('day');
  const [colleagueId, setColleagueId] = useState(null);
  const [reason, setReason] = useState('');

  const isOff = day => day.day() === 0 || day.day() === 6;

  const handleSubmit = () => {
    if (colleagueId == null) {
      Alert.alert(t('shiftswap.submit_btn'), t('shiftswap.required_colleague'));
      return;
    }
    Alert.alert(
      t('shiftswap.submit_success_title'),
      t('shiftswap.submit_success_msg'),
    );
    setReason('');
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('shiftswap.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.heroTitle}>{t('shiftswap.title')}</Text>
          <Text style={styles.heroSub}>{t('shiftswap.subtitle')}</Text>
        </LinearGradient>

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('shiftswap.this_week')}
          </Text>
        </View>
        <View style={styles.weekRow}>
          {weekDays.map((day, index) => {
            const selected = selectedDate === index;
            const off = isOff(day);
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setSelectedDate(index)}
                disabled={off}
                style={[
                  styles.dayChip,
                  off && {opacity: 0.4},
                  selected && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                  },
                  off && {
                    borderColor: 'rgba(255,59,48,0.35)',
                    backgroundColor: 'rgba(255,59,48,0.08)',
                  },
                  {borderColor: colors.border},
                ]}>
                <Text
                  style={[
                    styles.dayLabel,
                    {color: off ? colors.danger : colors.textSecondary},
                  ]}>
                  {t(WEEK_DAYS_KEY[day.day()])}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    {color: selected ? colors.primary : colors.text},
                  ]}>
                  {day.format('D')}
                </Text>
                {off ? (
                  <View style={styles.dayIndicators}>
                    <View
                      style={[styles.redDot, {backgroundColor: colors.danger}]}
                    />
                  </View>
                ) : (
                  <View style={styles.dayIndicators}>
                    <CaCircle
                      ca={index % 2 ? 'A' : 'B'}
                      size={11}
                      colors={colors}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('shiftswap.choose_shift')}
          </Text>
        </View>
        <View
          style={[
            styles.segment,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              targetShift === 'day' && {backgroundColor: colors.primary},
            ]}
            onPress={() => setTargetShift('day')}
            activeOpacity={0.8}>
            <Icon
              name="sunny-outline"
              size={16}
              color={targetShift === 'day' ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                {color: targetShift === 'day' ? '#fff' : colors.textSecondary},
              ]}>
              {t('shiftswap.day_shift')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              targetShift === 'night' && {backgroundColor: colors.primary},
            ]}
            onPress={() => setTargetShift('night')}
            activeOpacity={0.8}>
            <Icon
              name="moon-outline"
              size={16}
              color={targetShift === 'night' ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    targetShift === 'night' ? '#fff' : colors.textSecondary,
                },
              ]}>
              {t('shiftswap.night_shift')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('shiftswap.choose_colleague')}
          </Text>
        </View>
        {MOCK_COLLEAGUES.map((col, index) => {
          const selected = colleagueId === col.id;
          return (
            <TouchableOpacity
              key={col.id}
              style={[
                styles.colleagueRow,
                {
                  backgroundColor: selected
                    ? colors.primaryLight
                    : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setColleagueId(col.id)}
              activeOpacity={0.8}>
              <View
                style={[
                  styles.colAvatar,
                  {backgroundColor: colors.primaryLight},
                ]}>
                <Text style={[styles.colInitial, {color: colors.primary}]}>
                  {col.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.colInfo}>
                <Text style={[styles.colName, {color: colors.text}]}>
                  {col.name}
                </Text>
                <Text style={[styles.colTeam, {color: colors.textSecondary}]}>
                  {col.team} · {t('shiftswap.a_shift')}/{t('shiftswap.b_shift')}{' '}
                  {col.shift}
                </Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: selected
                      ? colors.primary
                      : colors.textTertiary,
                  },
                ]}>
                {selected ? (
                  <View
                    style={[
                      styles.radioInner,
                      {backgroundColor: colors.primary},
                    ]}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('shiftswap.reason')}
          </Text>
        </View>
        <TextInput
          style={[
            styles.reasonInput,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          value={reason}
          onChangeText={setReason}
          placeholder={t('shiftswap.reason_ph')}
          placeholderTextColor={colors.textTertiary}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitBtn, {backgroundColor: colors.primary}]}
          onPress={handleSubmit}
          activeOpacity={0.85}>
          <Text style={styles.submitText}>{t('shiftswap.submit_btn')}</Text>
        </TouchableOpacity>

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('shiftswap.pending')}
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
  heroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  sectionLabelWrap: {
    marginBottom: 10,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayChip: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 4,
    flex: 1,
    marginHorizontal: 3,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 4,
  },
  dayIndicators: {
    height: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  colleagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  colAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  colInitial: {
    fontSize: 16,
    fontWeight: '700',
  },
  colInfo: {
    flex: 1,
  },
  colName: {
    fontSize: 14,
    fontWeight: '600',
  },
  colTeam: {
    fontSize: 12,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
    minHeight: 90,
    fontSize: 14,
    marginBottom: 16,
  },
  submitBtn: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
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

export default ShiftSwap;
