"use client"

import { useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useGameLogic } from "../utils/gameLogic"
import ThemeSelector from "../components/ThemeSelector"

const MainMenu = () => {
  const navigation = useNavigation()
  const { highScore, gridSize, changeGridSize, boardSizes, ongoingGames, theme } = useGameLogic()

  const [showBoardSizeModal, setShowBoardSizeModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)

  const hasOngoingGames = Object.keys(ongoingGames).length > 0

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.name === "Dark" ? "light-content" : "dark-content"} />

      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: theme.text }]}>2048</Text>
        <Text style={[styles.tagline, { color: theme.text }]}>Join the numbers and get to 2048!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.grid }]}>
          <Text style={[styles.statLabel, { color: theme.buttonText }]}>HIGH SCORE</Text>
          <Text style={[styles.statValue, { color: theme.buttonText }]}>{highScore}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.grid }]}>
          <Text style={[styles.statLabel, { color: theme.buttonText }]}>BOARD SIZE</Text>
          <Text style={[styles.statValue, { color: theme.buttonText }]}>
            {gridSize}×{gridSize}
          </Text>
        </View>
      </View>

      {hasOngoingGames && (
        <View style={styles.ongoingGamesContainer}>
          <Text style={[styles.ongoingGamesTitle, { color: theme.text }]}>Continue Playing</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ongoingGamesScroll}
          >
            {Object.keys(ongoingGames).map((size) => (
              <TouchableOpacity
                key={`ongoing-${size}`}
                style={[styles.ongoingGameCard, { backgroundColor: theme.secondaryButton }]}
                onPress={() => {
                  changeGridSize(Number.parseInt(size))
                  navigation.navigate("GameScreen")
                }}
              >
                <Text style={[styles.ongoingGameSize, { color: theme.buttonText }]}>
                  {size}×{size}
                </Text>
                <Text style={[styles.ongoingGameScore, { color: theme.buttonText }]}>
                  Score: {ongoingGames[size].score}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.button }]}
          onPress={() => navigation.navigate("GameScreen")}
        >
          <Text style={[styles.menuButtonText, { color: theme.buttonText }]}>PLAY GAME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.secondaryButton }]}
          onPress={() => setShowBoardSizeModal(true)}
        >
          <Text style={[styles.menuButtonText, { color: theme.buttonText }]}>CHANGE BOARD SIZE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.secondaryButton }]}
          onPress={() => setShowThemeModal(true)}
        >
          <Text style={[styles.menuButtonText, { color: theme.buttonText }]}>CHANGE THEME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.secondaryButton }]}
          onPress={() => navigation.navigate("NotificationPermission")}
        >
          <Text style={[styles.menuButtonText, { color: theme.buttonText }]}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.text }]}>Swipe to combine tiles. Get to the 2048 tile!</Text>
      </View>

      {/* Board Size Selection Modal */}
      <Modal
        transparent={true}
        visible={showBoardSizeModal}
        animationType="fade"
        onRequestClose={() => setShowBoardSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Board Size</Text>

            <ScrollView style={styles.boardSizeList}>
              {boardSizes.map((size) => (
                <TouchableOpacity
                  key={`size-${size}`}
                  style={[
                    styles.boardSizeOption,
                    {
                      borderBottomColor: theme.secondaryButton,
                      backgroundColor: gridSize === size ? theme.secondaryButton : "transparent",
                    },
                  ]}
                  onPress={() => {
                    changeGridSize(size)
                    setShowBoardSizeModal(false)
                  }}
                >
                  <Text
                    style={[
                      styles.boardSizeText,
                      {
                        color: gridSize === size ? theme.buttonText : theme.text,
                        fontWeight: gridSize === size ? "bold" : "normal",
                      },
                    ]}
                  >
                    {size} × {size}
                  </Text>
                  {ongoingGames[size] && (
                    <Text style={[styles.ongoingLabel, { color: theme.text }]}>Game in progress</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.secondaryButton }]}
              onPress={() => setShowBoardSizeModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Selector Modal */}
      <ThemeSelector visible={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 72,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 30,
    justifyContent: "space-between",
    width: "80%",
  },
  statBox: {
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    minWidth: 120,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
  },
  ongoingGamesContainer: {
    width: "100%",
    marginBottom: 30,
  },
  ongoingGamesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  ongoingGamesScroll: {
    paddingHorizontal: 10,
  },
  ongoingGameCard: {
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    minHeight: 100,
  },
  ongoingGameSize: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ongoingGameScore: {
    fontSize: 14,
  },
  menuContainer: {
    width: "80%",
    marginBottom: 30,
  },
  menuButton: {
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  boardSizeList: {
    maxHeight: 300,
  },
  boardSizeOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
  },
  boardSizeText: {
    fontSize: 18,
    textAlign: "center",
  },
  ongoingLabel: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default MainMenu

