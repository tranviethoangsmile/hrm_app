import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Checkin from '../screens/Checkin';
import Main from '../screens/Main';
import Daily from '../screens/Daily';
import Order from '../screens/Order';
import Ai from '../screens/Ai';
const Stack = createStackNavigator();
const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Daily"
          component={Daily}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Order"
          component={Order}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Checkin"
          component={Checkin}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Ai" component={Ai} options={{headerShown: true}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;