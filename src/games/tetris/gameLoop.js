/**
 * Tetris Game Loop
 * Manages automatic piece dropping and lock delay timing
 */

/**
 * Game Loop class
 * Handles the game tick cycle with automatic dropping and lock delay
 */
export class GameLoop {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.intervalId = null;
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    
    // Start the game loop with requestAnimationFrame for smooth updates
    const tick = () => {
      if (!this.isRunning) {
        return;
      }

      if (!this.isPaused) {
        this.update();
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * Pause the game loop
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume the game loop
   */
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      // Reset the last drop time to prevent immediate drop after resume
      const state = this.stateManager.getState();
      state.lastDropTime = Date.now();
    }
  }

  /**
   * Update game state (called each frame)
   */
  update() {
    // Access state directly from stateManager's internal state
    const state = this.stateManager.state;
    
    // Only update if game is playing
    if (state.gameStatus !== 'playing') {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastDrop = currentTime - state.lastDropTime;

    // Check if lock delay has expired first
    if (state.lockDelayStart !== null) {
      const lockDelayElapsed = currentTime - state.lockDelayStart;
      if (lockDelayElapsed >= state.lockDelay) {
        // Lock the piece
        this.stateManager.lockPiece();
        
        // Reset last drop time for new piece
        state.lastDropTime = currentTime;
        return;
      }
    }

    // Check if it's time for automatic drop (requirement 2.2, 2.5)
    if (timeSinceLastDrop >= state.dropSpeed) {
      // Try to move piece down
      const moved = this.stateManager.movePiece(0, 1);
      
      if (moved) {
        // Piece moved successfully, update last drop time
        state.lastDropTime = currentTime;
      } else {
        // Piece can't move down, start lock delay (requirement 2.3)
        if (state.lockDelayStart === null) {
          state.lockDelayStart = currentTime;
        }
      }
    }
  }

  /**
   * Set drop speed (called when level changes)
   * @param {number} speed - New drop speed in milliseconds
   */
  setDropSpeed(speed) {
    // Access state directly from stateManager's internal state
    this.stateManager.state.dropSpeed = speed;
  }
}
