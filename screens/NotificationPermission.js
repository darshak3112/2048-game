import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function NotificationPermission({ navigation }) {
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Allow notifications for game updates?
      </Text>
      <Button
        title="Continue to Game"
        onPress={() => navigation.navigate('MainMenu')}
      />
    </View>
  );
}