/* eslint-disable react-hooks/exhaustive-deps */
import {View, Text, StyleSheet, Image} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
const Splash = () => {
  const navigation = useNavigation();
  const authData = useSelector(state => state.auth);
  useEffect(() => {
    setTimeout(() => {
      console.log(authData.data);
      if (authData.data == null) {
        navigation.navigate('Login');
      } else {
        navigation.replace('Home', {user: authData.data});
      }
    }, 3000);
    return;
  }, []);
  return (
    <View style={styles.container}>
      <Image
        source={require('../images/daihatsu_logo.jpg')}
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
    width: '50%',
    height: '40%',
    resizeMode: 'contain',
  },
});
