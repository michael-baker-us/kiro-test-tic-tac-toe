// State management module
import { 
  createEmptyBoard, 
  makeMove as makeGameMove, 
  isValidMove,
  checkWinner,
  checkWinnerWithLine,
  isDraw 
} from './gameLogic.js';

/**
 * Creates a state manager for the tic-tac-toe game
 * @param {Object} options - Configuration options
 * @param {boolean} options.battleMode - Enable battle mode mechanics
 * @returns {Object} State manager with methods to interact with game state
 */
export function createStateManager(options = {}) {
  const battleMode = options.battleMode || false;
  
  // Initial state structure
  let state = {
    board: createEmptyBoard(),
    currentPlayer: 'X',
    gameStatus: 'playing', // 'playing', 'won', 'draw'
    winner: null, // null, 'X', or 'O'
    winningLine: null, // null or array of winning positions [a, b, c]
    battleMode: battleMode,
    turnsRemaining: 1, // For battle mode: tracks consecutive turns
    lastCapturePlayer: null, // Tracks who made the last capture
    lockedPositions: [], // Positions that have been captured and cannot be recaptured
    lastPlacedPosition: null // Tracks the last placed position (cannot be captured immediately)
  };
  
  // Array to store subscriber callbacks
  const subscribers = [];
  
  /**
   * Notifies all subscribers of state changes
   */
  function notifySubscribers() {
    subscribers.forEach(callback => callback(state));
  }
  
  /**
   * Gets the current state
   * @returns {Object} Current game state
   */
  function getState() {
    return { ...state };
  }
  
  /**
   * Attempts to make a move at the given position
   * @param {number} position - Position to place the mark (0-8)
   * @param {boolean} isCapture - Whether this is a capture move (battle mode)
   * @returns {boolean} True if move was successful, false otherwise
   */
  function makeMove(position, isCapture = false) {
    // Don't allow moves if game is finished
    if (state.gameStatus !== 'playing') {
      return false;
    }
    
    // In battle mode, handle capture moves
    if (state.battleMode && isCapture) {
      return handleCaptureMove(position);
    }
    
    // If trying to capture but not in battle mode or cell is not capturable, fail
    if (isCapture) {
      return false;
    }
    
    // Validate the move (must be empty cell)
    if (!isValidMove(state.board, position)) {
      return false;
    }
    
    // Make the move using game logic
    const newBoard = makeGameMove(state.board, position, state.currentPlayer);
    
    // Update the board
    state.board = newBoard;
    
    // Track the last placed position (for battle mode capture rules)
    if (state.battleMode) {
      state.lastPlacedPosition = position;
    }
    
    // Check for winner
    const winResult = checkWinnerWithLine(state.board);
    if (winResult) {
      state.gameStatus = 'won';
      state.winner = winResult.winner;
      state.winningLine = winResult.line;
      notifySubscribers();
      return true;
    }
    
    // Check for draw
    if (isDraw(state.board)) {
      state.gameStatus = 'draw';
      notifySubscribers();
      return true;
    }
    
    // Handle turn switching based on mode
    if (state.battleMode && state.turnsRemaining > 1) {
      // In battle mode with multiple turns remaining, decrement but don't switch
      state.turnsRemaining--;
    } else {
      // Normal turn switch
      state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
      state.turnsRemaining = 1;
    }
    
    // Notify subscribers of state change
    notifySubscribers();
    
    return true;
  }
  
  /**
   * Handles a capture move in battle mode
   * @param {number} position - Position to capture
   * @returns {boolean} True if capture was successful
   */
  function handleCaptureMove(position) {
    const opponent = state.currentPlayer === 'X' ? 'O' : 'X';
    
    // Can only capture opponent's pieces
    if (state.board[position] !== opponent) {
      return false;
    }
    
    // Cannot capture locked positions (previously captured pieces)
    if (state.lockedPositions.includes(position)) {
      return false;
    }
    
    // Cannot capture the last placed position (no immediate retaliation)
    if (position === state.lastPlacedPosition) {
      return false;
    }
    
    // Replace opponent's piece with current player's piece
    state.board[position] = state.currentPlayer;
    
    // Lock this position so it cannot be recaptured
    state.lockedPositions.push(position);
    
    // Track this as the last placed position
    state.lastPlacedPosition = position;
    
    // Check for winner
    const winResult = checkWinnerWithLine(state.board);
    if (winResult) {
      state.gameStatus = 'won';
      state.winner = winResult.winner;
      state.winningLine = winResult.line;
      notifySubscribers();
      return true;
    }
    
    // Check for draw (though unlikely after a capture)
    if (isDraw(state.board)) {
      state.gameStatus = 'draw';
      notifySubscribers();
      return true;
    }
    
    // Switch player and give them 2 turns
    state.currentPlayer = opponent;
    state.turnsRemaining = 2;
    state.lastCapturePlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    
    // Notify subscribers of state change
    notifySubscribers();
    
    return true;
  }
  
  /**
   * Resets the game to initial state
   */
  function resetGame() {
    state = {
      board: createEmptyBoard(),
      currentPlayer: 'X',
      gameStatus: 'playing',
      winner: null,
      winningLine: null,
      battleMode: battleMode,
      turnsRemaining: 1,
      lastCapturePlayer: null,
      lockedPositions: [],
      lastPlacedPosition: null
    };
    
    // Notify subscribers of state change
    notifySubscribers();
  }
  
  /**
   * Checks if a position can be captured
   * @param {number} position - Position to check
   * @returns {boolean} True if position can be captured
   */
  function canCapture(position) {
    if (!state.battleMode) return false;
    if (state.gameStatus !== 'playing') return false;
    
    // Cannot capture locked positions
    if (state.lockedPositions.includes(position)) return false;
    
    // Cannot capture the last placed position
    if (position === state.lastPlacedPosition) return false;
    
    const opponent = state.currentPlayer === 'X' ? 'O' : 'X';
    return state.board[position] === opponent;
  }
  
  /**
   * Subscribes to state changes
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  function subscribe(callback) {
    subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }
  
  return {
    getState,
    makeMove,
    resetGame,
    subscribe,
    canCapture
  };
}
