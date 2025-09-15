import React from 'react';
import {StatusBar} from 'react-native';
import {useTheme} from '../../hooks/useTheme';

const StatusBarWrapper = () => {
  const {colors} = useTheme();
  
  return (
    <StatusBar
      barStyle={colors.isDark ? 'light-content' : 'dark-content'}
      backgroundColor="transparent"
      translucent
    />
  );
};

export default StatusBarWrapper;
