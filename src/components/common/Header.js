import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../hooks/useTheme';

const Header = ({title, onBack, right}) => {
  const {colors, isDarkMode} = useTheme();
  
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={[colors.primary, colors.primary2]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                style={[styles.backButton, {backgroundColor: 'rgba(255,255,255,0.2)'}]}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <IconFA name="arrow-left" size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={{width: 32}} />
            )}
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            {right ? right : <View style={{width: 32}} />}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    // Remove paddingTop since SafeAreaView handles it
    paddingBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    // SafeAreaView handles the status bar area
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44, // Ensure minimum touch target height
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
});

export default Header;
