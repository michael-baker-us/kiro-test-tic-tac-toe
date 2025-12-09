/**
 * Tetris game wrapper that implements the Game interface
 * Integrates all game modules and provides platform interface
 */

import { StateManager } from './stateManager.js';
import { createUIController } from './uiController.js';
import { createInputHandler } from './inputHandler.js';
import { GameLoop } from './gameLoop.js';

/**
 * Creates a Tetris game instance
 * @returns {Object} Game instance with init and destroy methods
 */
export default function createTetrisGame() {
  let stateManager = null;
  let uiController = null;
  let inputHandler = null;
  let gameLoop = null;
  let container = null;
  
  // Button references for event cleanup
  let playAgainBtn = null;
  
  /**
   * Handles pause/resume toggle
   */
  function handlePauseToggle() {
    const state = stateManager.getState();
    
    if (state.gameStatus === 'playing') {
      stateManager.pauseGame();
      gameLoop.pause();
    } else if (state.gameStatus === 'paused') {
      stateManager.resumeGame();
      gameLoop.resume();
    }
  }
  
  /**
   * Handles game restart
   */
  function handleRestart() {
    stateManager.resetGame();
    gameLoop.start();
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
    
    // Create state manager
    stateManager = new StateManager();
    
    // Create UI controller
    uiController = createUIController(stateManager, container);
    uiController.init();
    
    // Create input handler with callbacks
    inputHandler = createInputHandler({
      onMoveLeft: () => stateManager.movePiece(-1, 0),
      onMoveRight: () => stateManager.movePiece(1, 0),
      onMoveDown: () => stateManager.movePiece(0, 1),
      onRotateCW: () => stateManager.rotatePiece('cw'),
      onRotateCCW: () => stateManager.rotatePiece('ccw'),
      onHardDrop: () => stateManager.hardDrop(),
      onPause: handlePauseToggle
    });
    inputHandler.init(container);
    inputHandler.enableTouchControls();
    
    // Create game loop
    gameLoop = new GameLoop(stateManager);
    
    // Set up button event listeners
    playAgainBtn = container.querySelector('#tetris-play-again-btn');
    
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
    playAgainBtn = null;
  }
  
  /**
   * Pause the game (called when switching away from Tetris tab)
   */
  function pause() {
    if (stateManager && gameLoop) {
      const state = stateManager.getState();
      if (state.gameStatus === 'playing') {
        stateManager.pauseGame();
        gameLoop.pause();
      }
    }
  }
  
  /**
   * Resume the game (called when switching back to Tetris tab)
   */
  function resume() {
    if (stateManager && gameLoop) {
      const state = stateManager.getState();
      if (state.gameStatus === 'paused') {
        stateManager.resumeGame();
        gameLoop.resume();
      }
    }
  }
  
  return {
    init,
    destroy,
    pause,
    resume
  };
}
