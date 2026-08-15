/* eslint-disable react-native/no-inline-styles */
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  SelectProductTab,
  ProcessingOrdersTab,
  CompletedOrdersTab,
} from '../components/uniformtabs';
import {useTranslation} from 'react-i18next';
import Header from '../components/common/Header';
import GuideModal from '../components/common/GuideModal';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../hooks/useTheme';

const {width} = Dimensions.get('window');
const HELP_BUTTON_WIDTH = 44;

const TabButton = ({icon, title, selected, onPress, colors}) => {
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
            backgroundColor: selected ? colors.primaryLight : 'transparent',
          },
        ]}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: selected ? colors.primary + '22' : 'transparent'},
          ]}>
          <Icon
            name={icon}
            size={20}
            color={selected ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.tabText,
            {color: selected ? colors.primary : colors.textSecondary},
          ]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const LoadingIndicator = ({colors}) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const TabContent = ({component, index, selectedTab, fadeAnim, colors}) => {
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
      {isLoading ? <LoadingIndicator colors={colors} /> : component}
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
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const tabs = [
    {
      icon: 'bag-handle-outline',
      title: t('select.product'),
      component: (
        <SelectProductTab
          USER_INFOR={USER_INFOR}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      ),
    },
    {
      icon: 'time-outline',
      title: t('processing.product'),
      component: (
        <ProcessingOrdersTab
          USER_INFOR={USER_INFOR}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      ),
    },
    {
      icon: 'checkmark-done-outline',
      title: t('completed.product'),
      component: (
        <CompletedOrdersTab
          USER_INFOR={USER_INFOR}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      ),
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
    },
    [fadeAnim],
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
        {/* Tab bar */}
        <Animated.View
          style={[
            styles.tabBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              elevation: 4,
              shadowColor: isDarkMode ? '#000' : colors.primary,
            },
          ]}>
          {tabs.map((tab, index) => (
            <TabButton
              key={index}
              icon={tab.icon}
              title={tab.title}
              selected={selectedTab === index}
              onPress={() => handleTabPress(index)}
              colors={colors}
            />
          ))}
          <TouchableOpacity
            style={[
              styles.tabHelpButton,
              {backgroundColor: colors.primaryLight},
            ]}
            onPress={() => setIsGuideVisible(true)}
            activeOpacity={0.7}>
            <Icon name="help-circle" size={20} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.tabContent}>
          {tabs.map((tab, index) => (
            <TabContent
              key={index}
              component={tab.component}
              index={index}
              selectedTab={selectedTab}
              fadeAnim={fadeAnim}
              colors={colors}
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
    alignItems: 'center',
    height: 70,
    position: 'relative',
    borderRadius: 20,
    borderWidth: 0.5,
    marginHorizontal: 16,
    marginTop: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabHelpButton: {
    width: HELP_BUTTON_WIDTH,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Uniform;
