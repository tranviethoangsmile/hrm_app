import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import moment from 'moment';
import {useTheme} from '../../hooks/useTheme';
import {SIZES} from '../../config/theme';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const AttendanceCalendar = ({year, month, checkins, dayoffs, onSelectDay}) => {
  const {colors} = useTheme();

  const {cells, todayStr, byDate, offSet} = useMemo(() => {
    const firstDay = moment([year, month, 1]);
    const startOffset = firstDay.day();
    const daysInMonth = firstDay.daysInMonth();

    const offsSet = new Set(
      (dayoffs || []).map(d => moment(d).format('YYYY-MM-DD')),
    );
    const recordsByDate = {};
    (checkins || []).forEach(c => {
      const key = moment(c.date).format('YYYY-MM-DD');
      if (
        !recordsByDate[key] ||
        c.over_time > (recordsByDate[key].over_time || 0)
      ) {
        recordsByDate[key] = c;
      }
    });

    const tStr = moment().format('YYYY-MM-DD');
    const result = [];
    for (let i = 0; i < startOffset; i++) {
      result.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }
    return {
      cells: result,
      todayStr: tStr,
      byDate: recordsByDate,
      offSet: offsSet,
    };
  }, [year, month, checkins, dayoffs]);
  const getStatus = day => {
    if (!day) {
      return null;
    }
    const key = moment([year, month, day]).format('YYYY-MM-DD');
    if (offSet.has(key)) {
      return 'off';
    }
    const checkin = byDate[key];
    if (!checkin) {
      return 'none';
    }
    if (checkin.is_paid_leave) {
      return 'leave';
    }
    if (checkin.is_weekend) {
      return 'weekend';
    }
    if (checkin.over_time > 0) {
      return 'ot';
    }
    return 'work';
  };

  const statusColor = status => {
    switch (status) {
      case 'off':
        return colors.textTertiary;
      case 'leave':
        return '#00D4AA';
      case 'weekend':
        return '#FF6B6B';
      case 'ot':
        return '#FF9500';
      case 'work':
        return '#4FACFE';
      default:
        return 'transparent';
    }
  };

  const renderDay = (day, index) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }
    const key = moment([year, month, day]).format('YYYY-MM-DD');
    const isToday = key === todayStr;
    const status = getStatus(day);

    return (
      <TouchableOpacity
        key={key}
        style={[styles.dayCell, isToday && {borderColor: colors.primary}]}
        activeOpacity={0.6}
        onPress={() => onSelectDay && onSelectDay(key)}>
        <Text
          style={[
            styles.dayText,
            {color: status === 'none' ? colors.textSecondary : colors.text},
          ]}>
          {day}
        </Text>
        <View
          style={[
            styles.dot,
            {backgroundColor: statusColor(status)},
            status === 'none' && {backgroundColor: colors.border},
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.weekRow}>
        {WEEKDAYS.map(d => (
          <Text
            key={d}
            style={[styles.weekText, {color: colors.textSecondary}]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((day, index) => renderDay(day, index))}
      </View>
      <View style={styles.legend}>
        {[
          {label: 'Day', color: '#4FACFE'},
          {label: 'OT', color: '#FF9500'},
          {label: 'Leave', color: '#00D4AA'},
          {label: 'Off', color: colors.textTertiary},
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: item.color}]} />
            <Text style={[styles.legendText, {color: colors.textSecondary}]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius,
    borderWidth: 0.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
  },
});

export default AttendanceCalendar;
