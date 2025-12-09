/**
 * Game loop module for Flappy Bird game
 * Manages the animation frame loop and timing control
 * Requirements: 1.5, 2.2, 7.3, 3.5, 8.2
 */

/**
 * Creates a game loop for the Flappy Bird game
 * @param {Object} stateManager - The state manager instance
 * @param {Object} uiController - The UI controller instance
 * @returns {Object} Game loop with methods to control animation
 */
export function createGameLoop(stateManager, uiController) {
  let animationFrameId = null;
  let lastTimestamp = null;
  let isRunning = false;
  let isPaused = false;
  
  /**
   * Main animation loop function
   * Calculates delta time and updates game state
   * Requirements 1.5, 2.2, 7.3: Update state with delta time, trigger render
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  function loop(timestamp) {
    if (!isRunning || isPaused) {
      return;
    }
    
    // Calculate delta time in seconds
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    
    // Call state manager update with delta time
    stateManager.update(deltaTime);
    
    // Trigger UI controller render after updates
    uiController.render(stateManager.getState());
    
    // Continue the loop
    animationFrameId = requestAnimationFrame(loop);
  }
  
  /**
   * Starts the animation loop
   * Requirement 8.2: Begin animation loop
   */
  function start() {
    if (isRunning) {
      return;
    }
    
    isRunning = true;
    isPaused = false;
    lastTimestamp = null;
    animationFrameId = requestAnimationFrame(loop);
  }
  
  /**
   * Stops the animation loop
   * Requirement 8.2: Cancel animation frame
   */
  function stop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isRunning = false;
    isPaused = false;
    lastTimestamp = null;
  }
  
  /**
   * Pauses the animation loop without stopping
   * Requirement 8.2: Pause game
   */
  function pause() {
    if (isRunning && !isPaused) {
      isPaused = true;
      lastTimestamp = null;
    }
  }
  
  /**
   * Resumes the animation loop from pause
   * Requirement 8.2: Resume game
   */
  function resume() {
    if (isRunning && isPaused) {
      isPaused = false;
      lastTimestamp = null;
      animationFrameId = requestAnimationFrame(loop);
    }
  }
  
  return {
    start,
    stop,
    pause,
    resume
  };
}
