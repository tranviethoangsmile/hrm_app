/* eslint-disable react-hooks/exhaustive-deps */
import {View, StyleSheet, Image, ActivityIndicator, Text} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const navigation = useNavigation();
  const authData = useSelector(state => state.auth);
  useEffect(() => {
    let timeout;
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        timeout = setTimeout(() => {
          if (authData.data != null) {
            navigation.replace('Main');
          } else {
            navigation.replace('Login');
          }
        }, 3000);
      } else {
        navigation.navigate('Language');
      }
    };
    checkLanguage();
    return () => clearTimeout(timeout);
  }, []);
  return (
    <View style={styles.container}>
      <Image source={require('../images/logo_metal.png')} style={styles.logo} />
      <View style={{height: 5}} />
      <ActivityIndicator size="large" color="#fff" />
      <View style={styles.versionTextView}>
        <Text style={styles.text}>version 1.0.6</Text>
      </View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  versionTextView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },

  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: '60%',
    resizeMode: 'contain',
  },
  text: {
    color: '#fff',
  },
});
