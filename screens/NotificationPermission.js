import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NotificationPermission = () => {
  const navigation = useNavigation();
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [achievementAlertsEnabled, setAchievementAlertsEnabled] = useState(false);
  const [notificationsPermission, setNotificationsPermission] = useState(false);

  useEffect(() => {
    checkNotificationSettings();
  }, []);

  const checkNotificationSettings = async () => {
    try {
      // Check system permission status
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsPermission(status === 'granted');
      
      // Load user preferences from storage
      const dailyReminder = await AsyncStorage.getItem('@2048_dailyReminder');
      const achievementAlerts = await AsyncStorage.getItem('@2048_achievementAlerts');
      
      setDailyReminderEnabled(dailyReminder === 'true');
      setAchievementAlertsEnabled(achievementAlerts === 'true');
    } catch (error) {
      console.log('Error loading notification settings', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'To receive notifications, you need to enable permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      setNotificationsPermission(true);
      return true;
    } catch (error) {
      console.log('Error requesting notification permissions', error);
      return false;
    }
  };

  const toggleDailyReminder = async (value) => {
    if (value && !notificationsPermission) {
      const granted = await requestPermissions();
      if (!granted) return;
    }
    
    setDailyReminderEnabled(value);
    await AsyncStorage.setItem('@2048_dailyReminder', value.toString());
    
    if (value) {
      scheduleDailyReminder();
    } else {
      cancelDailyReminder();
    }
  };

  const toggleAchievementAlerts = async (value) => {
    if (value && !notificationsPermission) {
      const granted = await requestPermissions();
      if (!granted) return;
    }
    
    setAchievementAlertsEnabled(value);
    await AsyncStorage.setItem('@2048_achievementAlerts', value.toString());
  };

  const scheduleDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '2048 Daily Challenge',
        body: 'Ready for your daily 2048 challenge? Your game is waiting!',
        sound: true,
      },
      trigger: {
        hour: 19, // 7 PM
        minute: 0,
        repeats: true,
      },
    });
  };

  const cancelDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const resetSettings = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all notification settings?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            setDailyReminderEnabled(false);
            setAchievementAlertsEnabled(false);
            await AsyncStorage.removeItem('@2048_dailyReminder');
            await AsyncStorage.removeItem('@2048_achievementAlerts');
            await Notifications.cancelAllScheduledNotificationsAsync();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Daily Reminder</Text>
            <Text style={styles.settingDescription}>
              Receive a daily reminder to play 2048
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#BBADA0', true: '#8F7A66' }}
            thumbColor={dailyReminderEnabled ? '#F9F6F2' : '#F5F5F5'}
            ios_backgroundColor="#BBADA0"
            onValueChange={toggleDailyReminder}
            value={dailyReminderEnabled}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Achievement Alerts</Text>
            <Text style={styles.settingDescription}>
              Get notified when you reach new milestones
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#BBADA0', true: '#8F7A66' }}
            thumbColor={achievementAlertsEnabled ? '#F9F6F2' : '#F5F5F5'}
            ios_backgroundColor="#BBADA0"
            onValueChange={toggleAchievementAlerts}
            value={achievementAlertsEnabled}
          />
        </View>
        
        <Text style={styles.permissionStatus}>
          {notificationsPermission 
            ? 'Notification permissions enabled' 
            : 'Notification permissions not granted'}
        </Text>
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetSettings}
        >
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>2048 Game v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE4DA',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#8F7A66',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#776E65',
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#776E65',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE4DA',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#776E65',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: '#968A84',
  },
  permissionStatus: {
    marginTop: 20,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#968A84',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#F67C5F',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#BBADA0',
  },
});

export default NotificationPermission;