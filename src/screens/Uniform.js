/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useColorScheme} from 'react-native';
import {
  SelectProductTab,
  ProcessingOrdersTab,
  CompletedOrdersTab,
} from '../components/uniformtabs';
import {useTranslation} from 'react-i18next';
import Header from '../components/common/Header';
import GuideModal from '../components/common/GuideModal';
import {useNavigation} from '@react-navigation/native';
import {COLORS, SIZES, FONTS, SHADOWS, LAYOUT} from '../config/theme';
import {useTheme} from '../hooks/useTheme';

const {width} = Dimensions.get('window');
const TAB_WIDTH = width / 3;

const TabIndicator = ({scrollX}) => {
  const translateX = scrollX.interpolate({
    inputRange: [0, width, width * 2],
    outputRange: [0, TAB_WIDTH, TAB_WIDTH * 2],
  });

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          transform: [{translateX}],
        },
      ]}
    />
  );
};

const TabButton = ({icon, title, selected, onPress, isDarkMode, colors}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(selected ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: selected ? 1.05 : 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: selected ? 1 : 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selected, scaleAnim, fadeAnim]);

  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{scale: scaleAnim}],
            opacity: fadeAnim,
            backgroundColor: selected ? COLORS.primary + '15' : 'transparent',
          },
        ]}>
        <View style={styles.iconContainer}>
          <Icon
            name={icon}
            size={22}
            color={selected ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text style={[
          styles.tabText, 
          selected && styles.selectedText,
          {color: selected ? colors.primary : colors.textSecondary}
        ]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const TabContent = ({component, index, selectedTab, fadeAnim}) => {
  const [isLoading, setIsLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (index === selectedTab) {
      setIsLoading(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsLoading(false);
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedTab, index, slideAnim, opacity]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width * (index - selectedTab), 0],
  });

  return (
    <Animated.View
      style={[
        styles.tabPage,
        {
          transform: [{translateX}],
          opacity: opacity,
        },
      ]}>
      {isLoading ? <LoadingIndicator /> : component}
    </Animated.View>
  );
};

const Uniform = ({route}) => {
  const {t} = useTranslation();
  const {USER_INFOR} = route.params;
  const {colors, isDarkMode} = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const tabs = [
    {
      icon: 'shopping-bag',
      title: t('select.product'),
      component: <SelectProductTab USER_INFOR={USER_INFOR} isDarkMode={isDarkMode} colors={colors} />,
    },
    {
      icon: 'pending',
      title: t('processing.product'),
      component: <ProcessingOrdersTab USER_INFOR={USER_INFOR} isDarkMode={isDarkMode} colors={colors} />,
    },
    {
      icon: 'check-circle',
      title: t('completed.product'),
      component: <CompletedOrdersTab USER_INFOR={USER_INFOR} isDarkMode={isDarkMode} colors={colors} />,
    },
  ];

  const handleTabPress = useCallback(
    index => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setSelectedTab(index);
      scrollX.setValue(index * width);
    },
    [scrollX, fadeAnim],
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Header title={t('uniform.title')} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Animated.View style={[
          styles.tabBar, 
          {
            backgroundColor: colors.surface,
            elevation: 4,
            shadowColor: isDarkMode ? '#000' : colors.primary,
          }
        ]}>
          {tabs.map((tab, index) => (
            <TabButton
              key={index}
              icon={tab.icon}
              title={tab.title}
              selected={selectedTab === index}
              onPress={() => handleTabPress(index)}
              isDarkMode={isDarkMode}
              colors={colors}
            />
          ))}
          <TabIndicator scrollX={scrollX} />
        </Animated.View>

        <View style={styles.tabContent}>
          {tabs.map((tab, index) => (
            <TabContent
              key={index}
              component={tab.component}
              index={index}
              selectedTab={selectedTab}
              fadeAnim={fadeAnim}
            />
          ))}
        </View>
      </View>

      <GuideModal
        visible={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
        title={t('uniform_guide_title')}
        content={t('uniform_guide_content')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    ...SHADOWS.large,
    position: 'relative',
    marginBottom: SIZES.base,
    borderRadius: SIZES.radius * 2,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  tabContent: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
  },
  iconContainer: {
    marginBottom: SIZES.base / 2,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 4,
    width: TAB_WIDTH - 20,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    alignSelf: 'center',
  },
  tabText: {
    ...FONTS.body4,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabPage: {
    width,
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Uniform;
