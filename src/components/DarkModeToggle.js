import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DarkModeToggle = ({style, showLabel = true, size = 'medium'}) => {
  const {isDarkMode, toggleTheme, colors, SIZES} = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          switch: styles.smallSwitch,
          text: styles.smallText,
          icon: 16,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          switch: styles.largeSwitch,
          text: styles.largeText,
          icon: 24,
        };
      default:
        return {
          container: styles.mediumContainer,
          switch: styles.mediumSwitch,
          text: styles.mediumText,
          icon: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Icon
            name={isDarkMode ? 'dark-mode' : 'light-mode'}
            size={sizeStyles.icon}
            color={colors.text}
            style={styles.icon}
          />
          <Text style={[styles.label, sizeStyles.text, {color: colors.text}]}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
      )}
      
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{
          false: colors.border,
          true: colors.primary,
        }}
        thumbColor={isDarkMode ? colors.white : colors.white}
        ios_backgroundColor={colors.border}
        style={sizeStyles.switch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '500',
  },
  // Small size
  smallContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  smallSwitch: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  smallText: {
    fontSize: 12,
  },
  // Medium size
  mediumContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumSwitch: {
    transform: [{scaleX: 1}, {scaleY: 1}],
  },
  mediumText: {
    fontSize: 14,
  },
  // Large size
  largeContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeSwitch: {
    transform: [{scaleX: 1.2}, {scaleY: 1.2}],
  },
  largeText: {
    fontSize: 16,
  },
});

export default DarkModeToggle;
