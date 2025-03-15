import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import GameScreen from '../screens/GameScreen';
import MainMenu from '../screens/MainMenu';
import NotificationPermission from '../screens/NotificationPermission';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FAF8EF' }
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenu} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="NotificationPermission" component={NotificationPermission} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};