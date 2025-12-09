/**
 * Snake game wrapper that implements the Game interface
 * Integrates all game modules and provides platform interface
 */

import { createStateManager } from './stateManager.js';
import { createUIController } from './uiController.js';
import { createInputHandler } from './inputHandler.js';
import { createGameLoop } from './gameLoop.js';

/**
 * Detects if the device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Calculates responsive board dimensions based on viewport
 * @returns {Object} Board dimensions {width, height}
 */
function getResponsiveBoardSize() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = isMobileDevice();
  
  if (isMobile) {
    // Mobile portrait: narrower, taller
    if (viewportHeight > viewportWidth) {
      return { width: 15, height: 20 };
    }
    // Mobile landscape: wider, shorter
    else {
      return { width: 20, height: 15 };
    }
  }
  
  // Tablet/Desktop: square board
  return { width: 20, height: 20 };
}

/**
 * Creates a Snake game instance
 * @returns {Object} Game instance with init and destroy methods
 */
export default function createSnakeGame() {
  let stateManager = null;
  let uiController = null;
  let inputHandler = null;
  let gameLoop = null;
  let container = null;
  
  // Button references for event cleanup
  let pauseBtn = null;
  let restartBtn = null;
  let playAgainBtn = null;
  
  /**
   * Handles pause/resume toggle
   */
  function handlePauseToggle() {
    const state = stateManager.getState();
    
    if (state.gameStatus === 'playing') {
      stateManager.pauseGame();
      gameLoop.stop();
      if (pauseBtn) {
        pauseBtn.textContent = 'Resume';
      }
    } else if (state.gameStatus === 'paused') {
      stateManager.resumeGame();
      gameLoop.start();
      if (pauseBtn) {
        pauseBtn.textContent = 'Pause';
      }
    }
  }
  
  /**
   * Handles game restart
   */
  function handleRestart() {
    stateManager.resetGame();
    gameLoop.start();
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause';
    }
  }
  
  /**
   * Handles direction change from input
   * @param {string} direction - New direction
   */
  function handleDirectionChange(direction) {
    stateManager.updateDirection(direction);
  }
  
  /**
   * Initializes the game in the provided container
   * @param {HTMLElement} containerElement - Container to render the game in
   */
  async function init(containerElement) {
    if (!containerElement) {
      throw new Error('Container element is required');
    }
    
    container = containerElement;
    
    // Get responsive board size
    const boardSize = getResponsiveBoardSize();
    
    // Create state manager with responsive board dimensions
    stateManager = createStateManager({
      boardWidth: boardSize.width,
      boardHeight: boardSize.height,
      initialSpeed: 200,
      speedIncrement: 10,
      speedThreshold: 50,
      minSpeed: 50,
      initialSnakeLength: 3
    });
    
    // Create UI controller
    uiController = createUIController(stateManager, container);
    uiController.init();
    
    // Create input handler
    inputHandler = createInputHandler(
      handleDirectionChange,
      handlePauseToggle,
      handleRestart
    );
    inputHandler.init(container);
    
    // Enable touch controls on mobile devices
    if (isMobileDevice()) {
      inputHandler.enableTouchControls();
    }
    
    // Create game loop
    gameLoop = createGameLoop(stateManager);
    
    // Set up button event listeners
    pauseBtn = container.querySelector('#pause-btn');
    restartBtn = container.querySelector('#restart-btn');
    playAgainBtn = container.querySelector('#play-again-btn');
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', handlePauseToggle);
    }
    
    if (restartBtn) {
      restartBtn.addEventListener('click', handleRestart);
    }
    
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', handleRestart);
    }
    
    // Start the game loop
    gameLoop.start();
  }
  
  /**
   * Cleans up resources when leaving the game
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
    
    // Remove button event listeners
    if (pauseBtn) {
      pauseBtn.removeEventListener('click', handlePauseToggle);
    }
    
    if (restartBtn) {
      restartBtn.removeEventListener('click', handleRestart);
    }
    
    if (playAgainBtn) {
      playAgainBtn.removeEventListener('click', handleRestart);
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
    pauseBtn = null;
    restartBtn = null;
    playAgainBtn = null;
  }
  
  return {
    init,
    destroy
  };
}
