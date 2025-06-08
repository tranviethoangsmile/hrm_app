/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {THEME_COLOR} from '../utils/Colors';
import {useColorScheme} from 'react-native';
import {
  SelectProductTab,
  ProcessingOrdersTab,
  CompletedOrdersTab,
} from '../components/uniformtabs';
import {useTranslation} from 'react-i18next';
import Header from '../components/common/Header';
import {useNavigation} from '@react-navigation/native';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';

const Uniform = ({route}) => {
  const {t} = useTranslation();
  const {USER_INFOR} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTab, setSelectedTab] = useState(0);
  const navigation = useNavigation();

  const renderContent = ({USER_INFOR}) => {
    switch (selectedTab) {
      case 0:
        return <SelectProductTab USER_INFOR={USER_INFOR} />;
      case 1:
        return <ProcessingOrdersTab USER_INFOR={USER_INFOR} />;
      case 2:
        return <CompletedOrdersTab USER_INFOR={USER_INFOR} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title={t('uniform.title', 'Đồng phục')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.topNav}>
        <TouchableOpacity
          style={selectedTab === 0 ? styles.selectedTab : styles.tab}
          onPress={() => setSelectedTab(0)}>
          <Icon
            name="pricetag"
            size={24}
            color={selectedTab === 0 ? THEME_COLOR : '#7a7a7a'}
          />
          <Text
            style={[styles.tabText, selectedTab === 0 && styles.selectedText]}>
            {t('select.product')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selectedTab === 1 ? styles.selectedTab : styles.tab}
          onPress={() => setSelectedTab(1)}>
          <Icon
            name="cart"
            size={24}
            color={selectedTab === 1 ? THEME_COLOR : '#7a7a7a'}
          />
          <Text
            style={[styles.tabText, selectedTab === 1 && styles.selectedText]}>
            {t('processing.product')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selectedTab === 2 ? styles.selectedTab : styles.tab}
          onPress={() => setSelectedTab(2)}>
          <Icon
            name="checkmark-done"
            size={24}
            color={selectedTab === 2 ? THEME_COLOR : '#7a7a7a'}
          />
          <Text
            style={[styles.tabText, selectedTab === 2 && styles.selectedText]}>
            {t('completed.product')}
          </Text>
        </TouchableOpacity>
      </View>
      {renderContent({USER_INFOR, t})}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNav: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    ...SHADOWS.light,
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: SIZES.radius,
  },
  selectedTab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray1,
    ...SHADOWS.light,
  },
  tabText: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default Uniform;
