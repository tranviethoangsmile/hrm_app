import {useThemeContext} from '../context/ThemeContext';
import {LIGHT_THEME, DARK_THEME} from '../utils/Colors';

export const useTheme = () => {
  const {isDarkMode, toggleTheme, setTheme, isLoading} = useThemeContext();
  
  const colors = isDarkMode ? DARK_THEME : LIGHT_THEME;
  
  return {
    colors,
    isDarkMode,
    toggleTheme,
    setTheme,
    isLoading,
  };
};
