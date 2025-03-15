import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

// Create context
const GameLogicContext = createContext();

// Constants
const GRID_SIZE = 4;
const MIN = 0;
const MAX = GRID_SIZE - 1;

export const GameLogicProvider = ({ children }) => {
  // Move getBlankData function definition above its usage
  const getBlankData = () => {
    let grid = new Array(GRID_SIZE);
    _.range(GRID_SIZE).map(i => grid[i] = new Array(GRID_SIZE));
    return grid;
  };

  const [gridData, setGridData] = useState(getBlankData());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  let merged = [];
  let isMoved = false;

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      storeHighScore(score);
    }
  }, [score, highScore]);

  const initializeGame = async () => {
    const storedHighScore = await getHighScore();
    setHighScore(storedHighScore);
    newGame();
  };

  const storeHighScore = async (score) => {
    try {
      await AsyncStorage.setItem('@2048_highScore', score.toString());
    } catch (error) {
      console.log('Error storing high score', error);
    }
  };

  const getHighScore = async () => {
    try {
      const val = await AsyncStorage.getItem('@2048_highScore');
      return val ? parseInt(val) : 0;
    } catch (error) {
      console.log('Error fetching high score', error);
      return 0;
    }
  };

  const getRandomCell = () => {
    const x = _.random(0, GRID_SIZE - 1);
    const y = _.random(0, GRID_SIZE - 1);
    return { 'x': x, 'y': y };
  };

  const newGame = () => {
    let c1 = getRandomCell();
    let c2 = null;
    
    // Get a different random cell for second number
    while (true) {
      c2 = getRandomCell();
      if (!_.isEqual(c1, c2))
        break;
    }
    
    let newGridData = getBlankData();
    newGridData[c1.x][c1.y] = 2;
    newGridData[c2.x][c2.y] = 2;
    
    setGridData(newGridData);
    setScore(0);
    setGameOver(false);
  };

  const getColor = (num) => {
    switch (num) {
      case 2: return '#EEE4DA';
      case 4: return '#EDE0C8';
      case 8: return '#F2B179';
      case 16: return '#F59563';
      case 32: return '#F67C5F';
      case 64: return '#F65E3B';
      case 128: return '#EDCF72';
      case 256: return '#EDCC61';
      case 512: return '#EDC850';
      case 1024: return '#EDC53F';
      case 2048: return '#EDC22E';
      default: return '#CDC1B4';
    }
  };

  const getTextColor = (num) => {
    return num <= 4 ? '#776E65' : '#F9F6F2';
  };

  const moveUp = (r, c) => {
    if (r !== MIN) {
      _.each(_.rangeRight(r), i => {
        if (gridData[i][c]) {
          if (gridData[i][c] === gridData[i + 1][c]) {
            const cell = { 'x': i, 'y': c };
            if (!_.some(merged, cell)) {
              merged.push(cell);
              gridData[i][c] = gridData[i + 1][c] * 2;
              gridData[i + 1][c] = undefined;
              isMoved = true;
              setScore(prevScore => prevScore + gridData[i][c]);
            }
          }
          return false;
        } else {
          gridData[i][c] = gridData[i + 1][c];
          gridData[i + 1][c] = undefined;
          isMoved = true;
        }
      });
    }
  };

  const moveDown = (r, c) => {
    if (r !== MAX) {
      _.each(_.range(r + 1, GRID_SIZE), i => {
        if (gridData[i][c]) {
          if (gridData[i][c] === gridData[i - 1][c]) {
            const cell = { 'x': i, 'y': c };
            if (!_.some(merged, cell)) {
              merged.push(cell);
              gridData[i][c] = gridData[i - 1][c] * 2;
              gridData[i - 1][c] = undefined;
              isMoved = true;
              setScore(prevScore => prevScore + gridData[i][c]);
            }
          }
          return false;
        } else {
          gridData[i][c] = gridData[i - 1][c];
          gridData[i - 1][c] = undefined;
          isMoved = true;
        }
      });
    }
  };

  const moveLeft = (r, c) => {
    if (c !== MIN) {
      _.each(_.rangeRight(c), i => {
        if (gridData[r][i]) {
          if (gridData[r][i] === gridData[r][i + 1]) {
            const cell = { 'x': r, 'y': i };
            if (!_.some(merged, cell)) {
              merged.push(cell);
              gridData[r][i] = gridData[r][i + 1] * 2;
              gridData[r][i + 1] = undefined;
              isMoved = true;
              setScore(prevScore => prevScore + gridData[r][i]);
            }
          }
          return false;
        } else {
          gridData[r][i] = gridData[r][i + 1];
          gridData[r][i + 1] = undefined;
          isMoved = true;
        }
      });
    }
  };

  const moveRight = (r, c) => {
    if (c !== MAX) {
      _.each(_.range(c + 1, GRID_SIZE), i => {
        if (gridData[r][i]) {
          if (gridData[r][i] === gridData[r][i - 1]) {
            const cell = { 'x': r, 'y': i };
            if (!_.some(merged, cell)) {
              merged.push(cell);
              gridData[r][i] = gridData[r][i - 1] * 2;
              gridData[r][i - 1] = undefined;
              isMoved = true;
              setScore(prevScore => prevScore + gridData[r][i]);
            }
          }
          return false;
        } else {
          gridData[r][i] = gridData[r][i - 1];
          gridData[r][i - 1] = undefined;
          isMoved = true;
        }
      });
    }
  };

  const onSwipeUp = () => {
    isMoved = false;
    merged = [];
    _.range(GRID_SIZE).map(c => _.range(GRID_SIZE).map(r => {
      if (gridData[r][c]) {
        moveUp(r, c);
      }
    }));
    
    setGridData(_.cloneDeep(gridData));
    if (isMoved) update();
  };

  const onSwipeDown = () => {
    isMoved = false;
    merged = [];
    _.range(GRID_SIZE).map(c => _.rangeRight(GRID_SIZE).map(r => {
      if (gridData[r][c]) {
        moveDown(r, c);
      }
    }));
    
    setGridData(_.cloneDeep(gridData));
    if (isMoved) update();
  };

  const onSwipeLeft = () => {
    isMoved = false;
    merged = [];
    _.range(GRID_SIZE).map(r => _.range(GRID_SIZE).map(c => {
      if (gridData[r][c]) {
        moveLeft(r, c);
      }
    }));
    
    setGridData(_.cloneDeep(gridData));
    if (isMoved) update();
  };

  const onSwipeRight = () => {
    isMoved = false;
    merged = [];
    _.range(GRID_SIZE).map(r => _.rangeRight(GRID_SIZE).map(c => {
      if (gridData[r][c]) {
        moveRight(r, c);
      }
    }));
    
    setGridData(_.cloneDeep(gridData));
    if (isMoved) update();
  };

  const update = () => {
    // Add new cell
    let emptyCells = [];
    _.range(GRID_SIZE).map(r => _.range(GRID_SIZE).map(c => {
      if (!gridData[r][c]) {
        emptyCells.push({ 'x': r, 'y': c });
      }
    }));

    if (emptyCells.length > 0) {
      const emptyCell = _.sample(emptyCells);
      gridData[emptyCell.x][emptyCell.y] = _.sample([2, 2, 2, 2, 4]);
      setGridData(_.cloneDeep(gridData));
    }

    // Check if game is over
    checkGameOver();
  };

  const checkGameOver = () => {
    // Check if board is full
    const isBoardFull = _.every(gridData, row => 
      _.every(row, cell => cell !== undefined)
    );

    if (!isBoardFull) return;

    // Check for possible moves
    let hasPossibleMoves = false;

    // Check horizontally
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (gridData[r][c] === gridData[r][c + 1]) {
          hasPossibleMoves = true;
          break;
        }
      }
    }

    // Check vertically
    if (!hasPossibleMoves) {
      for (let c = 0; c < GRID_SIZE; c++) {
        for (let r = 0; r < GRID_SIZE - 1; r++) {
          if (gridData[r][c] === gridData[r + 1][c]) {
            hasPossibleMoves = true;
            break;
          }
        }
      }
    }

    if (!hasPossibleMoves) {
      setGameOver(true);
    }
  };

  return (
    <GameLogicContext.Provider
      value={{
        gridData,
        score,
        highScore,
        gameOver,
        getColor,
        getTextColor,
        onSwipeUp,
        onSwipeDown,
        onSwipeLeft,
        onSwipeRight,
        newGame
      }}
    >
      {children}
    </GameLogicContext.Provider>
  );
};

// Custom hook to use game logic
export const useGameLogic = () => useContext(GameLogicContext);