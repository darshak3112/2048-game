import { createStackNavigator } from '@react-navigation/stack';
import NotificationPermission from '../screens/NotificationPermission';
import MainMenu from '../screens/MainMenu';
import GameScreen from '../screens/GameScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="NotificationPermission">
      <Stack.Screen 
        name="NotificationPermission" 
        component={NotificationPermission}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MainMenu" 
        component={MainMenu} 
        options={{ title: '2048 Game' }}
      />
      <Stack.Screen 
        name="GameScreen" 
        component={GameScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}