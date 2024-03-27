/* eslint-disable react-hooks/exhaustive-deps */
import {View, StyleSheet, Image} from 'react-native';
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
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        setTimeout(() => {
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
  }, []);
  return (
    <View style={styles.container}>
      <Image source={require('../images/logo_metal.png')} style={styles.logo} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
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
});
