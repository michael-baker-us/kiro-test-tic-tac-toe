// Game logic module - pure functions for tic-tac-toe game

/**
 * Creates an empty 3x3 tic-tac-toe board
 * @returns {Array} Array of 9 null values representing empty cells
 */
export function createEmptyBoard() {
  return Array(9).fill(null);
}

/**
 * Checks if a move is valid at the given position
 * @param {Array} board - Current board state
 * @param {number} position - Position to check (0-8)
 * @returns {boolean} True if the move is valid, false otherwise
 */
export function isValidMove(board, position) {
  // Check if position is within valid range
  if (position < 0 || position > 8) {
    return false;
  }
  
  // Check if the cell is empty
  return board[position] === null;
}

/**
 * Makes a move on the board (immutable operation)
 * @param {Array} board - Current board state
 * @param {number} position - Position to place the mark (0-8)
 * @param {string} player - Player making the move ('X' or 'O')
 * @returns {Array} New board with the move applied, or original board if invalid
 */
export function makeMove(board, position, player) {
  // Validate the move
  if (!isValidMove(board, position)) {
    return board;
  }
  
  // Validate player
  if (player !== 'X' && player !== 'O') {
    return board;
  }
  
  // Create new board with the move applied (immutable)
  const newBoard = [...board];
  newBoard[position] = player;
  return newBoard;
}

/**
 * Gets all available move positions on the board
 * @param {Array} board - Current board state
 * @returns {Array<number>} Array of available positions (0-8)
 */
export function getAvailableMoves(board) {
  const availableMoves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      availableMoves.push(i);
    }
  }
  return availableMoves;
}

/**
 * Checks if there is a winner on the board
 * @param {Array} board - Current board state
 * @returns {string|null} Winning player ('X' or 'O') or null if no winner
 */
export function checkWinner(board) {
  const result = checkWinnerWithLine(board);
  return result ? result.winner : null;
}

/**
 * Checks if there is a winner on the board and returns the winning line
 * @param {Array} board - Current board state
 * @returns {Object|null} Object with winner and line positions, or null if no winner
 */
export function checkWinnerWithLine(board) {
  // Define all 8 possible winning lines
  const winningLines = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  // Check each winning line
  for (const line of winningLines) {
    const [a, b, c] = line;
    
    // Check if all three positions have the same non-null value
    if (board[a] !== null && 
        board[a] === board[b] && 
        board[a] === board[c]) {
      return {
        winner: board[a],
        line: line
      };
    }
  }
  
  // No winner found
  return null;
}

/**
 * Checks if the game is a draw
 * @param {Array} board - Current board state
 * @returns {boolean} True if the board is full with no winner, false otherwise
 */
export function isDraw(board) {
  // First check if there's a winner - if so, it's not a draw
  if (checkWinner(board) !== null) {
    return false;
  }
  
  // Check if the board is full (no null values)
  return board.every(cell => cell !== null);
}
