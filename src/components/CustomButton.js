import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {THEME_COLOR, THEME_COLOR_2} from '../utils/Colors'; // Đảm bảo đường dẫn này chính xác

const CustomButton = ({
  title,
  onPress,
  style, // Style cho container ngoài cùng của TouchableOpacity
  textStyle, // Style cho Text bên trong
  gradientColors, // Mảng màu cho gradient, ví dụ: [THEME_COLOR, THEME_COLOR_2]
  disabled = false,
  isLoading = false,
  icon, // Prop mới để nhận icon
  iconPosition = 'left', // 'left' hoặc 'right'
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator size="small" color={textStyle?.color || '#fff'} />
      );
    }

    const titleElement = <Text style={[styles.text, textStyle]}>{title}</Text>;
    const iconElement = icon ? (
      <View
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}>
        {icon}
      </View>
    ) : null;

    if (iconPosition === 'left') {
      return (
        <View style={styles.contentWrapper}>
          {iconElement}
          {titleElement}
        </View>
      );
    }
    return (
      <View style={styles.contentWrapper}>
        {titleElement}
        {iconElement}
      </View>
    );
  };

  const buttonContent = (
    <View style={styles.buttonContentContainer}>{renderContent()}</View>
  );

  if (gradientColors && gradientColors.length > 0) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[styles.touchableContainer, style]} // style được áp dụng ở đây
      >
        <LinearGradient colors={gradientColors} style={styles.gradient}>
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.touchableContainer, // style chung cho touchable
        styles.defaultBackground, // style nền mặc định
        style, // style tùy chỉnh từ props
        disabled || isLoading ? styles.disabled : {},
      ]}>
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Cho LinearGradient và bo góc
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16, // Thêm padding để nội dung không sát viền
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBackground: {
    backgroundColor: THEME_COLOR,
  },
  text: {
    color: '#fff',
    fontSize: 17, // Điều chỉnh fontSize
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.7,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default CustomButton;
