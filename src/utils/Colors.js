// Light theme colors
export const LIGHT_THEME = {
  // Primary colors
  primary: '#007AFF',
  primary2: '#5856D6',
  
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
  
  // Status colors
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Shadow
  shadow: 'rgba(0,0,0,0.1)',
  shadowDark: 'rgba(0,0,0,0.25)',
};

// Dark theme colors
export const DARK_THEME = {
  // Primary colors
  primary: '#0A84FF',
  primary2: '#5E5CE6',
  
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
  
  // Status colors
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  info: '#0A84FF',
  
  // Shadow
  shadow: 'rgba(0,0,0,0.3)',
  shadowDark: 'rgba(0,0,0,0.5)',
};

// Legacy exports for backward compatibility
export const THEME_COLOR = LIGHT_THEME.primary;
export const THEME_COLOR_2 = LIGHT_THEME.primary2;
export const TEXT_COLOR = LIGHT_THEME.text;
export const BACKGROUND_COLOR = LIGHT_THEME.background;
export const GRAY_COLOR = LIGHT_THEME.textSecondary;
export const LIGHT_GRAY = LIGHT_THEME.backgroundSecondary;
export const ERROR_COLOR = LIGHT_THEME.error;
export const SUCCESS_COLOR = LIGHT_THEME.success;
export const WARNING_COLOR = LIGHT_THEME.warning;
