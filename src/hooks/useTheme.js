import {useThemeContext} from '../context/ThemeContext';
import {lightTheme, darkTheme} from '../config/theme';

export const useTheme = () => {
  const {isDarkMode, toggleTheme, setTheme, isLoading} = useThemeContext();
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return {
    ...theme,
    isDarkMode,
    toggleTheme,
    setTheme,
    isLoading,
  };
};
