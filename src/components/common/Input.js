import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../config/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or your preferred icon set
import {useTheme} from '../../hooks/useTheme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  iconName,
  onIconPress,
  editable = true,
  ...props
}) => {
  const {colors} = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const borderColor = error
    ? colors.danger
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {borderColor, backgroundColor: colors.surface},
          multiline && styles.multilineInputContainer,
          !editable && styles.disabledInputContainer,
        ]}>
        <TextInput
          style={[
            styles.input,
            {color: colors.text},
            inputStyle,
            multiline && styles.multilineInput,
            !editable && styles.disabledInputText,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines || 3 : 1} // Default 3 lines for multiline
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}>
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={SIZES.h3}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}
        {!secureTextEntry && iconName && (
          <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
            <Icon name={iconName} size={SIZES.h3} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding * 0.75,
  },
  label: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
    marginLeft: SIZES.base / 2, // Slight indent for label
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    height: SIZES.inputHeight,
    paddingHorizontal: SIZES.inputPaddingHorizontal,
  },
  multilineInputContainer: {
    height: 'auto', // Adjust height for multiline
    minHeight: SIZES.inputHeight,
    paddingVertical: SIZES.base, // Add vertical padding for multiline
  },
  disabledInputContainer: {
    backgroundColor: COLORS.lightGray1,
  },
  input: {
    flex: 1,
    ...FONTS.body3,
    color: COLORS.text,
    height: '100%', // Ensure TextInput takes full height of container
  },
  multilineInput: {
    textAlignVertical: 'top', // Align text to top for multiline
    height: 'auto',
  },
  disabledInputText: {
    color: COLORS.textSecondary,
  },
  iconContainer: {
    paddingLeft: SIZES.base,
  },
  errorText: {
    ...FONTS.body5,
    color: COLORS.danger,
    marginTop: SIZES.base / 2,
    marginLeft: SIZES.base / 2,
  },
});

export default Input;
