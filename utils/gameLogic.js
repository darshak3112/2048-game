"use client"

import { createContext, useState, useContext, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import _ from "lodash"

const GameLogicContext = createContext()

// Default is 4x4, but we'll support multiple board sizes
const DEFAULT_GRID_SIZE = 4
const MIN = 0

// Default theme colors
const DEFAULT_THEME = {
  background: "#FAF8EF",
  tile: "#CDC1B4",
  text: "#776E65",
  grid: "#BBADA0",
  button: "#8F7A66",
  buttonText: "#FFFFFF",
  secondaryButton: "#BBADA0",
}

// Theme presets
const THEMES = {
  classic: {
    name: "Classic",
    background: "#FAF8EF",
    tile: "#CDC1B4",
    text: "#776E65",
    grid: "#BBADA0",
    button: "#8F7A66",
    buttonText: "#FFFFFF",
    secondaryButton: "#BBADA0",
  },
  dark: {
    name: "Dark",
    background: "#1F1F1F",
    tile: "#3D3D3D",
    text: "#F9F6F2",
    grid: "#2A2A2A",
    button: "#505050",
    buttonText: "#FFFFFF",
    secondaryButton: "#3D3D3D",
  },
  blue: {
    name: "Blue",
    background: "#EFF7FF",
    tile: "#B8D0E6",
    text: "#2C3E50",
    grid: "#7FA7C9",
    button: "#3498DB",
    buttonText: "#FFFFFF",
    secondaryButton: "#7FA7C9",
  },
  green: {
    name: "Green",
    background: "#F0FFF0",
    tile: "#C1E1C1",
    text: "#2E8B57",
    grid: "#8FBC8F",
    button: "#3CB371",
    buttonText: "#FFFFFF",
    secondaryButton: "#8FBC8F",
  },
  purple: {
    name: "Purple",
    background: "#F5F0FF",
    tile: "#D8BFD8",
    text: "#4B0082",
    grid: "#9370DB",
    button: "#8A2BE2",
    buttonText: "#FFFFFF",
    secondaryButton: "#9370DB",
  },
}

export const GameLogicProvider = ({ children }) => {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE)
  const [gridData, setGridData] = useState([])
  const [score, setScore] = useState(0)
  const [highScores, setHighScores] = useState({})
  const [gameOver, setGameOver] = useState(false)
  const [reachedTarget, setReachedTarget] = useState(false)
  const [continueAfterTarget, setContinueAfterTarget] = useState(false)
  const [gameHistory, setGameHistory] = useState([])
  const [redoHistory, setRedoHistory] = useState([])
  const [boardSizes] = useState([3, 4, 5, 6, 8])
  const [ongoingGames, setOngoingGames] = useState({})
  const [theme, setTheme] = useState(DEFAULT_THEME)

  // Get the current high score for the active grid size
  const highScore = highScores[gridSize] || 0

  let merged = []
  let isMoved = false

  const getBlankData = useCallback(
    (size = gridSize) => {
      const grid = new Array(size)
      _.range(size).map((i) => (grid[i] = new Array(size).fill(undefined)))
      return grid
    },
    [gridSize],
  )

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    if (score > (highScores[gridSize] || 0)) {
      const newHighScores = { ...highScores, [gridSize]: score }
      setHighScores(newHighScores)
      storeHighScores(newHighScores)
    }
  }, [score, highScores, gridSize])

  // Initialize with the selected grid size
  useEffect(() => {
    loadGameState()
  }, [gridSize])

  const initializeGame = async () => {
    const storedHighScores = await getHighScores()
    setHighScores(storedHighScores || {})

    // Load the last used grid size
    const lastGridSize = await getLastGridSize()
    if (lastGridSize) {
      setGridSize(Number.parseInt(lastGridSize))
    } else {
      setGridSize(DEFAULT_GRID_SIZE)
    }

    // Load saved theme
    const savedTheme = await getTheme()
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // Check for ongoing games
    await checkOngoingGames()
  }

  const checkOngoingGames = async () => {
    try {
      const ongoing = {}

      for (const size of boardSizes) {
        const key = `@2048_gameState_${size}`
        const savedState = await AsyncStorage.getItem(key)

        if (savedState) {
          const { score, gameOver } = JSON.parse(savedState)
          if (!gameOver) {
            ongoing[size] = { score }
          }
        }
      }

      setOngoingGames(ongoing)
    } catch (error) {
      console.log("Error checking ongoing games", error)
    }
  }

  const storeHighScores = async (scores) => {
    try {
      await AsyncStorage.setItem("@2048_highScores", JSON.stringify(scores))
    } catch (error) {
      console.log("Error storing high scores", error)
    }
  }

  const getHighScores = async () => {
    try {
      const val = await AsyncStorage.getItem("@2048_highScores")
      return val ? JSON.parse(val) : {}
    } catch (error) {
      console.log("Error fetching high scores", error)
      return {}
    }
  }

  const storeLastGridSize = async (size) => {
    try {
      await AsyncStorage.setItem("@2048_lastGridSize", size.toString())
    } catch (error) {
      console.log("Error storing last grid size", error)
    }
  }

  const getLastGridSize = async () => {
    try {
      return await AsyncStorage.getItem("@2048_lastGridSize")
    } catch (error) {
      console.log("Error fetching last grid size", error)
      return null
    }
  }

  const storeTheme = async (themeData) => {
    try {
      await AsyncStorage.setItem("@2048_theme", JSON.stringify(themeData))
    } catch (error) {
      console.log("Error storing theme", error)
    }
  }

  const getTheme = async () => {
    try {
      const val = await AsyncStorage.getItem("@2048_theme")
      return val ? JSON.parse(val) : null
    } catch (error) {
      console.log("Error fetching theme", error)
      return null
    }
  }

  const changeTheme = async (themeName) => {
    const newTheme = THEMES[themeName] || DEFAULT_THEME
    setTheme(newTheme)
    await storeTheme(newTheme)
  }

  const getRandomCell = useCallback(() => {
    const x = _.random(0, gridSize - 1)
    const y = _.random(0, gridSize - 1)
    return { x, y }
  }, [gridSize])

  const changeGridSize = async (size) => {
    if (boardSizes.includes(size) && size !== gridSize) {
      setGridSize(size)
      await storeLastGridSize(size)

      // Check if there's a saved game for this size
      const hasSavedGame = await checkSavedGameForSize(size)

      if (!hasSavedGame) {
        // If no saved game, start a new one with this size
        newGame(size)
      }

      // Update ongoing games list
      await checkOngoingGames()
    }
  }

  const checkSavedGameForSize = async (size) => {
    try {
      const key = `@2048_gameState_${size}`
      const savedState = await AsyncStorage.getItem(key)
      return !!savedState
    } catch (error) {
      console.log("Error checking saved game state", error)
      return false
    }
  }

  const newGame = async (size = gridSize) => {
    const currentSize = size || gridSize
    const c1 = getRandomCell()
    let c2 = null

    while (true) {
      c2 = getRandomCell()
      if (!_.isEqual(c1, c2)) break
    }

    const newGridData = getBlankData(currentSize)
    newGridData[c1.x][c1.y] = 2
    newGridData[c2.x][c2.y] = 2

    setGridData(newGridData)
    setScore(0)
    setGameOver(false)
    setReachedTarget(false)
    setContinueAfterTarget(false)
    setGameHistory([])
    setRedoHistory([])

    // Clear saved game for this size
    const key = `@2048_gameState_${currentSize}`
    await AsyncStorage.removeItem(key)

    // Update ongoing games list
    await checkOngoingGames()
  }

  const getColor = (num) => {
    switch (num) {
      case 2:
        return "#EEE4DA"
      case 4:
        return "#EDE0C8"
      case 8:
        return "#F2B179"
      case 16:
        return "#F59563"
      case 32:
        return "#F67C5F"
      case 64:
        return "#F65E3B"
      case 128:
        return "#EDCF72"
      case 256:
        return "#EDCC61"
      case 512:
        return "#EDC850"
      case 1024:
        return "#EDC53F"
      case 2048:
        return "#EDC22E"
      case 4096:
        return "#3C3A32"
      case 8192:
        return "#2A2A28"
      default:
        return theme.tile
    }
  }

  const getTextColor = (num) => {
    return num <= 4 ? "#776E65" : "#F9F6F2"
  }

  // Save current state before making a move for undo functionality
  const saveStateForUndo = () => {
    setGameHistory((prev) => [
      ...prev,
      {
        gridData: _.cloneDeep(gridData),
        score,
      },
    ])
    // Clear redo history when a new move is made
    setRedoHistory([])
  }

  // Undo the last move
  const undoMove = () => {
    if (gameHistory.length > 0) {
      const lastState = gameHistory[gameHistory.length - 1]

      // Save current state for redo
      setRedoHistory((prev) => [
        ...prev,
        {
          gridData: _.cloneDeep(gridData),
          score,
        },
      ])

      setGridData(lastState.gridData)
      setScore(lastState.score)
      setGameHistory((prev) => prev.slice(0, -1))

      // If game was over, it's not anymore
      if (gameOver) {
        setGameOver(false)
      }
    }
  }

  // Redo a previously undone move
  const redoMove = () => {
    if (redoHistory.length > 0) {
      const nextState = redoHistory[redoHistory.length - 1]

      // Save current state for undo
      setGameHistory((prev) => [
        ...prev,
        {
          gridData: _.cloneDeep(gridData),
          score,
        },
      ])

      setGridData(nextState.gridData)
      setScore(nextState.score)
      setRedoHistory((prev) => prev.slice(0, -1))
    }
  }

  const moveUp = (r, c) => {
    if (r !== MIN) {
      _.each(_.rangeRight(r), (i) => {
        if (gridData[i][c]) {
          if (gridData[i][c] === gridData[i + 1][c]) {
            const cell = { x: i, y: c }
            if (!_.some(merged, cell)) {
              merged.push(cell)
              gridData[i][c] = gridData[i + 1][c] * 2
              gridData[i + 1][c] = undefined
              isMoved = true
              setScore((prevScore) => prevScore + gridData[i][c])

              // Check if reached 2048 or target
              if (gridData[i][c] === 2048 && !reachedTarget) {
                setReachedTarget(true)
              }
            }
          }
          return false
        } else {
          gridData[i][c] = gridData[i + 1][c]
          gridData[i + 1][c] = undefined
          isMoved = true
        }
      })
    }
  }

  const moveDown = (r, c) => {
    const MAX = gridSize - 1
    if (r !== MAX) {
      _.each(_.range(r + 1, gridSize), (i) => {
        if (gridData[i][c]) {
          if (gridData[i][c] === gridData[i - 1][c]) {
            const cell = { x: i, y: c }
            if (!_.some(merged, cell)) {
              merged.push(cell)
              gridData[i][c] = gridData[i - 1][c] * 2
              gridData[i - 1][c] = undefined
              isMoved = true
              setScore((prevScore) => prevScore + gridData[i][c])

              // Check if reached 2048 or target
              if (gridData[i][c] === 2048 && !reachedTarget) {
                setReachedTarget(true)
              }
            }
          }
          return false
        } else {
          gridData[i][c] = gridData[i - 1][c]
          gridData[i - 1][c] = undefined
          isMoved = true
        }
      })
    }
  }

  const moveLeft = (r, c) => {
    if (c !== MIN) {
      _.each(_.rangeRight(c), (i) => {
        if (gridData[r][i]) {
          if (gridData[r][i] === gridData[r][i + 1]) {
            const cell = { x: r, y: i }
            if (!_.some(merged, cell)) {
              merged.push(cell)
              gridData[r][i] = gridData[r][i + 1] * 2
              gridData[r][i + 1] = undefined
              isMoved = true
              setScore((prevScore) => prevScore + gridData[r][i])

              // Check if reached 2048 or target
              if (gridData[r][i] === 2048 && !reachedTarget) {
                setReachedTarget(true)
              }
            }
          }
          return false
        } else {
          gridData[r][i] = gridData[r][i + 1]
          gridData[r][i + 1] = undefined
          isMoved = true
        }
      })
    }
  }

  const moveRight = (r, c) => {
    const MAX = gridSize - 1
    if (c !== MAX) {
      _.each(_.range(c + 1, gridSize), (i) => {
        if (gridData[r][i]) {
          if (gridData[r][i] === gridData[r][i - 1]) {
            const cell = { x: r, y: i }
            if (!_.some(merged, cell)) {
              merged.push(cell)
              gridData[r][i] = gridData[r][i - 1] * 2
              gridData[r][i - 1] = undefined
              isMoved = true
              setScore((prevScore) => prevScore + gridData[r][i])

              // Check if reached 2048 or target
              if (gridData[r][i] === 2048 && !reachedTarget) {
                setReachedTarget(true)
              }
            }
          }
          return false
        } else {
          gridData[r][i] = gridData[r][i - 1]
          gridData[r][i - 1] = undefined
          isMoved = true
        }
      })
    }
  }

  const onSwipeUp = () => {
    saveStateForUndo()
    isMoved = false
    merged = []
    _.range(gridSize).map((c) =>
      _.range(gridSize).map((r) => {
        if (gridData[r][c]) {
          moveUp(r, c)
        }
      }),
    )
    setGridData(_.cloneDeep(gridData))
    if (isMoved) update()
  }

  const onSwipeDown = () => {
    saveStateForUndo()
    isMoved = false
    merged = []
    _.range(gridSize).map((c) =>
      _.rangeRight(gridSize).map((r) => {
        if (gridData[r][c]) {
          moveDown(r, c)
        }
      }),
    )
    setGridData(_.cloneDeep(gridData))
    if (isMoved) update()
  }

  const onSwipeLeft = () => {
    saveStateForUndo()
    isMoved = false
    merged = []
    _.range(gridSize).map((r) =>
      _.range(gridSize).map((c) => {
        if (gridData[r][c]) {
          moveLeft(r, c)
        }
      }),
    )
    setGridData(_.cloneDeep(gridData))
    if (isMoved) update()
  }

  const onSwipeRight = () => {
    saveStateForUndo()
    isMoved = false
    merged = []
    _.range(gridSize).map((r) =>
      _.rangeRight(gridSize).map((c) => {
        if (gridData[r][c]) {
          moveRight(r, c)
        }
      }),
    )
    setGridData(_.cloneDeep(gridData))
    if (isMoved) update()
  }

  const update = async () => {
    const emptyCells = []
    _.range(gridSize).map((r) =>
      _.range(gridSize).map((c) => {
        if (!gridData[r][c]) {
          emptyCells.push({ x: r, y: c })
        }
      }),
    )
    if (emptyCells.length > 0) {
      const emptyCell = _.sample(emptyCells)
      gridData[emptyCell.x][emptyCell.y] = _.sample([2, 2, 2, 2, 4])
      setGridData(_.cloneDeep(gridData))
    }
    checkGameOver()
    if (!gameOver) await saveGameState()

    // Update ongoing games list
    await checkOngoingGames()
  }

  const checkGameOver = () => {
    const isBoardFull = _.every(gridData, (row) => _.every(row, (cell) => cell !== undefined))
    if (!isBoardFull) return

    let hasPossibleMoves = false
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize - 1; c++) {
        if (gridData[r][c] === gridData[r][c + 1]) {
          hasPossibleMoves = true
          break
        }
      }
    }
    if (!hasPossibleMoves) {
      for (let c = 0; c < gridSize; c++) {
        for (let r = 0; r < gridSize - 1; r++) {
          if (gridData[r][c] === gridData[r + 1][c]) {
            hasPossibleMoves = true
            break
          }
        }
      }
    }
    if (!hasPossibleMoves) {
      setGameOver(true)
    }
  }

  const saveGameState = async () => {
    try {
      const key = `@2048_gameState_${gridSize}`
      const gameState = {
        gridData: _.cloneDeep(gridData),
        score,
        gameHistory: _.cloneDeep(gameHistory),
        redoHistory: _.cloneDeep(redoHistory),
        reachedTarget,
        continueAfterTarget,
        gameOver,
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(gameState))
    } catch (error) {
      console.log("Error saving game state", error)
    }
  }

  const loadGameState = async () => {
    try {
      const key = `@2048_gameState_${gridSize}`
      const savedState = await AsyncStorage.getItem(key)
  
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        const {
          gridData: savedGrid,
          score: savedScore,
          gameHistory: savedHistory = [],
          redoHistory: savedRedoHistory = [],
          reachedTarget: savedReachedTarget = false,
          continueAfterTarget: savedContinueAfterTarget = false,
          gameOver: savedGameOver = false,
        } = parsedState
  
        setGridData(savedGrid)
        setScore(savedScore)
        setGameHistory(savedHistory)
        setRedoHistory(savedRedoHistory)
        setReachedTarget(savedReachedTarget)
        setContinueAfterTarget(savedContinueAfterTarget)
        setGameOver(savedGameOver)
        return true
      } else {
        // No saved game for this size, start a new one
        newGame(gridSize)
        return false
      }
    } catch (error) {
      console.log("Error loading game state", error)
      newGame(gridSize)
      return false
    }
  }

  const continueGame = () => {
    setContinueAfterTarget(true)
  }

  return (
    <GameLogicContext.Provider
      value={{
        gridData,
        gridSize,
        score,
        highScore,
        gameOver,
        reachedTarget,
        continueAfterTarget,
        boardSizes,
        ongoingGames,
        theme,
        themes: THEMES,
        getColor,
        getTextColor,
        onSwipeUp,
        onSwipeDown,
        onSwipeLeft,
        onSwipeRight,
        newGame,
        loadGameState,
        undoMove,
        redoMove,
        changeGridSize,
        continueGame,
        changeTheme,
        canUndo: gameHistory.length > 0,
        canRedo: redoHistory.length > 0,
      }}
    >
      {children}
    </GameLogicContext.Provider>
  )
}

export const useGameLogic = () => useContext(GameLogicContext)
export default GameLogicProvider

