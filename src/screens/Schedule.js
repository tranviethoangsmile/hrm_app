import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../services/apiClient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';
import {useUserProfile} from '../hooks/useUserProfile';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  DAY_OFFS,
  GET_ALL,
} from '../utils/constans';

/* eslint-disable react-native/no-inline-styles */

const WEEK_DAYS_KEY = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const CaCircle = ({ca, size, letter = false, colors, textColor}) => {
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
            fontSize: size * 0.58,
            fontWeight: '800',
            color: isA ? textColor || colors.textSecondary : '#ffffff',
          }}>
          {ca}
        </Text>
      ) : null}
    </View>
  );
};

const RedDot = ({size = 10, colors}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.danger,
    }}
  />
);

const Schedule = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const {userInfo} = useUserProfile();
  const name = userInfo?.full_name || userInfo?.name || '';
  const [dayOffs, setDayOffs] = useState([]);

  const todayWeek = moment().isoWeek();

  const fetchDayOffs = async () => {
    try {
      const res = await apiClient.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DAY_OFFS}${GET_ALL}`,
      );
      if (res?.data?.success) {
        setDayOffs(
          (res?.data?.data || []).map(item =>
            moment(item.date).format('YYYY-MM-DD'),
          ),
        );
      } else {
        setDayOffs([]);
      }
    } catch (error) {
      console.error('Schedule getDayOffs error:', error);
      setDayOffs([]);
    }
  };

  useEffect(() => {
    fetchDayOffs();
  }, []);

  const weekDays = Array.from({length: 7}, (_, i) =>
    moment().startOf('isoWeek').add(i, 'days'),
  );
  const todayIndex = (moment().day() + 6) % 7;
  const today = weekDays[todayIndex];

  const isDayOff = day => {
    if (day.day() === 0 || day.day() === 6) {
      return true;
    }
    return dayOffs.includes(day.format('YYYY-MM-DD'));
  };
  const todayOff = isDayOff(today);

  // Ca làm đêm xoay vòng theo tuần: tuần này B đêm, tuần sau A đêm, ...
  const getNightTeam = day => {
    const diff = day.isoWeek() - todayWeek;
    return ((diff % 2) + 2) % 2 === 1 ? 'A' : 'B';
  };
  const nightTeam = getNightTeam(today);
  const dayTeam = nightTeam === 'A' ? 'B' : 'A';

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('schedule.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Today summary */}
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t('schedule.today')}</Text>
          <Text style={styles.heroDate}>
            {today.format('dddd, DD/MM/YYYY')}
          </Text>
          {todayOff ? (
            <View style={styles.heroOffRow}>
              <RedDot size={22} colors={colors} />
              <Text style={styles.heroOffText}>{t('schedule.off')}</Text>
            </View>
          ) : (
            <View style={styles.heroShiftWrap}>
              <View style={styles.heroCirclesRow}>
                <CaCircle ca="A" size={18} letter colors={colors} />
                <CaCircle ca="B" size={18} letter colors={colors} />
              </View>
              <Text style={styles.heroShiftText}>
                {`Ca ngày: ${dayTeam} · Ca đêm: ${nightTeam}`}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Legend */}
        <View
          style={[
            styles.legendRow,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <View style={styles.legendItem}>
            <CaCircle ca="A" size={14} letter colors={colors} />
            <Text style={[styles.legendText, {color: colors.textSecondary}]}>
              Ca A
            </Text>
          </View>
          <View style={styles.legendItem}>
            <CaCircle ca="B" size={14} letter colors={colors} />
            <Text style={[styles.legendText, {color: colors.textSecondary}]}>
              Ca B
            </Text>
          </View>
          <View style={styles.legendItem}>
            <RedDot size={12} colors={colors} />
            <Text style={[styles.legendText, {color: colors.textSecondary}]}>
              {t('schedule.off')}
            </Text>
          </View>
        </View>

        {/* Weekly strip */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            {t('schedule.week')}
          </Text>
        </View>
        <View style={styles.weekRow}>
          {weekDays.map((day, index) => {
            const isToday = index === todayIndex;
            const off = isDayOff(day);
            const night = off ? null : getNightTeam(day);
            return (
              <View
                key={index}
                style={[
                  styles.dayChip,
                  isToday && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                  },
                  off && {
                    backgroundColor: 'rgba(255,59,48,0.08)',
                    borderColor: 'rgba(255,59,48,0.35)',
                  },
                  {borderColor: colors.border},
                ]}>
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: off
                        ? colors.danger
                        : isToday
                        ? colors.primary
                        : colors.textSecondary,
                    },
                  ]}>
                  {t(WEEK_DAYS_KEY[day.day()])}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    {
                      color: off
                        ? colors.danger
                        : isToday
                        ? colors.primary
                        : colors.text,
                    },
                  ]}>
                  {day.format('D')}
                </Text>
                <View style={styles.dayIndicators}>
                  {off ? (
                    <RedDot size={10} colors={colors} />
                  ) : (
                    <CaCircle ca={night} size={11} colors={colors} />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Daily events */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            {t('schedule.events')}
          </Text>
        </View>
        <View
          style={[
            styles.eventsCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Icon
            name="calendar-outline"
            size={26}
            color={colors.textSecondary}
          />
          <Text style={[styles.eventsEmpty, {color: colors.textSecondary}]}>
            {t('schedule.empty_events')}
          </Text>
        </View>

        {/* Note */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.noteCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Icon name="cloud-upload-outline" size={22} color={colors.primary} />
          <View style={styles.noteTextWrap}>
            <Text style={[styles.noteText, {color: colors.text}]}>
              {t('schedule.pending')}
            </Text>
            <Text style={[styles.noteSub, {color: colors.textSecondary}]}>
              {name}
            </Text>
          </View>
        </TouchableOpacity>
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
    marginBottom: 12,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroDate: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  heroOffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  heroOffText: {
    color: '#FFE3E3',
    fontSize: 18,
    fontWeight: '700',
  },
  heroShiftWrap: {
    marginTop: 16,
  },
  heroCirclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroShiftText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
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
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
  },
  eventsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 0.5,
    borderStyle: 'dashed',
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  eventsEmpty: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  noteText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteSub: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default Schedule;
