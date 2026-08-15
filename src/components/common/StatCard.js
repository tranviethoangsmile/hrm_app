import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../hooks/useTheme';
import {SIZES} from '../../config/theme';

const StatCard = ({icon, iconColor, label, value, sub, onPress}) => {
  const {colors} = useTheme();
  const color = iconColor || colors.primary;

  const content = (
    <View
      style={[
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={[styles.iconWrap, {backgroundColor: color + '22'}]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <View style={styles.textWrap}>
        <Text
          style={[styles.label, {color: colors.textSecondary}]}
          numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.value, {color: colors.text}]} numberOfLines={1}>
          {value}
        </Text>
        {sub ? (
          <Text
            style={[styles.sub, {color: colors.textSecondary}]}
            numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touch}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  touch: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: SIZES.radius,
    borderWidth: 0.5,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 84,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: SIZES.body5,
    marginBottom: 2,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  sub: {
    fontSize: SIZES.body5,
  },
});

export default StatCard;
