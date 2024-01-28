/* eslint-disable no-unused-vars */
import React from 'react';
import {View, Text, StyleSheet, ScrollView, Platform} from 'react-native';
import {TEXT_COLOR, THEME_COLOR_2, BG_COLOR} from '../../utils/Colors';
import {useNavigation} from '@react-navigation/native';

const FeatureTab = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FEATURES</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                /* Handle 'Report' button press */
              }}>
              Report
            </Text>
          </View>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                navigation.navigate('Order');
              }}>
              Order
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                navigation.navigate('Ai');
              }}>
              AI
            </Text>
          </View>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>Market</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>Leave</Text>
          </View>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>Message</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>Upload</Text>
          </View>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>Learning</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureBtn}>
            <Text style={styles.featureText}>Report View</Text>
          </View>
          <View style={styles.featureBtn}>
            <Text
              style={styles.featureText}
              onPress={() => {
                navigation.navigate('Daily');
              }}>
              Daily
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FeatureTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: BG_COLOR,
  },
  title: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLOR_2,
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
  },
  featureBtn: {
    flex: 1,
    height: 70,
    borderWidth: 1,
    borderRadius: 30,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR_2,
  },
  scrollView: {
    flex: 1,
  },
  featureText: {
    color: TEXT_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
