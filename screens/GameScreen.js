import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import GridTile from '../components/GridTile';
import { initializeBoard, addNewTile, moveTiles, isGameOver } from '../utils/gameLogic';

export default function GameScreen({ route, navigation }) {
  const { gridSize = 4 } = route.params || {};
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [previousBoards, setPreviousBoards] = useState([]);
  const [previousScores, setPreviousScores] = useState([]);

  // Initialize the board
  useEffect(() => {
    resetGame();
  }, []);

  const checkGameOver = useCallback((currentBoard) => {
    if (isGameOver(currentBoard)) {
      setGameOver(true);
      setTimeout(() => {
        Alert.alert('Game Over!', `Your final score is ${score}`, [
          {text: 'Try Again', onPress: resetGame},
          {text: 'Main Menu', onPress: () => navigation.navigate('MainMenu')}
        ]);
      }, 300);
    }
  }, [score, navigation]);

  const handleMove = useCallback((direction) => {
    if (gameOver) return;
    
    // Save current state for undo
    setPreviousBoards(prev => [...prev, board.map(row => [...row])]);
    setPreviousScores(prev => [...prev, score]);
    
    const { newBoard, scoreDelta } = moveTiles(direction, board);
    
    // Check if the board changed
    const boardChanged = JSON.stringify(newBoard) !== JSON.stringify(board);
    
    if (boardChanged) {
      const updatedBoard = addNewTile(newBoard);
      setBoard(updatedBoard);
      setScore(prev => prev + scoreDelta);
      
      // Check if game is over
      checkGameOver(updatedBoard);
    }
  }, [board, score, gameOver, checkGameOver]);

  const undoMove = () => {
    if (previousBoards.length > 0) {
      const lastBoard = previousBoards[previousBoards.length - 1];
      const lastScore = previousScores[previousScores.length - 1];
      
      setBoard(lastBoard);
      setScore(lastScore);
      setPreviousBoards(prev => prev.slice(0, -1));
      setPreviousScores(prev => prev.slice(0, -1));
      setGameOver(false);
    }
  };

  const resetGame = () => {
    let newBoard = initializeBoard(gridSize);
    newBoard = addNewTile(newBoard);
    newBoard = addNewTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setPreviousBoards([]);
    setPreviousScores([]);
  };

  // Set up gestures
  const swipeGesture = Gesture.Pan()
    .activateAfterLongPress(0) // No long press delay
    .onEnd((event) => {
      const { translationX, translationY } = event;
      const SWIPE_THRESHOLD = 20;
      
      // Determine swipe direction based on most significant axis
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Horizontal swipe
        if (translationX > SWIPE_THRESHOLD) {
          console.log("Swipe right detected");
          handleMove('right');
        } else if (translationX < -SWIPE_THRESHOLD) {
          console.log("Swipe left detected");
          handleMove('left');
        }
      } else {
        // Vertical swipe
        if (translationY > SWIPE_THRESHOLD) {
          console.log("Swipe down detected");
          handleMove('down');
        } else if (translationY < -SWIPE_THRESHOLD) {
          console.log("Swipe up detected");
          handleMove('up');
        }
      }
    });

  // Calculate tile size based on screen width and grid size
  const screenWidth = Dimensions.get('window').width;
  const gridPadding = 16;
  const tileMargin = 6;
  const tileSize = (screenWidth - (gridPadding * 2) - (tileMargin * 2 * gridSize)) / gridSize;
  
  // Add keyboard/button controls for testing or alternative input
  const controlButtons = (
    <View style={styles.directionButtons}>
      <TouchableOpacity style={styles.dirButton} onPress={() => handleMove('up')}>
        <Text style={styles.dirButtonText}>↑</Text>
      </TouchableOpacity>
      <View style={styles.middleButtons}>
        <TouchableOpacity style={styles.dirButton} onPress={() => handleMove('left')}>
          <Text style={styles.dirButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dirButton} onPress={() => handleMove('right')}>
          <Text style={styles.dirButtonText}>→</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.dirButton} onPress={() => handleMove('down')}>
        <Text style={styles.dirButtonText}>↓</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>2048</Text>
          <Text style={styles.subtitle}>{gridSize}x{gridSize} Grid</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, previousBoards.length === 0 && styles.buttonDisabled]} 
          onPress={undoMove}
          disabled={previousBoards.length === 0}
        >
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('MainMenu')}
        >
          <Text style={styles.buttonText}>Menu</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <View style={[
          styles.gridContainer, 
          { width: screenWidth - (gridPadding * 2), height: screenWidth - (gridPadding * 2) }
        ]}>
          {board.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((value, colIndex) => (
                <GridTile 
                  key={`tile-${rowIndex}-${colIndex}`} 
                  value={value} 
                  size={tileSize} 
                />
              ))}
            </View>
          ))}
        </View>
      </GestureDetector>
      
      {/* Alternative directional controls */}
      {controlButtons}
      
      <Text style={styles.instructions}>
        Swipe to move tiles or use direction buttons
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ef',
    padding: 16,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#776e65',
  },
  subtitle: {
    fontSize: 16,
    color: '#776e65',
  },
  scoreContainer: {
    backgroundColor: '#bbada0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreLabel: {
    color: '#eee4da',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8f7a66',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cdc1b4',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gridContainer: {
    backgroundColor: '#bbada0',
    borderRadius: 8,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
  },
  directionButtons: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 200,
  },
  middleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
  },
  dirButton: {
    backgroundColor: '#bbada0',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  dirButtonText: {
    color: '#f9f6f2',
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructions: {
    color: '#776e65',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  }
});