/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  useColorScheme,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import {useSelector} from 'react-redux';
import HomeTab from '../components/tabs/HomeTab';
import FeatureTab from '../components/tabs/FeatureTab';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const Main = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState(0);

  const lastScrollY = useRef(0);
  const bottomNavHeight = 75; // Simple clean height
  const bottomNavTranslateY = useRef(new Animated.Value(0)).current;
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  const handleScroll = event => {
    if (!event) return;
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? 'down' : 'up';

    if (currentScrollY <= 0) {
      if (!isBottomNavVisible) {
        Animated.timing(bottomNavTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        setIsBottomNavVisible(true);
      }
    } else {
      if (scrollDirection === 'down' && isBottomNavVisible) {
        Animated.timing(bottomNavTranslateY, {
          toValue: bottomNavHeight,
          duration: 300,
          useNativeDriver: true,
        }).start();
        setIsBottomNavVisible(false);
      } else if (scrollDirection === 'up' && !isBottomNavVisible) {
        Animated.timing(bottomNavTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        setIsBottomNavVisible(true);
      }
    }
    lastScrollY.current = Math.max(0, currentScrollY);
  };

  const TabButton = ({selected, onPress, iconName, iconFilled, label}) => (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}>
      {selected ? (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.selectedTabGradient}>
          <Icon name={iconFilled || iconName} size={24} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={styles.unselectedTab}>
          <Icon name={iconName} size={24} color="#94a3b8" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#f8fafc"
      />
      {selectedTab === 0 ? (
        <HomeTab onScrollList={handleScroll} />
      ) : (
        <FeatureTab onScrollList={handleScroll} />
      )}

      <Animated.View
        style={[
          styles.bottomNav,
          {
            transform: [{translateY: bottomNavTranslateY}],
          },
        ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
          style={styles.bottomNavGradient}>
          <TabButton
            selected={selectedTab === 0}
            onPress={() => setSelectedTab(0)}
            iconName="home-outline"
            iconFilled="home"
            label="Home"
          />

          <TouchableOpacity
            style={styles.centerTabItem}
            onPress={() => navigation.navigate('Checkin')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              style={styles.centerTabGradient}>
              <Icon name="finger-print" size={26} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TabButton
            selected={selectedTab === 1}
            onPress={() => setSelectedTab(1)}
            iconName="apps-outline"
            iconFilled="apps"
            label="Features"
          />
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomNavGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  selectedTabGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
  },
  unselectedTab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  centerTabItem: {
    alignItems: 'center',
    flex: 1,
    marginTop: -15,
  },
  centerTabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FACFE',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#fff',
  },
});

export default Main;
