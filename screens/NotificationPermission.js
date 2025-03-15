"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Switch, SafeAreaView, StatusBar, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { useGameLogic } from "../utils/gameLogic"

const NotificationPermission = () => {
  const navigation = useNavigation()
  const { theme } = useGameLogic()
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false)
  const [achievementAlertsEnabled, setAchievementAlertsEnabled] = useState(false)
  const [notificationsPermission, setNotificationsPermission] = useState(false)

  useEffect(() => {
    checkNotificationSettings()
  }, [])

  const checkNotificationSettings = async () => {
    try {
      // Check system permission status
      const { status } = await Notifications.getPermissionsAsync()
      setNotificationsPermission(status === "granted")

      // Load user preferences from storage
      const dailyReminder = await AsyncStorage.getItem("@2048_dailyReminder")
      const achievementAlerts = await AsyncStorage.getItem("@2048_achievementAlerts")

      setDailyReminderEnabled(dailyReminder === "true")
      setAchievementAlertsEnabled(achievementAlerts === "true")
    } catch (error) {
      console.log("Error loading notification settings", error)
    }
  }

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "To receive notifications, you need to enable permissions in your device settings.",
          [{ text: "OK" }],
        )
        return false
      }
      setNotificationsPermission(true)
      return true
    } catch (error) {
      console.log("Error requesting notification permissions", error)
      return false
    }
  }

  const toggleDailyReminder = async (value) => {
    if (value && !notificationsPermission) {
      const granted = await requestPermissions()
      if (!granted) return
    }

    setDailyReminderEnabled(value)
    await AsyncStorage.setItem("@2048_dailyReminder", value.toString())

    if (value) {
      scheduleDailyReminder()
    } else {
      cancelDailyReminder()
    }
  }

  const toggleAchievementAlerts = async (value) => {
    if (value && !notificationsPermission) {
      const granted = await requestPermissions()
      if (!granted) return
    }

    setAchievementAlertsEnabled(value)
    await AsyncStorage.setItem("@2048_achievementAlerts", value.toString())
  }

  const scheduleDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync()

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "2048 Daily Challenge",
        body: "Ready for your daily 2048 challenge? Your game is waiting!",
        sound: true,
      },
      trigger: {
        hour: 19, // 7 PM
        minute: 0,
        repeats: true,
      },
    })
  }

  const cancelDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync()
  }

  const resetSettings = async () => {
    Alert.alert("Reset Settings", "Are you sure you want to reset all notification settings?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset",
        onPress: async () => {
          setDailyReminderEnabled(false)
          setAchievementAlertsEnabled(false)
          await AsyncStorage.removeItem("@2048_dailyReminder")
          await AsyncStorage.removeItem("@2048_achievementAlerts")
          await Notifications.cancelAllScheduledNotificationsAsync()
        },
        style: "destructive",
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.name === "Dark" ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, { color: theme.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>

        <View style={[styles.settingItem, { borderBottomColor: theme.grid }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Daily Reminder</Text>
            <Text style={[styles.settingDescription, { color: theme.text }]}>
              Receive a daily reminder to play 2048
            </Text>
          </View>
          <Switch
            trackColor={{ false: theme.grid, true: theme.button }}
            thumbColor={dailyReminderEnabled ? theme.buttonText : "#F5F5F5"}
            ios_backgroundColor={theme.grid}
            onValueChange={toggleDailyReminder}
            value={dailyReminderEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: theme.grid }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Achievement Alerts</Text>
            <Text style={[styles.settingDescription, { color: theme.text }]}>
              Get notified when you reach new milestones
            </Text>
          </View>
          <Switch
            trackColor={{ false: theme.grid, true: theme.button }}
            thumbColor={achievementAlertsEnabled ? theme.buttonText : "#F5F5F5"}
            ios_backgroundColor={theme.grid}
            onValueChange={toggleAchievementAlerts}
            value={achievementAlertsEnabled}
          />
        </View>

        <Text style={[styles.permissionStatus, { color: theme.text }]}>
          {notificationsPermission ? "Notification permissions enabled" : "Notification permissions not granted"}
        </Text>

        <TouchableOpacity style={[styles.resetButton, { backgroundColor: "#F67C5F" }]} onPress={resetSettings}>
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.text }]}>2048 Game v1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE4DA",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
  },
  permissionStatus: {
    marginTop: 20,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 30,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionContainer: {
    padding: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
  },
})

export default NotificationPermission

