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
  Manager,
  Report,
  Notifications,
  Event,
  Important,
  Salary,
  PlanProduction,
  Message,
  ChatScreen,
  Uniform,
  OvertimeConfirm,
  Dependent,
  DependentSupportAmount,
  FirstLoginPassword,
  Schedule,
  IDCard,
  Directory,
  Docs,
  SalaryTrend,
  Approvals,
  ChangePassword,
  EditProfile,
  Support,
  Learning,
  PayslipHistory,
  AttendanceSummary,
  Survey,
  Benefits,
  Translator,
  OrgChart,
  Performance,
  Referral,
  ShiftSwap,
  Asset,
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
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ReportView"
          component={Manager}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Salary"
          component={Salary}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Report"
          component={Report}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Leave"
          component={Leave}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Upload"
          component={Upload}
          options={{headerShown: false}}
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
          name="FirstLoginPassword"
          component={FirstLoginPassword}
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
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Order"
          component={Order}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Checkin"
          component={Checkin}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Important"
          component={Important}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Event"
          component={Event}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PlanProduction"
          component={PlanProduction}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Ai" component={Ai} options={{headerShown: false}} />
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
        <Stack.Screen
          name="OvertimeConfirm"
          component={OvertimeConfirm}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Dependent"
          component={Dependent}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DependentSupportAmount"
          component={DependentSupportAmount}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Schedule"
          component={Schedule}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="IDCard"
          component={IDCard}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Directory"
          component={Directory}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Docs"
          component={Docs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SalaryTrend"
          component={SalaryTrend}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Approvals"
          component={Approvals}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Support"
          component={Support}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Learning"
          component={Learning}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PayslipHistory"
          component={PayslipHistory}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AttendanceSummary"
          component={AttendanceSummary}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Survey"
          component={Survey}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Benefits"
          component={Benefits}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Translator"
          component={Translator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OrgChart"
          component={OrgChart}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Performance"
          component={Performance}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Referral"
          component={Referral}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ShiftSwap"
          component={ShiftSwap}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Asset"
          component={Asset}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
