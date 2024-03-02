import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import MainNavigator from './src/navigation/MainNavigator';
import MyStore from './src/redux/MyStore';
import {
  NotificationServices,
  requestUserPermission,
} from './src/utils/notification/PushNotifications';

const App = () => {
  useEffect(() => {
    requestUserPermission();
    NotificationServices();
  }, []);
  return (
    <Provider store={MyStore}>
      <MainNavigator />
    </Provider>
  );
};
export default App;
