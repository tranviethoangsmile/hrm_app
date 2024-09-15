import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Button,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';

const LanguageSelectionScreen = () => {
  const navigation = useNavigation();
  const [selectedLocale, setSelectedLocale] = useState('');

  const supportedLocales = [
    {id: 'en', label: 'English'},
    {id: 'vi', label: 'Tiếng Việt'},
    {id: 'ja', label: '日本語'},
    {id: 'pt', label: 'Português (Brasil)'},
  ];

  const onSelectLocale = async locale => {
    try {
      await AsyncStorage.setItem('Language', locale);
      setSelectedLocale(locale);
    } catch (error) {
      console.error('Error saving language:', error);
      // Hiển thị thông báo lỗi cho người dùng
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
      <Text style={styles.title}>Choose Your Language</Text>
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={supportedLocales}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={selectedLocale}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            navigation.navigate('Login');
          }}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// LanguageSelectionScreen.js

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 100,
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
  selectedLanguageText: {
    color: 'white',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
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

export default LanguageSelectionScreen;
