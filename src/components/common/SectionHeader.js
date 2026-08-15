import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../hooks/useTheme';
import {SIZES} from '../../config/theme';

const SectionHeader = ({title, subtitle, icon, iconColor}) => {
  const {colors} = useTheme();
  const color = iconColor || colors.primary;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={colors.primaryGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        {icon ? (
          <Icon name={icon} size={16} color={color} style={styles.headerIcon} />
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
      {subtitle ? (
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radius,
  },
  headerIcon: {
    marginRight: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: SIZES.body5,
    marginTop: 6,
    paddingHorizontal: 4,
  },
});

export default SectionHeader;
