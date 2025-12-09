/**
 * State management module for Flappy Bird game
 * Implements observable pattern for state changes
 */

import { CONFIG } from './config.js';
import * as GameLogic from './gameLogic.js';

/**
 * Creates initial game state
 * @param {Object} config - Configuration options
 * @returns {Object} Initial game state
 */
function createInitialState(config) {
  return {
    gameStatus: config.GAME_STATES.MENU,
    bird: {
      x: config.birdX,
      y: config.canvasHeight / 2,
      velocity: 0,
      width: config.birdSize,
      height: config.birdSize,
      rotation: 0
    },
    pipes: [],
    score: config.initialScore,
    highScore: 0
  };
}

/**
 * Creates a state manager for the Flappy Bird game
 * @param {Object} config - Configuration options (defaults to CONFIG)
 * @returns {Object} State manager with methods to interact with game state
 */
export function createStateManager(config = CONFIG) {
  // Initialize state
  let state = createInitialState(config);
  
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
    // Return a deep copy to prevent external modifications
    return {
      ...state,
      bird: { ...state.bird },
      pipes: [...state.pipes]
    };
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
  
  /**
   * Applies upward velocity to bird (flap action)
   * Requirement 1.1: Apply upward velocity when player taps/clicks
   */
  function flap() {
    // Only apply flap if in playing state
    if (state.gameStatus === config.GAME_STATES.PLAYING) {
      state.bird.velocity = config.flapVelocity;
      notifySubscribers();
    }
  }
  
  /**
   * Updates game state based on delta time
   * Coordinates state updates and delegates to game logic
   * @param {number} deltaTime - Time elapsed since last update (seconds)
   */
  function update(deltaTime) {
    // Only update if in playing state
    // Requirement 3.5: Game over state prevents updates
    if (state.gameStatus !== config.GAME_STATES.PLAYING) {
      return;
    }
    
    // Update bird physics
    state.bird = GameLogic.updateBirdPhysics(state.bird, deltaTime, config);
    
    // Update pipes
    state.pipes = GameLogic.updatePipes(state.pipes, deltaTime, config);
    
    // Check for collisions
    if (GameLogic.checkCollision(state.bird, state.pipes, config.canvasHeight)) {
      endGame();
      return;
    }
    
    // Check scoring
    const scoreIncrement = GameLogic.checkScoring(state.bird, state.pipes);
    if (scoreIncrement > 0) {
      state.score += scoreIncrement;
    }
    
    // Generate new pipes if needed
    if (state.pipes.length === 0 || 
        state.pipes[state.pipes.length - 1].x < config.canvasWidth - config.pipeSpawnInterval / config.pipeSpeed * config.pipeSpeed) {
      state.pipes.push(GameLogic.generatePipe(config.canvasWidth, config.canvasHeight, config));
    }
    
    notifySubscribers();
  }
  
  /**
   * Transitions from menu to playing state
   * Requirement 5.2: Start game when player provides input on menu
   */
  function startGame() {
    if (state.gameStatus === config.GAME_STATES.MENU) {
      state.gameStatus = config.GAME_STATES.PLAYING;
      notifySubscribers();
    }
  }
  
  /**
   * Transitions to game over state
   * Requirement 3.3: Transition to game over when collision detected
   */
  function endGame() {
    if (state.gameStatus === config.GAME_STATES.PLAYING) {
      state.gameStatus = config.GAME_STATES.GAME_OVER;
      
      // Update high score if current score is higher
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
      
      notifySubscribers();
    }
  }
  
  /**
   * Resets game to initial state
   * Requirements 5.3, 5.4, 5.5: Reset game from game over state
   */
  function resetGame() {
    // Only reset if in game over state
    if (state.gameStatus === config.GAME_STATES.GAME_OVER) {
      const highScore = state.highScore;
      state = createInitialState(config);
      state.highScore = highScore; // Preserve high score
      notifySubscribers();
    }
  }
  
  /**
   * Increments the score by one
   * Requirement 4.1: Increment score when bird passes pipe
   */
  function incrementScore() {
    if (state.gameStatus === config.GAME_STATES.PLAYING) {
      state.score += 1;
      notifySubscribers();
    }
  }
  
  return {
    getState,
    subscribe,
    flap,
    update,
    startGame,
    endGame,
    resetGame,
    incrementScore
  };
}
