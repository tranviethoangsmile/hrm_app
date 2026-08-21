import React from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../hooks/useTheme';
import {FONTS, SIZES} from '../../config/theme';

const SettingsRow = ({
  icon = 'circle-outline',
  title,
  subtitle,
  value,
  onPress,
  danger = false,
  accessibilityLabel,
}) => {
  const {colors} = useTheme();
  const tint = danger ? colors.danger : colors.primary;
  return (
    <TouchableOpacity
      style={[styles.row, {backgroundColor: colors.surface, borderColor: colors.border}]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.72}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel || title}>
      <View style={[styles.iconBox, {backgroundColor: danger ? colors.danger + '14' : colors.primaryLight}]}>
        <Icon name={icon} size={20} color={tint} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, {color: danger ? colors.danger : colors.text}]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, {color: colors.textSecondary}]} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={[styles.value, {color: colors.textSecondary}]} numberOfLines={1}>{value}</Text> : null}
      {onPress ? <Icon name="chevron-right" size={20} color={colors.textTertiary} /> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {minHeight: 64, borderWidth: 1, borderRadius: SIZES.radiusScale.md, padding: SIZES.spacing.md, flexDirection: 'row', alignItems: 'center', gap: SIZES.spacing.md},
  iconBox: {width: 38, height: 38, borderRadius: SIZES.radiusScale.sm, alignItems: 'center', justifyContent: 'center'},
  copy: {flex: 1},
  title: {...FONTS.bodyMedium},
  subtitle: {...FONTS.caption, marginTop: 2},
  value: {...FONTS.caption, maxWidth: 100, textAlign: 'right'},
});

export default SettingsRow;
