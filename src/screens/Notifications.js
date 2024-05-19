import {View, Text, SafeAreaView, StatusBar} from 'react-native';
import React from 'react';

const Notifications = () => {
  return (
    <SafeAreaView>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View>
        <Text>Notifications</Text>
      </View>
    </SafeAreaView>
  );
};

export default Notifications;
