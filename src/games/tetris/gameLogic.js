/**
 * Tetris Game Logic Module
 * Core game mechanics including collision detection, rotation, line clearing, and scoring
 */

import { getPieceShape, getWallKickData } from './pieceDefinitions.js';

// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

/**
 * Check if a piece collides with the board or locked pieces
 * @param {Array<Array<string|null>>} board - The game board
 * @param {Object} piece - The piece to check {type, rotation, x, y}
 * @returns {boolean} True if collision detected
 */
export function checkCollision(board, piece) {
  const shape = getPieceShape(piece.type, piece.rotation);
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (shape[row][col]) {
        const boardX = piece.x + col;
        const boardY = piece.y + row;
        
        // Check board boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return true;
        }
        
        // Check collision with locked pieces (only if within board)
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Try to rotate a piece with wall kick support
 * @param {Array<Array<string|null>>} board - The game board
 * @param {Object} piece - Current piece {type, rotation, x, y}
 * @param {string} direction - 'cw' for clockwise, 'ccw' for counter-clockwise
 * @returns {Object|null} New piece state if rotation successful, null otherwise
 */
export function tryRotate(board, piece, direction) {
  // O-piece doesn't rotate (requirement 8.5)
  if (piece.type === 'O') {
    return null;
  }
  
  const oldRotation = piece.rotation;
  const newRotation = direction === 'cw' 
    ? (oldRotation + 1) % 4 
    : (oldRotation + 3) % 4; // +3 mod 4 = -1 mod 4
  
  // Try rotation without wall kick first
  const testPiece = { ...piece, rotation: newRotation };
  if (!checkCollision(board, testPiece)) {
    return testPiece;
  }
  
  // Try wall kicks
  const wallKickData = getWallKickData(piece.type);
  const kickKey = `${oldRotation}->${newRotation}`;
  const kicks = wallKickData[kickKey] || [];
  
  for (const [offsetX, offsetY] of kicks) {
    const kickedPiece = {
      ...piece,
      rotation: newRotation,
      x: piece.x + offsetX,
      y: piece.y + offsetY
    };
    
    if (!checkCollision(board, kickedPiece)) {
      return kickedPiece;
    }
  }
  
  // All wall kicks failed
  return null;
}

/**
 * Find all complete rows on the board
 * @param {Array<Array<string|null>>} board - The game board
 * @returns {Array<number>} Array of row indices that are complete
 */
export function findFullLines(board) {
  const fullLines = [];
  
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    if (board[row].every(cell => cell !== null)) {
      fullLines.push(row);
    }
  }
  
  return fullLines;
}

/**
 * Clear specified lines and apply gravity
 * @param {Array<Array<string|null>>} board - The game board
 * @param {Array<number>} lineIndices - Indices of lines to clear
 * @returns {Array<Array<string|null>>} New board with lines cleared
 */
export function clearLines(board, lineIndices) {
  if (lineIndices.length === 0) {
    return board;
  }
  
  // Create new board
  const newBoard = board.map(row => [...row]);
  
  // Sort line indices in descending order to remove from bottom up
  const sortedIndices = [...lineIndices].sort((a, b) => b - a);
  
  // Remove cleared lines
  for (const index of sortedIndices) {
    newBoard.splice(index, 1);
  }
  
  // Add empty lines at the top
  for (let i = 0; i < lineIndices.length; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  
  return newBoard;
}

/**
 * Calculate score for line clears
 * @param {number} linesCleared - Number of lines cleared (1-4)
 * @param {number} level - Current game level
 * @returns {number} Score to add
 */
export function calculateLineClearScore(linesCleared, level) {
  const baseScores = {
    1: 100,
    2: 300,
    3: 500,
    4: 800
  };
  
  return (baseScores[linesCleared] || 0) * level;
}

/**
 * Calculate score for hard drop
 * @param {number} rowsDropped - Number of rows the piece dropped
 * @returns {number} Score to add (2 points per row)
 */
export function calculateHardDropScore(rowsDropped) {
  return rowsDropped * 2;
}

/**
 * Calculate ghost piece position (where piece would land)
 * @param {Array<Array<string|null>>} board - The game board
 * @param {Object} piece - Current piece {type, rotation, x, y}
 * @returns {number} Y position where piece would land
 */
export function calculateGhostPosition(board, piece) {
  let ghostY = piece.y;
  
  // Move down until collision
  while (true) {
    const testPiece = { ...piece, y: ghostY + 1 };
    if (checkCollision(board, testPiece)) {
      break;
    }
    ghostY++;
  }
  
  return ghostY;
}

/**
 * Check if game is over (piece can't spawn)
 * @param {Array<Array<string|null>>} board - The game board
 * @param {Object} piece - Piece trying to spawn {type, rotation, x, y}
 * @returns {boolean} True if game over
 */
export function isGameOver(board, piece) {
  return checkCollision(board, piece);
}

/**
 * Lock a piece onto the board
 * @param {Array<Array<string|null>>} board - The game board
 * @param {Object} piece - Piece to lock {type, rotation, x, y, color}
 * @returns {Array<Array<string|null>>} New board with piece locked
 */
export function lockPiece(board, piece) {
  const newBoard = board.map(row => [...row]);
  const shape = getPieceShape(piece.type, piece.rotation);
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (shape[row][col]) {
        const boardX = piece.x + col;
        const boardY = piece.y + row;
        
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }
  
  return newBoard;
}

/**
 * Create an empty board
 * @returns {Array<Array<null>>} Empty board
 */
export function createEmptyBoard() {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
}
