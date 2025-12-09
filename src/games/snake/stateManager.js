/**
 * State management module for Snake game
 * Implements observable pattern for state changes
 */

import {
  createGameBoard,
  initializeSnake,
  moveSnake,
  checkBoundaryCollision,
  checkSelfCollision,
  checkFoodCollision,
  spawnFood,
  updateSnakeDirection
} from './gameLogic.js';

/**
 * Creates a state manager for the Snake game
 * @param {Object} config - Configuration options
 * @param {number} config.boardWidth - Board width in cells (default: 20)
 * @param {number} config.boardHeight - Board height in cells (default: 20)
 * @param {number} config.initialSpeed - Initial game speed in ms (default: 200)
 * @param {number} config.speedIncrement - Speed increase per threshold in ms (default: 10)
 * @param {number} config.speedThreshold - Score points per speed increase (default: 50)
 * @param {number} config.minSpeed - Maximum speed (minimum ms) (default: 50)
 * @param {number} config.initialSnakeLength - Initial snake length (default: 3)
 * @returns {Object} State manager with methods to interact with game state
 */
export function createStateManager(config = {}) {
  const boardWidth = config.boardWidth || 20;
  const boardHeight = config.boardHeight || 20;
  const initialSpeed = config.initialSpeed || 200;
  const speedIncrement = config.speedIncrement || 10;
  const speedThreshold = config.speedThreshold || 50;
  const minSpeed = config.minSpeed || 50;
  const initialSnakeLength = config.initialSnakeLength || 3;
  
  // Create initial state
  const board = createGameBoard(boardWidth, boardHeight);
  const initialSnake = initializeSnake(board, initialSnakeLength);
  const initialFood = spawnFood(board, initialSnake);
  
  let state = {
    snake: initialSnake,
    food: initialFood,
    score: 0,
    gameStatus: 'playing', // 'playing', 'paused', 'gameOver'
    speed: initialSpeed,
    boardWidth,
    boardHeight
  };
  
  // Store initial values for reset
  const initialState = {
    snake: initialSnake,
    food: initialFood,
    score: 0,
    gameStatus: 'playing',
    speed: initialSpeed
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
   * @returns {Object} Current game state (copy)
   */
  function getState() {
    return { ...state };
  }
  
  /**
   * Updates the snake direction
   * @param {string} direction - New direction ('up', 'down', 'left', 'right')
   */
  function updateDirection(direction) {
    // Ignore direction changes when paused or game over
    if (state.gameStatus !== 'playing') {
      return;
    }
    
    state.snake = updateSnakeDirection(state.snake, direction);
  }
  
  /**
   * Processes one game tick (movement update)
   */
  function tick() {
    // Don't update if not playing
    if (state.gameStatus !== 'playing') {
      return;
    }
    
    // Calculate next head position with wrapping
    const nextSnake = moveSnake(state.snake, false, board);
    const nextHead = nextSnake.head;
    
    // Check for self collision (only failure condition now)
    if (checkSelfCollision(nextHead, state.snake.body)) {
      state.gameStatus = 'gameOver';
      notifySubscribers();
      return;
    }
    
    // Check for food collision
    const ateFood = checkFoodCollision(nextHead, state.food);
    
    if (ateFood) {
      // Grow the snake with wrapping
      state.snake = moveSnake(state.snake, true, board);
      
      // Increase score
      state.score += 10;
      
      // Spawn new food
      state.food = spawnFood(board, state.snake);
      
      // Check if we should increase speed
      const speedLevel = Math.floor(state.score / speedThreshold);
      const newSpeed = Math.max(minSpeed, initialSpeed - (speedLevel * speedIncrement));
      state.speed = newSpeed;
    } else {
      // Move without growing
      state.snake = nextSnake;
    }
    
    notifySubscribers();
  }
  
  /**
   * Pauses the game
   */
  function pauseGame() {
    if (state.gameStatus === 'playing') {
      state.gameStatus = 'paused';
      notifySubscribers();
    }
  }
  
  /**
   * Resumes the game
   */
  function resumeGame() {
    if (state.gameStatus === 'paused') {
      state.gameStatus = 'playing';
      notifySubscribers();
    }
  }
  
  /**
   * Resets the game to initial state
   */
  function resetGame() {
    const newSnake = initializeSnake(board, initialSnakeLength);
    const newFood = spawnFood(board, newSnake);
    
    state = {
      snake: newSnake,
      food: newFood,
      score: 0,
      gameStatus: 'playing',
      speed: initialSpeed,
      boardWidth,
      boardHeight
    };
    
    notifySubscribers();
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
    subscribe,
    updateDirection,
    tick,
    pauseGame,
    resumeGame,
    resetGame
  };
}
