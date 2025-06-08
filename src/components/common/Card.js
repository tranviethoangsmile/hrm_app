import React from 'react';
import {View, StyleSheet} from 'react-native';
import {COLORS, SIZES, SHADOWS} from '../../config/theme';

const Card = ({children, style, shadowType = 'light', ...props}) => {
  const shadowStyle = SHADOWS[shadowType] || SHADOWS.light;

  return (
    <View style={[styles.card, shadowStyle, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    // Default shadow, can be overridden by shadowType prop
    ...SHADOWS.light,
  },
});

export default Card;
