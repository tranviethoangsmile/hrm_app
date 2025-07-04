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
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';

const Setting = () => {
  const [selectedLocale, setSelectedLocale] = useState('en');

  const {t} = useTranslation();
  const navigation = useNavigation();

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
          selectedLocale === item.id && styles.selectedLanguageItem,
        ]}
        onPress={() => onSelectLocale(item.id)}
        activeOpacity={0.7}>
        <Text style={styles.flagText}>{item.flag || '🏳️'}</Text>
        <Text
          style={[
            styles.languageText,
            selectedLocale === item.id && styles.selectedLanguageText,
          ]}>
          {item.label || 'Unknown'}
        </Text>
        {selectedLocale === item.id && (
          <Icon name="check" size={20} color={THEME_COLOR} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
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
        <View style={styles.sectionHeader}>
          <Icon name="translate" size={24} color={THEME_COLOR} />
          <Text style={styles.sectionTitle}>{t('language', 'Language')}</Text>
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
          style={styles.applyButton}
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
    backgroundColor: '#f8fafc',
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
    borderBottomColor: '#e0e6ed',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginLeft: 12,
  },
  listContainer: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
    borderColor: '#f0f4f8',
  },
  selectedLanguageItem: {
    borderColor: THEME_COLOR,
    borderWidth: 2,
    backgroundColor: '#f8f9ff',
  },
  flagText: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: THEME_COLOR,
    fontWeight: 'bold',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLOR_2,
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
