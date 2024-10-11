import {View, Text, ActivityIndicator} from 'react-native';
import React from 'react';
import {TEXT_COLOR, THEME_COLOR} from '../../utils/Colors';

const Loader = ({t}) => {
  return (
    <View style={{position: 'absolute', top: 150, left: 150}}>
      <ActivityIndicator size="small" color={THEME_COLOR} />
      <Text style={{color: TEXT_COLOR}}>{t('loading.pic')}</Text>
    </View>
  );
};

export default Loader;
