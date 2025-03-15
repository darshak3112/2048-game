"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView, Animated, Dimensions } from "react-native"
import GestureRecognizer from "react-native-swipe-gestures"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useGameLogic } from "../utils/gameLogic"
import GridTile from "../components/GridTile"
import _ from "lodash"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

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

  const gridTranslateX = useRef(new Animated.Value(0)).current
  const gridTranslateY = useRef(new Animated.Value(0)).current

  const screenWidth = Dimensions.get("window").width
  const tileSize = Math.min(70, (screenWidth - 40) / gridSize - 10)
  const fontSize = Math.min(32, tileSize * 0.45)

  useEffect(() => {
    const checkForSavedGame = async () => {
      try {
        const key = `@2048_gameState_${gridSize}`
        const savedState = await AsyncStorage.getItem(key)
        if (savedState) {
          const { gameOver: wasGameOver } = JSON.parse(savedState)
          wasGameOver ? newGame() : setShowSavedGameModal(true)
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

  const handleSwipe = (direction) => {
    const swipeFunctions = {
      up: onSwipeUp,
      down: onSwipeDown,
      left: onSwipeLeft,
      right: onSwipeRight,
    }
    const translateValue = direction === "left" || direction === "right" ? gridTranslateX : gridTranslateY
    const moveValue = direction === "right" || direction === "down" ? 20 : -20

    swipeFunctions[direction]()
    Animated.sequence([
      Animated.timing(translateValue, { toValue: moveValue, duration: 100, useNativeDriver: true }),
      Animated.timing(translateValue, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start()
  }

  return (
    <LinearGradient colors={["#2b2e4a", "#53354a"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>2048</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Ionicons name="trophy" size={22} color="#FFD700" />
              <Text style={styles.scoreLabel}>Best</Text>
              <Text style={styles.scoreValue}>{highScore}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Ionicons name="stats-chart" size={22} color="#32CD32" />
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          </View>
        </View>

        <GestureRecognizer
          onSwipeUp={() => handleSwipe("up")}
          onSwipeDown={() => handleSwipe("down")}
          onSwipeLeft={() => handleSwipe("left")}
          onSwipeRight={() => handleSwipe("right")}
          config={config}
          style={styles.gestureContainer}
        >
          <Animated.View style={[styles.gridContainer, { transform: [{ translateX: gridTranslateX }, { translateY: gridTranslateY }] }]}>
            {_.range(gridSize).map((row) => (
              <View key={`row-${row}`} style={styles.gridRow}>
                {_.range(gridSize).map((col) => (
                  <GridTile key={`cell-${row}-${col}`} value={gridData[row][col]} row={row} col={col} size={tileSize} fontSize={fontSize} />
                ))}
              </View>
            ))}
          </Animated.View>
        </GestureRecognizer>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={newGame}>
            <Ionicons name="reload" size={20} color="white" />
            <Text style={styles.buttonText}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { opacity: canUndo ? 1 : 0.5 }]} onPress={undoMove} disabled={!canUndo}>
            <Ionicons name="arrow-undo" size={20} color="white" />
            <Text style={styles.buttonText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { opacity: canRedo ? 1 : 0.5 }]} onPress={redoMove} disabled={!canRedo}>
            <Ionicons name="arrow-redo" size={20} color="white" />
            <Text style={styles.buttonText}>Redo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MainMenu")}>
            <Ionicons name="home" size={20} color="white" />
            <Text style={styles.buttonText}>Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 50, fontWeight: "bold", color: "white" },
  scoreContainer: { flexDirection: "row" },
  scoreBox: { padding: 10, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", minWidth: 80 },
  scoreLabel: { fontSize: 14, color: "white", fontWeight: "bold" },
  scoreValue: { fontSize: 22, color: "white", fontWeight: "bold" },
  gestureContainer: { flex: 1, justifyContent: "center" },
  gridContainer: { borderRadius: 10, padding: 15, backgroundColor: "rgba(255,255,255,0.1)" },
  gridRow: { flexDirection: "row" },
  controls: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  button: { flexDirection: "row", alignItems: "center", backgroundColor: "#ff6f61", padding: 12, borderRadius: 8, margin: 5 },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
})

export default GameScreen
