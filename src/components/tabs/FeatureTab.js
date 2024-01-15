/* eslint-disable no-unused-vars */
import {View, Text, StyleSheet, ScrollView, Platform} from 'react-native';
import React from 'react';
import {TEXT_COLOR, THEME_COLOR_2} from '../../utils/Colors';
import {useNavigation} from '@react-navigation/native';
const FeatureTab = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FEATURES</Text>
      <View style={styles.crollView}>
        <ScrollView>
          <View style={styles.feature}>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Report</Text>
            </View>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Order</Text>
            </View>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>AI</Text>
            </View>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Maket</Text>
            </View>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Leave</Text>
            </View>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Message</Text>
            </View>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Upload</Text>
            </View>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Learning</Text>
            </View>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureBnt}>
              <Text style={styles.featureBtn}>Report View</Text>
            </View>
            <View style={styles.featureBnt}>
              <Text
                style={styles.featureBtn}
                onPress={() => {
                  navigation.navigate('Daily');
                }}>
                Daily
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default FeatureTab;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 5,
  },
  title: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_COLOR,
    textDecorationLine: 'underline',
  },
  feature: {
    width: '100%',
    height: 70,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  featureBnt: {
    width: '50%',
    height: '100%',
    borderWidth: 1,
    borderRadius: 30,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crollView: {
    ...Platform.select({
      android: {
        width: '100%',
        height: '85%',
      },
    }),
  },
  featureBtn: {
    color: TEXT_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
