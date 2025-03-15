import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  LayoutAnimation,
  Animated,
} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameLogic } from '../utils/gameLogic';
import GridTile from '../components/GridTile';
import _ from 'lodash';

const GameScreen = () => {
  const navigation = useNavigation();
  const {
    gridData,
    score,
    highScore,
    gameOver,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    newGame,
    loadGameState,
  } = useGameLogic();

  const [showSavedGameModal, setShowSavedGameModal] = useState(false);

  // Animated values for directional slide effect
  const gridTranslateX = useRef(new Animated.Value(0)).current;
  const gridTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkForSavedGame = async () => {
      try {
        const savedState = await AsyncStorage.getItem('@2048_gameState');
        if (savedState) {
          setShowSavedGameModal(true);
        }
      } catch (error) {
        console.log('Error checking saved game state', error);
      }
    };
    checkForSavedGame();
  }, []);

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  // Each handler calls the swipe function and then runs an Animated sequence
  const handleSwipeRight = () => {
    onSwipeRight();
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
    ]).start();
  };

  const handleSwipeLeft = () => {
    onSwipeLeft();
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
    ]).start();
  };

  const handleSwipeUp = () => {
    onSwipeUp();
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
    ]).start();
  };

  const handleSwipeDown = () => {
    onSwipeDown();
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
    ]).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>2048</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.scoreValue}>{highScore}</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={newGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MainMenu')}
        >
          <Text style={styles.buttonText}>Menu</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>
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
          ]}
        >
          {_.range(4).map((row) => (
            <View key={`row-${row}`} style={styles.gridRow}>
              {_.range(4).map((col) => (
                <GridTile
                  key={`cell-${row}-${col}`}
                  value={gridData[row][col]}
                  row={row}
                  col={col}
                />
              ))}
            </View>
          ))}
        </Animated.View>
      </GestureRecognizer>

      {/* Saved Game Modal */}
      <Modal transparent={true} visible={showSavedGameModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Continue Saved Game?</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                await loadGameState();
                setShowSavedGameModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => {
                newGame();
                setShowSavedGameModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>New Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal transparent={true} visible={gameOver} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over!</Text>
            <Text style={styles.modalScore}>Score: {score}</Text>
            {score >= highScore && (
              <Text style={styles.newHighScore}>New High Score!</Text>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={newGame}>
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('MainMenu')}
            >
              <Text style={styles.modalButtonText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8EF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#776E65',
  },
  scoreContainer: {
    flexDirection: 'row',
  },
  scoreBox: {
    backgroundColor: '#BBADA0',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreLabel: {
    color: '#EEE4DA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8F7A66',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructions: {
    marginBottom: 20,
    color: '#776E65',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  gestureContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  gridContainer: {
    backgroundColor: '#BBADA0',
    borderRadius: 8,
    padding: 10,
    alignSelf: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FAF8EF',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#776E65',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#8F7A66',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalScore: {
    fontSize: 22,
    color: '#776E65',
    marginBottom: 10,
  },
  newHighScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F67C5F',
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#BBADA0',
  },
});

export default GameScreen;
