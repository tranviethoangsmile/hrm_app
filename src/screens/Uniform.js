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
import {useNavigation} from '@react-navigation/native';
import {COLORS, SIZES, FONTS, SHADOWS, LAYOUT} from '../config/theme';

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

const TabButton = ({icon, title, selected, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(selected ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: selected ? 1.2 : 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeAnim, {
        toValue: selected ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selected, scaleAnim, fadeAnim]);

  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{scale: scaleAnim}],
            opacity: fadeAnim,
          },
        ]}>
        <Icon
          name={icon}
          size={24}
          color={selected ? COLORS.primary : COLORS.gray400}
        />
        <Text style={[styles.tabText, selected && styles.selectedText]}>
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
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTab, setSelectedTab] = useState(0);
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const tabs = [
    {
      icon: 'shopping-bag',
      title: t('select.product'),
      component: <SelectProductTab USER_INFOR={USER_INFOR} />,
    },
    {
      icon: 'pending',
      title: t('processing.product'),
      component: <ProcessingOrdersTab USER_INFOR={USER_INFOR} />,
    },
    {
      icon: 'check-circle',
      title: t('completed.product'),
      component: <CompletedOrdersTab USER_INFOR={USER_INFOR} />,
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
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />

      <Header
        title={t('uniform.title')}
        onBack={() => navigation.goBack()}
        backgroundColor={COLORS.primary}
        textColor={COLORS.white}
        right={
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => {
              /* Add help functionality */
            }}>
            <Icon name="help-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <Animated.View style={[styles.tabBar, {elevation: 4}]}>
          {tabs.map((tab, index) => (
            <TabButton
              key={index}
              icon={tab.icon}
              title={tab.title}
              selected={selectedTab === index}
              onPress={() => handleTabPress(index)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: 60,
    ...SHADOWS.medium,
    position: 'relative',
    marginBottom: SIZES.base,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base,
    marginTop: SIZES.base,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: TAB_WIDTH,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabText: {
    ...FONTS.body5,
    color: COLORS.gray400,
    marginTop: SIZES.base / 2,
    textAlign: 'center',
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '600',
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
    backgroundColor: COLORS.background,
  },
});

export default Uniform;
