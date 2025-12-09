/**
 * Flappy Bird game wrapper that implements the Game interface
 * Integrates all game modules and provides platform interface
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */

import { createStateManager } from './stateManager.js';
import { createUIController } from './uiController.js';
import { createInputHandler } from './inputHandler.js';
import { createGameLoop } from './gameLoop.js';
import { CONFIG } from './config.js';

/**
 * Detects if the device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Creates a Flappy Bird game instance
 * Requirement 8.4: Export interface with init, destroy, pause, resume methods
 * @returns {Object} Game instance with init, destroy, pause, and resume methods
 */
export default function createFlappyBirdGame() {
  let stateManager = null;
  let uiController = null;
  let inputHandler = null;
  let gameLoop = null;
  let container = null;
  
  /**
   * Handles flap action during gameplay
   */
  function handleFlap() {
    if (stateManager) {
      stateManager.flap();
    }
  }
  
  /**
   * Handles starting the game from menu
   */
  function handleStart() {
    if (stateManager) {
      stateManager.startGame();
    }
  }
  
  /**
   * Handles restarting the game from game over
   */
  function handleRestart() {
    if (stateManager) {
      stateManager.resetGame();
    }
  }
  
  /**
   * Initializes the game in the provided container
   * Requirement 8.1: Initialize game in container
   * @param {HTMLElement} containerElement - Container to render the game in
   */
  async function init(containerElement) {
    if (!containerElement) {
      throw new Error('Container element is required');
    }
    
    container = containerElement;
    
    // Create state manager with configuration
    stateManager = createStateManager(CONFIG);
    
    // Create UI controller and get the canvas element
    uiController = createUIController(stateManager, container, CONFIG);
    const canvas = uiController.init();
    
    // Create input handler with callbacks and attach to canvas
    inputHandler = createInputHandler(
      handleFlap,
      handleStart,
      handleRestart
    );
    inputHandler.init(canvas || container);
    
    // Enable touch controls on mobile devices
    // Requirement 6.1: Handle touch input on mobile
    if (isMobileDevice()) {
      inputHandler.enableTouchControls();
    }
    
    // Create game loop
    gameLoop = createGameLoop(stateManager, uiController);
    
    // Start the game loop
    gameLoop.start();
  }
  
  /**
   * Cleans up resources when leaving the game
   * Requirement 8.2, 8.5: Clean up all resources
   */
  function destroy() {
    // Stop game loop
    if (gameLoop) {
      gameLoop.stop();
    }
    
    // Clean up input handler
    if (inputHandler) {
      inputHandler.destroy();
    }
    
    // Clean up UI controller
    if (uiController) {
      uiController.destroy();
    }
    
    // Clear the container
    if (container) {
      container.innerHTML = '';
    }
    
    // Reset references
    stateManager = null;
    uiController = null;
    inputHandler = null;
    gameLoop = null;
    container = null;
  }
  
  /**
   * Pauses the game (called when switching away from Flappy Bird tab)
   * Requirement 8.2: Pause game loop for tab switching
   */
  function pause() {
    if (gameLoop) {
      gameLoop.pause();
    }
  }
  
  /**
   * Resumes the game (called when switching back to Flappy Bird tab)
   * Requirement 8.2: Resume game loop for tab switching
   */
  function resume() {
    if (gameLoop) {
      gameLoop.resume();
    }
  }
  
  return {
    init,
    destroy,
    pause,
    resume
  };
}
