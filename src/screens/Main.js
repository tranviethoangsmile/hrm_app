/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  useColorScheme,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import {useSelector} from 'react-redux';
import HomeTab from '../components/tabs/HomeTab';
import FeatureTab from '../components/tabs/FeatureTab';
import {useNavigation} from '@react-navigation/native';

const Main = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {selectedTab === 0 ? <HomeTab /> : <FeatureTab />}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab(0);
          }}>
          <Icon
            name={'home'}
            size={50}
            color={selectedTab === 0 ? THEME_COLOR_2 : '#000'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Checkin');
          }}>
          <View style={styles.checkInIcon}>
            <Icon name={'finger-print-outline'} size={50} color={'white'} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab(1);
          }}>
          <Icon
            name={'reorder-four'}
            size={60}
            color={selectedTab === 1 ? THEME_COLOR_2 : '#000'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLOR_2,
    marginLeft: 20,
  },
  bottomNav: {
    position: 'absolute',
    width: '100%',
    height: 80,
    backgroundColor: '#f2f2f2',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  btnIcon: {
    width: 50,
    height: 50,
  },
  checkInIcon: {
    backgroundColor: THEME_COLOR_2,
    marginBottom: 50,
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Main;
