/* eslint-disable react-hooks/exhaustive-deps */
import {View, StyleSheet, Image} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
const Splash = () => {
  const navigation = useNavigation();
  const authData = useSelector(state => state.auth);
  useEffect(() => {
    setTimeout(() => {
      if (authData.data == null) {
        navigation.navigate('Login');
      } else {
        navigation.replace('Main', {user: authData.data});
      }
    }, 3000);
    return;
  }, []);
  return (
    <View style={styles.container}>
      <Image
        source={require('../images/logo_shiga_daihatsu.jpg')}
        style={styles.logo}
      />
    </View>
  );
};

export default Splash;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: '60%',
    resizeMode: 'contain',
  },
});
