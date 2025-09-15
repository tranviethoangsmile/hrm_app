/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef, useCallback} from 'react';
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
import {useSelector} from 'react-redux';
import HomeTab from '../components/tabs/HomeTab';
import FeatureTab from '../components/tabs/FeatureTab';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';
import axios from 'axios';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  NOTIFICATION,
  SEARCH_BY_ID,
} from '../utils/constans';

const Main = () => {
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const {colors, isDarkMode} = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const userInfo = authData?.data?.data;

  const lastScrollY = useRef(0);
  const bottomNavHeight = 75; // Simple clean height
  const bottomNavTranslateY = useRef(new Animated.Value(0)).current;
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  // Hàm lấy số lượng thông báo
  const getNotificationCount = useCallback(async () => {
    try {
      const user_id = userInfo?.id;
      const notifications = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${SEARCH_BY_ID}`,
        {
          user_id,
        },
      );
      if (notifications?.data?.success) {
        setNotificationCount(notifications?.data.data.length);
      }
    } catch (error) {
      console.error('Error getting notification count:', error);
    }
  }, [userInfo?.id]);

  // Lấy notification count khi component mount và khi user thay đổi
  useEffect(() => {
    if (userInfo?.id) {
      getNotificationCount();
    }
  }, [userInfo?.id]); // Chỉ phụ thuộc vào userInfo?.id

  // Refresh notification count khi focus vào Notifications tab
  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
    // Refresh count sau khi user xem notifications
    setTimeout(() => {
      getNotificationCount();
    }, 1000);
  };

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
          colors={isDarkMode ? ['#0A84FF', '#5E5CE6'] : ['#667eea', '#764ba2']}
          style={styles.selectedTabGradient}>
          <Icon name={iconFilled || iconName} size={24} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={styles.unselectedTab}>
          <Icon name={iconName} size={24} color={isDarkMode ? colors.textSecondary : "#94a3b8"} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
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
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}>
        <LinearGradient
          colors={isDarkMode ? ['rgba(28,28,30,0.95)', 'rgba(28,28,30,1)'] : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
          style={styles.bottomNavGradient}>
          <TabButton
            selected={selectedTab === 0}
            onPress={() => setSelectedTab(0)}
            iconName="home-outline"
            iconFilled="home"
            label="Home"
          />

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('Message')}
            activeOpacity={0.7}>
            <View style={styles.unselectedTab}>
              <Icon name="chatbubble-outline" size={24} color={isDarkMode ? colors.textSecondary : "#94a3b8"} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.centerTabItem}
            onPress={() => navigation.navigate('Checkin')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={isDarkMode ? ['#0A84FF', '#5E5CE6'] : ['#4FACFE', '#00F2FE']}
              style={styles.centerTabGradient}>
              <Icon name="finger-print" size={26} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={handleNotificationPress}
            activeOpacity={0.7}>
            <View style={styles.unselectedTab}>
              <Icon name="notifications-outline" size={24} color={isDarkMode ? colors.textSecondary : "#94a3b8"} />
              {notificationCount > 0 && (
                <LinearGradient
                  colors={['#ff6b6b', '#ff8e8e']}
                  style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </LinearGradient>
              )}
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    borderTopWidth: 1,
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
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabItem: {
    alignItems: 'center',
    flex: 0.8,
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
    flex: 1.2,
    marginTop: -15,
    shadowColor: '#4FACFE',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  centerTabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FACFE',
    borderWidth: 3,
    borderColor: '#fff',
  },
  notificationBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
});

export default Main;
