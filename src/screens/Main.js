/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
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
import React, {useState} from 'react';
import {THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import {useSelector} from 'react-redux';
import HomeTab from '../components/tabs/HomeTab';
import FeatureTab from '../components/tabs/FeatureTab';
const Main = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const authData = useSelector(state => state.auth);
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {selectedTab == 0 ? <HomeTab /> : <FeatureTab />}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab(0);
          }}>
          <Image
            source={require('../images/home_icon.png')}
            style={[
              styles.btnIcon,
              {tintColor: selectedTab === 0 ? '#BB2525' : '#000'},
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={styles.checkInIcon}>
            <Image
              source={require('../images/checkin_icon.png')}
              style={[styles.btnIcon, {tintColor: '#fff'}]}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab(1);
          }}>
          <Image
            source={require('../images/features_icon.png')}
            style={[
              styles.btnIcon,
              {tintColor: selectedTab === 1 ? THEME_COLOR_2 : '#000'},
            ]}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Main;
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
