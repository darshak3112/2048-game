export const initializeBoard = (size) => {
  return Array(size).fill().map(() => Array(size).fill(0));
};

export const addNewTile = (board) => {
  // Create a new board to avoid mutating the original
  const newBoard = board.map(row => [...row]);
  const emptyCells = [];

  // Find all empty cells
  for (let i = 0; i < newBoard.length; i++) {
    for (let j = 0; j < newBoard[i].length; j++) {
      if (newBoard[i][j] === 0) {
        emptyCells.push({ i, j });
      }
    }
  }

  // If there are empty cells, add a new tile (90% chance of 2, 10% chance of 4)
  if (emptyCells.length > 0) {
    const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
  }

  return newBoard;
};

// Helper function to transpose a matrix (swap rows and columns)
const transpose = (matrix) => {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

// Helper function to reverse rows in a matrix
const reverse = (matrix) => {
  return matrix.map(row => [...row].reverse());
};

const slideRow = (row) => {
  // Remove zeros
  let newRow = row.filter(cell => cell !== 0);
  let scoreIncrease = 0;
  
  // Merge tiles
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      scoreIncrease += newRow[i];
      newRow[i + 1] = 0;
    }
  }
  
  // Remove zeros again after merging
  newRow = newRow.filter(cell => cell !== 0);
  
  // Fill the row with zeros
  while (newRow.length < row.length) {
    newRow.push(0);
  }
  
  return { newRow, scoreIncrease };
};

export const moveTiles = (direction, board) => {
  // Create a deep copy of the board
  let newBoard = board.map(row => [...row]);
  let scoreDelta = 0;
  
  // Apply movement based on direction
  if (direction === 'left') {
    // For left movement, process each row directly
    for (let i = 0; i < newBoard.length; i++) {
      const { newRow, scoreIncrease } = slideRow(newBoard[i]);
      newBoard[i] = newRow;
      scoreDelta += scoreIncrease;
    }
  } else if (direction === 'right') {
    // For right, reverse each row, process, then reverse back
    for (let i = 0; i < newBoard.length; i++) {
      const reversedRow = [...newBoard[i]].reverse();
      const { newRow, scoreIncrease } = slideRow(reversedRow);
      newBoard[i] = newRow.reverse();
      scoreDelta += scoreIncrease;
    }
  } else if (direction === 'up') {
    // For up, transpose the board, process each row, then transpose back
    const transposed = transpose(newBoard);
    
    for (let i = 0; i < transposed.length; i++) {
      const { newRow, scoreIncrease } = slideRow(transposed[i]);
      transposed[i] = newRow;
      scoreDelta += scoreIncrease;
    }
    
    newBoard = transpose(transposed);
  } else if (direction === 'down') {
    // For down, transpose, reverse each row, process, reverse back, transpose back
    const transposed = transpose(newBoard);
    
    for (let i = 0; i < transposed.length; i++) {
      const reversedRow = [...transposed[i]].reverse();
      const { newRow, scoreIncrease } = slideRow(reversedRow);
      transposed[i] = newRow.reverse();
      scoreDelta += scoreIncrease;
    }
    
    newBoard = transpose(transposed);
  }
  
  return { newBoard, scoreDelta };
};

// Check if there is a 2048 tile (win condition)
export const hasWon = (board) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 2048) return true;
    }
  }
  return false;
};

// Check if the game is over (no empty cells and no possible merges)
export const isGameOver = (board) => {
  // Check for empty cells
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  
  // Check for possible merges horizontally
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length - 1; j++) {
      if (board[i][j] === board[i][j + 1]) return false;
    }
  }
  
  // Check for possible merges vertically
  for (let i = 0; i < board.length - 1; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === board[i + 1][j]) return false;
    }
  }
  
  return true;
};

// Check if the board has changed after a move
export const hasBoardChanged = (oldBoard, newBoard) => {
  for (let i = 0; i < oldBoard.length; i++) {
    for (let j = 0; j < oldBoard[i].length; j++) {
      if (oldBoard[i][j] !== newBoard[i][j]) return true;
    }
  }
  return false;
};