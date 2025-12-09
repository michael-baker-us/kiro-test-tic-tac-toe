/**
 * Tetris State Manager
 * Centralized state management with observer pattern
 */

import { createEmptyBoard, checkCollision, tryRotate, findFullLines, clearLines, 
         calculateLineClearScore, calculateHardDropScore, calculateGhostPosition, 
         isGameOver, lockPiece } from './gameLogic.js';
import { getAllPieceTypes, getPieceColor, getSpawnPosition } from './pieceDefinitions.js';

/**
 * Calculate drop speed based on level (requirement 4.3, 4.4)
 * Formula: max(100, 1000 - (level - 1) * 100) milliseconds
 */
export function calculateDropSpeed(level) {
  return Math.max(100, 1000 - (level - 1) * 100);
}

/**
 * Create initial game state
 */
function createInitialState() {
  const pieceTypes = getAllPieceTypes();
  const firstPieceType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
  const nextPieceType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
  const spawnPos = getSpawnPosition(firstPieceType);
  
  return {
    board: createEmptyBoard(),
    currentPiece: {
      type: firstPieceType,
      rotation: 0,
      x: spawnPos.x,
      y: spawnPos.y,
      color: getPieceColor(firstPieceType)
    },
    nextPiece: {
      type: nextPieceType,
      color: getPieceColor(nextPieceType)
    },
    score: 0,
    level: 1,
    linesCleared: 0,
    gameStatus: 'playing',
    dropSpeed: calculateDropSpeed(1),
    lastDropTime: Date.now(),
    lockDelay: 500,
    lockDelayStart: null
  };
}

/**
 * State Manager class
 */
export class StateManager {
  constructor() {
    this.state = createInitialState();
    this.observers = [];
  }

  /**
   * Get current state (read-only copy)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  /**
   * Notify all observers of state change
   */
  notifyObservers() {
    this.observers.forEach(callback => callback(this.getState()));
  }

  /**
   * Start a new game
   */
  startGame() {
    this.state = createInitialState();
    this.state.gameStatus = 'playing';
    this.notifyObservers();
  }

  /**
   * Pause the game
   */
  pauseGame() {
    if (this.state.gameStatus === 'playing') {
      this.state.gameStatus = 'paused';
      this.notifyObservers();
    }
  }

  /**
   * Resume the game
   */
  resumeGame() {
    if (this.state.gameStatus === 'paused') {
      this.state.gameStatus = 'playing';
      this.state.lastDropTime = Date.now(); // Reset drop timer
      this.notifyObservers();
    }
  }

  /**
   * Reset the game to initial state
   */
  resetGame() {
    this.state = createInitialState();
    this.notifyObservers();
  }

  /**
   * Move the current piece
   * @param {number} dx - Horizontal movement (-1 left, 1 right)
   * @param {number} dy - Vertical movement (1 down)
   * @returns {boolean} True if move was successful
   */
  movePiece(dx, dy) {
    if (this.state.gameStatus !== 'playing') {
      return false;
    }

    const newPiece = {
      ...this.state.currentPiece,
      x: this.state.currentPiece.x + dx,
      y: this.state.currentPiece.y + dy
    };

    if (!checkCollision(this.state.board, newPiece)) {
      this.state.currentPiece = newPiece;
      
      // Reset lock delay if piece moved down successfully
      if (dy > 0) {
        this.state.lockDelayStart = null;
      }
      
      this.notifyObservers();
      return true;
    }

    return false;
  }

  /**
   * Rotate the current piece
   * @param {string} direction - 'cw' for clockwise, 'ccw' for counter-clockwise
   * @returns {boolean} True if rotation was successful
   */
  rotatePiece(direction) {
    if (this.state.gameStatus !== 'playing') {
      return false;
    }

    const rotatedPiece = tryRotate(this.state.board, this.state.currentPiece, direction);
    
    if (rotatedPiece) {
      this.state.currentPiece = rotatedPiece;
      this.notifyObservers();
      return true;
    }

    return false;
  }

  /**
   * Execute hard drop
   */
  hardDrop() {
    if (this.state.gameStatus !== 'playing') {
      return;
    }

    const ghostY = calculateGhostPosition(this.state.board, this.state.currentPiece);
    const rowsDropped = ghostY - this.state.currentPiece.y;
    
    // Move piece to ghost position
    this.state.currentPiece.y = ghostY;
    
    // Award hard drop score
    this.state.score += calculateHardDropScore(rowsDropped);
    
    // Lock the piece immediately
    this.lockPiece();
  }

  /**
   * Lock the current piece and spawn next piece
   */
  lockPiece() {
    if (this.state.gameStatus !== 'playing') {
      return;
    }

    // Lock piece to board
    this.state.board = lockPiece(this.state.board, this.state.currentPiece);
    
    // Clear lines
    const fullLines = findFullLines(this.state.board);
    if (fullLines.length > 0) {
      this.state.board = clearLines(this.state.board, fullLines);
      this.state.linesCleared += fullLines.length;
      this.state.score += calculateLineClearScore(fullLines.length, this.state.level);
      
      // Update level (requirement 4.2: level = 1 + floor(linesCleared / 10))
      this.updateLevel();
    }
    
    // Spawn next piece
    this.spawnNextPiece();
  }

  /**
   * Spawn the next piece
   * @returns {boolean} True if spawn successful, false if game over
   */
  spawnNextPiece() {
    const pieceTypes = getAllPieceTypes();
    const spawnPos = getSpawnPosition(this.state.nextPiece.type);
    
    const newPiece = {
      type: this.state.nextPiece.type,
      rotation: 0,
      x: spawnPos.x,
      y: spawnPos.y,
      color: this.state.nextPiece.color
    };
    
    // Check if spawn position is blocked (game over)
    if (isGameOver(this.state.board, newPiece)) {
      this.state.gameStatus = 'gameOver';
      this.notifyObservers();
      return false;
    }
    
    // Set current piece
    this.state.currentPiece = newPiece;
    
    // Generate new next piece
    const nextPieceType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    this.state.nextPiece = {
      type: nextPieceType,
      color: getPieceColor(nextPieceType)
    };
    
    // Reset lock delay
    this.state.lockDelayStart = null;
    
    this.notifyObservers();
    return true;
  }

  /**
   * Update level based on lines cleared
   */
  updateLevel() {
    const newLevel = 1 + Math.floor(this.state.linesCleared / 10);
    if (newLevel !== this.state.level) {
      this.state.level = newLevel;
      this.state.dropSpeed = calculateDropSpeed(newLevel);
    }
  }

  /**
   * Update score
   * @param {number} points - Points to add
   */
  updateScore(points) {
    this.state.score += points;
    this.notifyObservers();
  }
}

