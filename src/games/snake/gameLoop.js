/**
 * Game loop module for Snake game
 * Implements fixed time step game loop using requestAnimationFrame
 */

/**
 * Creates a game loop with fixed time step
 * @param {Object} stateManager - State manager instance
 * @returns {Object} Game loop controller with start/stop methods
 */
export function createGameLoop(stateManager) {
  let animationFrameId = null;
  let lastUpdateTime = 0;
  let isRunning = false;
  
  /**
   * Main game loop function
   * @param {number} currentTime - Current timestamp from requestAnimationFrame
   */
  function loop(currentTime) {
    if (!isRunning) {
      return;
    }
    
    const state = stateManager.getState();
    
    // Stop loop if game is over
    if (state.gameStatus === 'gameOver') {
      stop();
      return;
    }
    
    // Calculate time since last update
    const deltaTime = currentTime - lastUpdateTime;
    const updateInterval = state.speed;
    
    // Update game state if enough time has passed
    if (deltaTime >= updateInterval) {
      stateManager.tick();
      lastUpdateTime = currentTime;
    }
    
    // Continue the loop
    animationFrameId = requestAnimationFrame(loop);
  }
  
  /**
   * Starts the game loop
   */
  function start() {
    if (isRunning) {
      return; // Already running
    }
    
    isRunning = true;
    lastUpdateTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  }
  
  /**
   * Stops the game loop
   */
  function stop() {
    isRunning = false;
    
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
  
  /**
   * Checks if the loop is currently running
   * @returns {boolean} True if loop is running
   */
  function getIsRunning() {
    return isRunning;
  }
  
  return {
    start,
    stop,
    getIsRunning
  };
}
