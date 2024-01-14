import {View, Text, SafeAreaView} from 'react-native';
import React from 'react';
import {Provider} from 'react-redux';
import MainNavigator from './src/navigation/MainNavigator';
import MyStore from './src/redux/MyStore';

const App = () => {
  return (
    <Provider store={MyStore}>
      <MainNavigator />
    </Provider>
  );
};
export default App;
