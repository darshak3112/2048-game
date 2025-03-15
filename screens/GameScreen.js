"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, Animated, Dimensions } from "react-native"
import GestureRecognizer from "react-native-swipe-gestures"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useGameLogic } from "../utils/gameLogic"
import GridTile from "../components/GridTile"
import _ from "lodash"

const GameScreen = () => {
  const navigation = useNavigation()
  const {
    gridData,
    gridSize,
    score,
    highScore,
    gameOver,
    reachedTarget,
    continueAfterTarget,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    newGame,
    loadGameState,
    undoMove,
    redoMove,
    canUndo,
    canRedo,
    continueGame,
    theme,
  } = useGameLogic()

  const [showSavedGameModal, setShowSavedGameModal] = useState(false)
  const [showTargetReachedModal, setShowTargetReachedModal] = useState(false)

  // Animated values for directional slide effect
  const gridTranslateX = useRef(new Animated.Value(0)).current
  const gridTranslateY = useRef(new Animated.Value(0)).current

  // Get screen dimensions for responsive grid sizing
  const screenWidth = Dimensions.get("window").width
  const tileSize = Math.min(70, (screenWidth - 40) / gridSize - 10)
  const fontSize = Math.min(32, tileSize * 0.45)

  useEffect(() => {
    const checkForSavedGame = async () => {
      try {
        const key = `@2048_gameState_${gridSize}`
        const savedState = await AsyncStorage.getItem(key)
        if (savedState) {
          // Check if the saved game was in game over state
          const { gameOver: wasGameOver } = JSON.parse(savedState)

          if (wasGameOver) {
            // If game was over, start a new game
            newGame()
          } else {
            setShowSavedGameModal(true)
          }
        }
      } catch (error) {
        console.log("Error checking saved game state", error)
      }
    }
    checkForSavedGame()
  }, [])

  useEffect(() => {
    if (reachedTarget && !continueAfterTarget) {
      setShowTargetReachedModal(true)
    }
  }, [reachedTarget, continueAfterTarget])

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  }

  // Each handler calls the swipe function and then runs an Animated sequence
  const handleSwipeRight = () => {
    onSwipeRight()
    Animated.sequence([
      Animated.timing(gridTranslateX, {
        toValue: 20, // slide to right
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(gridTranslateX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleSwipeLeft = () => {
    onSwipeLeft()
    Animated.sequence([
      Animated.timing(gridTranslateX, {
        toValue: -20, // slide to left
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(gridTranslateX, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleSwipeUp = () => {
    onSwipeUp()
    Animated.sequence([
      Animated.timing(gridTranslateY, {
        toValue: -20, // slide upward
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(gridTranslateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleSwipeDown = () => {
    onSwipeDown()
    Animated.sequence([
      Animated.timing(gridTranslateY, {
        toValue: 20, // slide downward
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(gridTranslateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>2048</Text>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreBox, { backgroundColor: theme.grid }]}>
            <Text style={[styles.scoreLabel, { color: theme.buttonText }]}>SCORE</Text>
            <Text style={[styles.scoreValue, { color: theme.buttonText }]}>{score}</Text>
          </View>
          <View style={[styles.scoreBox, { backgroundColor: theme.grid }]}>
            <Text style={[styles.scoreLabel, { color: theme.buttonText }]}>BEST</Text>
            <Text style={[styles.scoreValue, { color: theme.buttonText }]}>{highScore}</Text>
          </View>
        </View>
      </View>

      <View style={styles.boardInfo}>
        <Text style={[styles.boardSizeText, { color: theme.text }]}>
          Board Size: {gridSize}×{gridSize}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={newGame}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>New Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: canUndo ? theme.button : theme.secondaryButton, opacity: canUndo ? 1 : 0.7 },
          ]}
          onPress={undoMove}
          disabled={!canUndo}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: canRedo ? theme.button : theme.secondaryButton, opacity: canRedo ? 1 : 0.7 },
          ]}
          onPress={redoMove}
          disabled={!canRedo}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Redo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={() => navigation.navigate("MainMenu")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Menu</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.instructions, { color: theme.text }]}>
        Swipe to move tiles. Match same numbers to combine them!
      </Text>

      <GestureRecognizer
        onSwipeUp={handleSwipeUp}
        onSwipeDown={handleSwipeDown}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        config={config}
        style={styles.gestureContainer}
      >
        <Animated.View
          style={[
            styles.gridContainer,
            {
              backgroundColor: theme.grid,
              // transform: [{ translateX: gridTranslateX }, { translateY: gridTranslateY }],
              padding: Math.max(5, 10 - gridSize),
            },
          ]}
        >
          {_.range(gridSize).map((row) => (
            <View key={`row-${row}`} style={styles.gridRow}>
              {_.range(gridSize).map((col) => (
                <GridTile
                  key={`cell-${row}-${col}`}
                  value={gridData[row][col]}
                  row={row}
                  col={col}
                  size={tileSize}
                  fontSize={fontSize}
                  theme={theme}
                />
              ))}
            </View>
          ))}
        </Animated.View>
      </GestureRecognizer>

      {/* Saved Game Modal */}
      <Modal transparent={true} visible={showSavedGameModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Continue Saved Game?</Text>
            <Text style={[styles.modalSubtitle, { color: theme.text }]}>
              {gridSize}×{gridSize} board
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.button }]}
              onPress={async () => {
                await loadGameState()
                setShowSavedGameModal(false)
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.secondaryButton }]}
              onPress={() => {
                newGame()
                setShowSavedGameModal(false)
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>New Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Target Reached Modal */}
      <Modal transparent={true} visible={showTargetReachedModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>You reached 2048!</Text>
            <Text style={[styles.modalScore, { color: theme.text }]}>Score: {score}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.button }]}
              onPress={() => {
                continueGame()
                setShowTargetReachedModal(false)
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Continue Playing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.secondaryButton }]}
              onPress={() => {
                newGame()
                setShowTargetReachedModal(false)
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>New Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal transparent={true} visible={gameOver} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Game Over!</Text>
            <Text style={[styles.modalScore, { color: theme.text }]}>Score: {score}</Text>
            {score >= highScore && <Text style={styles.newHighScore}>New High Score!</Text>}
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.button }]} onPress={newGame}>
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.secondaryButton }]}
              onPress={() => navigation.navigate("MainMenu")}
            >
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreContainer: {
    flexDirection: "row",
  },
  scoreBox: {
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    alignItems: "center",
    minWidth: 80,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  boardInfo: {
    alignItems: "center",
    marginBottom: 10,
  },
  boardSizeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  controls: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontWeight: "bold",
  },
  instructions: {
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  gestureContainer: {
    flex: 1,
    justifyContent: "center",
  },
  gridContainer: {
    borderRadius: 8,
    padding: 10,
    alignSelf: "center",
  },
  gridRow: {
    flexDirection: "row",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  modalScore: {
    fontSize: 22,
    marginBottom: 10,
  },
  newHighScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F67C5F",
    marginBottom: 20,
  },
})

export default GameScreen

