import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../config/theme';
import {useTheme} from '../../hooks/useTheme';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary', // 'primary', 'outline', 'ghost', 'success'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  isLoading = false,
  iconLeft,
  iconRight,
  ...props
}) => {
  const {colors} = useTheme();
  const getButtonStyles = () => {
    let baseStyle = styles.button;
    let textBaseStyle = styles.text;

    // Variant styles
    switch (variant) {
      case 'outline':
        baseStyle = {...baseStyle, ...styles.outlineButton};
        textBaseStyle = {...textBaseStyle, ...styles.outlineButtonText};
        break;
      case 'ghost':
        baseStyle = {...baseStyle, ...styles.ghostButton};
        textBaseStyle = {...textBaseStyle, ...styles.ghostButtonText};
        break;
      case 'success':
        baseStyle = {...baseStyle, ...styles.successButton};
        textBaseStyle = {...textBaseStyle, ...styles.successButtonText};
        break;
      case 'primary':
      default:
        baseStyle = {...baseStyle, ...styles.primaryButton};
        textBaseStyle = {...textBaseStyle, ...styles.primaryButtonText};
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyle = {...baseStyle, ...styles.smallButton};
        textBaseStyle = {...textBaseStyle, ...styles.smallButtonText};
        break;
      case 'large':
        baseStyle = {...baseStyle, ...styles.largeButton};
        textBaseStyle = {...textBaseStyle, ...styles.largeButtonText};
        break;
      case 'medium':
      default:
        // Medium is default, no specific size override needed unless defined
        break;
    }

    if (disabled) {
      baseStyle = {...baseStyle, ...styles.disabledButton};
      textBaseStyle = {...textBaseStyle, ...styles.disabledButtonText};
    }

    return {button: baseStyle, text: textBaseStyle};
  };

  const {button: computedButtonStyle, text: computedTextStyle} =
    getButtonStyles();

  const variantColor = variant === 'danger' ? colors.danger : colors.primary;
  const variantStyle =
    variant === 'outline'
      ? {borderColor: colors.primary, backgroundColor: 'transparent'}
      : variant === 'ghost'
      ? {backgroundColor: 'transparent'}
      : {backgroundColor: variant === 'success' ? colors.success : variantColor};
  const variantTextStyle =
    variant === 'outline' || variant === 'ghost'
      ? {color: colors.primary}
      : {color: '#fff'};

  return (
    <TouchableOpacity
      style={[computedButtonStyle, variantStyle, style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
            color={variantTextStyle.color}
        />
      ) : (
        <>
          {iconLeft}
           <Text style={[computedTextStyle, variantTextStyle, textStyle]}>{title}</Text>
          {iconRight}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding / 2,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    minHeight: SIZES.inputHeight * 0.9,
  },
  text: {
    ...FONTS.h4,
    textAlign: 'center',
  },
  // Primary (Default)
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  // Outline
  outlineButton: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineButtonText: {
    color: COLORS.primary,
  },
  // Ghost
  ghostButton: {
    backgroundColor: COLORS.transparent,
  },
  ghostButtonText: {
    color: COLORS.primary,
  },
  // Success
  successButton: {
    backgroundColor: COLORS.success,
  },
  successButtonText: {
    color: COLORS.white,
  },
  // Disabled
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    // No specific text color change for disabled, opacity handles it
  },
  // Sizes
  smallButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 1.5,
    minHeight: SIZES.inputHeight * 0.7,
  },
  smallButtonText: {
    ...FONTS.body4,
  },
  largeButton: {
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding * 1.5,
    minHeight: SIZES.inputHeight * 1.1,
  },
  largeButtonText: {
    ...FONTS.h3,
  },
});

export default Button;
