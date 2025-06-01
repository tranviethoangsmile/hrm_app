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

const Main = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState(0);

  const lastScrollY = useRef(0);
  const bottomNavHeight = 65; // Adjusted height
  const bottomNavTranslateY = useRef(new Animated.Value(0)).current;
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  const handleScroll = event => {
    if (!event) return; // Guard clause
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? 'down' : 'up';

    if (currentScrollY <= 0) {
      if (!isBottomNavVisible) {
        Animated.timing(bottomNavTranslateY, {
          toValue: 0,
          duration: 200, // Slightly faster animation
          useNativeDriver: true,
        }).start();
        setIsBottomNavVisible(true);
      }
    } else {
      if (scrollDirection === 'down' && isBottomNavVisible) {
        Animated.timing(bottomNavTranslateY, {
          toValue: bottomNavHeight,
          duration: 200,
          useNativeDriver: true,
        }).start();
        setIsBottomNavVisible(false);
      } else if (scrollDirection === 'up' && !isBottomNavVisible) {
        Animated.timing(bottomNavTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        setIsBottomNavVisible(true);
      }
    }
    lastScrollY.current = Math.max(0, currentScrollY); // Ensure lastScrollY is not negative
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
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
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedTab(0);
          }}>
          <Icon
            name={selectedTab === 0 ? 'home' : 'home-outline'}
            size={28}
            color={selectedTab === 0 ? THEME_COLOR_2 : '#888888'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            navigation.navigate('Checkin');
          }}>
          <Icon name={'finger-print-outline'} size={28} color={'#888888'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedTab(1);
          }}>
          <Icon
            name={selectedTab === 1 ? 'apps' : 'apps-outline'}
            size={28}
            color={selectedTab === 1 ? THEME_COLOR_2 : '#888888'}
          />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomNav: {
    position: 'absolute',
    width: '100%',
    height: 65, // Adjusted height to match bottomNavHeight
    backgroundColor: '#FFFFFF', // Changed to white
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed to space-around for even spacing
    alignItems: 'center', // Align items to center for vertical alignment of icon+text
    borderTopWidth: 1, // Add a subtle top border
    borderTopColor: '#E0E0E0', // Light gray border color
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05, // Softer shadow
    shadowRadius: 3.84,
    elevation: 3, // Elevation for Android shadow
  },
  tabItem: {
    flex: 1, // Each tab takes equal width
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // Padding for touchable area and spacing
  },
  tabLabel: {
    fontSize: 11, // Smaller font size for labels
    marginTop: 4, // Space between icon and label
  },
});

export default Main;
