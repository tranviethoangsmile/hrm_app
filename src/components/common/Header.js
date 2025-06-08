import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, SIZES, FONTS} from '../../config/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Header = ({title, onBack, right, backgroundColor, textColor}) => {
  // Lấy chiều cao status bar động
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: backgroundColor || COLORS.primary,
          width: SCREEN_WIDTH,
          paddingTop: Platform.OS === 'android' ? statusBarHeight : 0,
        },
      ]}>
      <StatusBar
        backgroundColor={backgroundColor || COLORS.primary}
        barStyle="light-content"
      />
      <TouchableOpacity onPress={onBack} style={styles.headerButton}>
        <Icon name="arrow-left" size={24} color={textColor || COLORS.white} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text
          style={[styles.headerTitle, {color: textColor || COLORS.white}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <View style={styles.headerButton}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0,
    paddingHorizontal: 8,
    height: 48,
    minHeight: 48,
    maxHeight: 52,
    width: '100%',
    backgroundColor: COLORS.primary,
    // Không border dưới, không shadow
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 8,
  },
});

export default Header;
