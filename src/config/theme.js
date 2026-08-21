// Light theme colors
export const LIGHT_COLORS = {
  // Primary colors
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  primary2: '#7C3AED',
  primaryGradient: ['#4F46E5', '#7C3AED'],
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#F8F9FA',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  
  // Border colors
  border: '#E5E5EA',
  borderSecondary: '#F2F2F7',
  borderColor: '#dddddd',
  
  // Status colors
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  error: '#FF3B30',
  
  // Additional colors
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  black: '#000000',
  placeholder: '#adb5bd',
  icon: '#555555',
  lightGray1: '#f5f5f5',
  lightGray2: '#eeeeee',
  gray400: '#ced4da',
  gray800: '#343a40',
  transparent: 'transparent',
  
  // Shadow
  shadow: 'rgba(0,0,0,0.1)',
  shadowDark: 'rgba(0,0,0,0.25)',
  // Semantic aliases used by the redesigned app surfaces.
  primaryDark: '#3730A3',
  surfaceElevated: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.48)',
  focusRing: '#A5B4FC',
};

// Dark theme colors
export const DARK_COLORS = {
  // Primary colors
  primary: '#818CF8',
  primaryLight: '#1E1B4B',
  primary2: '#A78BFA',
  primaryGradient: ['#6366F1', '#8B5CF6'],
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  
  // Background colors
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',
  
  // Surface colors
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  
  // Border colors
  border: '#38383A',
  borderSecondary: '#2C2C2E',
  borderColor: '#38383A',
  
  // Status colors
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
  error: '#FF453A',
  
  // Additional colors
  light: '#2C2C2E',
  dark: '#FFFFFF',
  white: '#1C1C1E',
  black: '#FFFFFF',
  placeholder: '#8E8E93',
  icon: '#8E8E93',
  lightGray1: '#2C2C2E',
  lightGray2: '#38383A',
  gray400: '#8E8E93',
  gray800: '#FFFFFF',
  transparent: 'transparent',
  
  // Shadow
  shadow: 'rgba(0,0,0,0.3)',
  shadowDark: 'rgba(0,0,0,0.5)',
  // Semantic aliases used by the redesigned app surfaces.
  primaryDark: '#C4B5FD',
  surfaceElevated: '#242426',
  overlay: 'rgba(0, 0, 0, 0.62)',
  focusRing: '#818CF8',
};

// Legacy export for backward compatibility
export const COLORS = LIGHT_COLORS;

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  inputHeight: 48,
  inputPaddingHorizontal: 16,
  headerHeight: 60,

  // Product spacing and shape tokens.
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    section: 40,
  },
  radiusScale: {
    sm: 10,
    md: 14,
    lg: 20,
    pill: 999,
  },

  // Font sizes
  largeTitle: 50,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // App dimensions
  width: null, // Will be set dynamically
  height: null, // Will be set dynamically
};

export const FONTS = {
  display: {
    fontFamily: 'System',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  title: {
    fontFamily: 'System',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  heading: {
    fontFamily: 'System',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
  },
  label: {
    fontFamily: 'System',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  caption: {
    fontFamily: 'System',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  largeTitle: {
    fontFamily: 'System',
    fontSize: SIZES.largeTitle,
    lineHeight: 55,
  },
  h1: {
    fontFamily: 'System',
    fontSize: SIZES.h1,
    lineHeight: 36,
    fontWeight: 'bold',
  },
  h2: {
    fontFamily: 'System',
    fontSize: SIZES.h2,
    lineHeight: 30,
    fontWeight: 'bold',
  },
  h3: {
    fontFamily: 'System',
    fontSize: SIZES.h3,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  h4: {
    fontFamily: 'System',
    fontSize: SIZES.h4,
    lineHeight: 22,
    fontWeight: '600',
  },
  body1: {
    fontFamily: 'System',
    fontSize: SIZES.body1,
    lineHeight: 36,
  },
  body2: {
    fontFamily: 'System',
    fontSize: SIZES.body2,
    lineHeight: 30,
  },
  body3: {
    fontFamily: 'System',
    fontSize: SIZES.body3,
    lineHeight: 22,
  },
  body4: {
    fontFamily: 'System',
    fontSize: SIZES.body4,
    lineHeight: 22,
  },
  body5: {
    fontFamily: 'System',
    fontSize: SIZES.body5,
    lineHeight: 18,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,
    elevation: 14,
  },
};

export const LAYOUT = {
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  columnBetween: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
};

// Theme configuration
const createTheme = (colors) => ({
  colors,
  SIZES,
  FONTS,
  SHADOWS,
  LAYOUT,
});

export const lightTheme = createTheme(LIGHT_COLORS);
export const darkTheme = createTheme(DARK_COLORS);

// Legacy export for backward compatibility
const appTheme = {COLORS, SIZES, FONTS, SHADOWS, LAYOUT};

export default appTheme;
