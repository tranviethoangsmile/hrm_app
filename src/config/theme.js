export const COLORS = {
  primary: '#007bff', // Example primary color
  primaryLight: '#e3f2fd',
  secondary: '#6c757d', // Example secondary color
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  black: '#000000',
  text: '#333333',
  textSecondary: '#777777',
  placeholder: '#adb5bd',
  background: '#f4f6f8',
  borderColor: '#dddddd',
  icon: '#555555',
  lightGray1: '#f5f5f5',
  lightGray2: '#eeeeee',
  gray400: '#ced4da',
  gray800: '#343a40',
  transparent: 'transparent',
  // Add more colors as needed
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  inputHeight: 48,
  inputPaddingHorizontal: 16,
  headerHeight: 60,

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

const appTheme = {COLORS, SIZES, FONTS, SHADOWS, LAYOUT};

export default appTheme;
