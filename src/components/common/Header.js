import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, SIZES, FONTS} from '../../config/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Header = ({title, onBack, right, backgroundColor, textColor}) => {
  // Lấy chiều cao status bar động
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  return (
    <SafeAreaView style={{backgroundColor: backgroundColor || COLORS.primary}}>
      <StatusBar
        backgroundColor={backgroundColor || COLORS.primary}
        barStyle="light-content"
      />
      <View
        style={[
          styles.header,
          {
            backgroundColor: backgroundColor || COLORS.primary,
            width: '100%',
            paddingTop: Platform.OS === 'android' ? statusBarHeight : 0,
          },
        ]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.headerButtonAbsoluteLeft}>
          <Icon name="arrow-left" size={24} color={textColor || COLORS.white} />
        </TouchableOpacity>
        <View style={styles.titleContainerAbsolute} pointerEvents="none">
          <Text
            style={[styles.headerTitle, {color: textColor || COLORS.white}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {title}
          </Text>
        </View>
        <View style={styles.headerButtonAbsoluteRight}>{right}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
    paddingHorizontal: 8,
    height: 48,
    minHeight: 48,
    maxHeight: 52,
    width: '100%',
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  headerButtonAbsoluteLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  headerButtonAbsoluteRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  titleContainerAbsolute: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
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
