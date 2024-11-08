import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {
  Ai,
  Setting,
  Splash,
  Order,
  LanguageSelectionScreen,
  Profile,
  Upload,
  Login,
  Daily,
  Main,
  Checkin,
  Leave,
  ReportView,
  Report,
  Notifications,
  Event,
  Important,
  Salary,
  PlanProduction,
  Message,
  ChatScreen,
  Uniform,
} from '../screens';
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
          name="Profile"
          component={Profile}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="ReportView"
          component={ReportView}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Salary"
          component={Salary}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Report"
          component={Report}
          options={{headerShown: true}}
        />
        <Stack.Screen name="Leave" component={Leave} />
        <Stack.Screen
          name="Upload"
          component={Upload}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Language"
          component={LanguageSelectionScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Uniform"
          component={Uniform}
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
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Important"
          component={Important}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="Event"
          component={Event}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PlanProduction"
          component={PlanProduction}
          options={{headerShown: true}}
        />
        <Stack.Screen name="Ai" component={Ai} options={{headerShown: true}} />
        <Stack.Screen
          name="Message"
          component={Message}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
