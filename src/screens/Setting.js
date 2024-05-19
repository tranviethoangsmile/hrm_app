import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';

const Setting = () => {
  const [selectedLocale, setSelectedLocale] = useState('');

  const {t} = useTranslation();
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
  }, [selectedLocale]);

  const navigation = useNavigation();

  const supportedLocales = [
    {id: 'en', label: 'English'},
    {id: 'vn', label: 'Tiếng Việt'},
    {id: 'jp', label: '日本語'},
    {id: 'br', label: 'Português (Brasil)'},
  ];

  const onSelectLocale = async locale => {
    try {
      await AsyncStorage.setItem('Language', locale);
      setSelectedLocale(locale);
    } catch (error) {
      console.error('Error saving language:', error);
      // Display error message to the user
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.languageButton,
        selectedLocale === item.id && styles.selectedLanguage,
      ]}
      onPress={() => onSelectLocale(item.id)}>
      <Text style={styles.languageText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.tileView}>
        <Text style={styles.title}>{t('lng')}</Text>
      </View>
      <View style={styles.listView}>
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={supportedLocales}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedLocale}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Text style={styles.nextButtonText}>{t('appl')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listView: {
    flex: 0.4,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileView: {
    flex: 0.1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  listContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  languageButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 18,
    color: TEXT_COLOR,
  },
  selectedLanguage: {
    backgroundColor: THEME_COLOR,
  },
  buttonContainer: {
    flex: 0.2,
    width: '100%',
  },
  nextButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: THEME_COLOR_2,
    borderRadius: 5,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Setting;
