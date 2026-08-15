import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';
import {DarkModeToggle} from '../components';

const Setting = () => {
  const [selectedLocale, setSelectedLocale] = useState('en');

  const {t} = useTranslation();
  const navigation = useNavigation();
  const {colors, isDarkMode} = useTheme();

  const getLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem('Language');
      return lang;
    } catch (error) {
      console.error('Error getting language:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeLanguage = async () => {
      const lang = await getLanguage();
      if (lang) {
        setSelectedLocale(lang);
        i18next.changeLanguage(lang);
      } else {
        setSelectedLocale('en'); // Default fallback
      }
    };
    initializeLanguage();
  }, []);

  const supportedLocales = [
    {id: 'en', label: 'English', flag: '🇺🇸'},
    {id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳'},
    {id: 'ja', label: '日本語', flag: '🇯🇵'},
    {id: 'pt', label: 'Português (Brasil)', flag: '🇧🇷'},
  ];

  const onSelectLocale = async locale => {
    try {
      await AsyncStorage.setItem('Language', locale);
      setSelectedLocale(locale);
      await i18next.changeLanguage(locale);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const renderItem = ({item}) => {
    if (!item || !item.id) return null; // Safety check

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          {
            backgroundColor:
              selectedLocale === item.id
                ? colors.primaryLight
                : colors.surface,
            borderColor:
              selectedLocale === item.id ? colors.primary : colors.border,
          },
          selectedLocale === item.id && styles.selectedLanguageItem,
        ]}
        onPress={() => onSelectLocale(item.id)}
        activeOpacity={0.7}>
        <Text style={styles.flagText}>{item.flag || '🏳️'}</Text>
        <Text
          style={[
            styles.languageText,
            {
              color: selectedLocale === item.id ? colors.primary : colors.text,
            },
            selectedLocale === item.id && styles.selectedLanguageText,
          ]}>
          {item.label || 'Unknown'}
        </Text>
        {selectedLocale === item.id && (
          <Icon name="check" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={colors.primaryGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings', 'Settings')}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Dark Mode Toggle Section */}
        <View style={[styles.sectionHeader, {borderBottomColor: colors.border}]}>
          <Icon name="theme-light-dark" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            {t('theme', 'Theme')}
          </Text>
        </View>
        
        <View style={[styles.settingItem, {backgroundColor: colors.surface, borderColor: colors.border}]}>
          <DarkModeToggle size="large" />
        </View>

        <View style={[styles.sectionHeader, {borderBottomColor: colors.border}]}>
          <Icon name="account-key-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            {t('changepassword.account_section', 'Account')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.settingItem, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => navigation.navigate('ChangePassword')}
          activeOpacity={0.7}>
          <View style={styles.settingItemContent}>
            <Icon name="lock-reset" size={22} color={colors.primary} />
            <Text style={[styles.settingItemText, {color: colors.text}]}>
              {t('changepassword.title', 'Change Password')}
            </Text>
            <Icon name="chevron-right" size={22} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, {backgroundColor: colors.surface, borderColor: colors.border}]}
          onPress={() => navigation.navigate('Support')}
          activeOpacity={0.7}>
          <View style={styles.settingItemContent}>
            <Icon name="help-circle-outline" size={22} color={colors.primary} />
            <Text style={[styles.settingItemText, {color: colors.text}]}>
              {t('support.title', 'Help & Support')}
            </Text>
            <Icon name="chevron-right" size={22} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <View style={[styles.sectionHeader, {borderBottomColor: colors.border}]}>
          <Icon name="translate" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('language', 'Language')}</Text>
        </View>

        <FlatList
          data={supportedLocales}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedLocale}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity
          style={[styles.applyButton, {backgroundColor: colors.primary}]}
          onPress={() => navigation.goBack()}>
          <Icon
            name="check"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.applyButtonText}>{t('apply', 'Apply')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  settingItem: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 14,
  },
  listContainer: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  selectedLanguageItem: {
    borderWidth: 2,
  },
  flagText: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Setting;
