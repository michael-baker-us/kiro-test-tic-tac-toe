/**
 * UI Controller module for Snake game
 * Handles all rendering and visual updates using HTML5 Canvas
 */

/**
 * Creates a UI controller for the Snake game
 * @param {Object} stateManager - The state manager instance
 * @param {HTMLElement} container - Container element for the game
 * @returns {Object} UI controller with methods to render and manage display
 */
export function createUIController(stateManager, container) {
  let canvas = null;
  let ctx = null;
  let cellSize = 0;
  let unsubscribe = null;
  
  // UI element references
  let scoreDisplay = null;
  let gameOverOverlay = null;
  let pauseOverlay = null;
  let finalScoreDisplay = null;
  let mobileInstructions = null;
  
  /**
   * Initializes the UI controller
   * Sets up canvas and DOM elements
   */
  function init() {
    // Create HTML structure
    createHTMLStructure();
    
    // Get element references
    canvas = container.querySelector('#game-canvas');
    scoreDisplay = container.querySelector('#score');
    gameOverOverlay = container.querySelector('#game-over');
    pauseOverlay = container.querySelector('#pause-overlay');
    finalScoreDisplay = container.querySelector('#final-score');
    mobileInstructions = container.querySelector('#mobile-instructions');
    
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    // Get 2D rendering context
    ctx = canvas.getContext('2d');
    
    // Set up canvas dimensions
    setupCanvas();
    
    // Subscribe to state changes
    unsubscribe = stateManager.subscribe((state) => {
      render(state);
    });
    
    // Initial render
    render(stateManager.getState());
    
    // Show mobile instructions on touch devices
    if (isMobileDevice()) {
      if (mobileInstructions) {
        mobileInstructions.style.display = 'block';
      }
    }
  }
  
  /**
   * Creates the HTML structure for the game
   */
  function createHTMLStructure() {
    container.innerHTML = `
      <div class="snake-game">
        <div class="game-header">
          <h1>Snake</h1>
          <div class="score-display">Score: <span id="score">0</span></div>
        </div>
        
        <canvas id="game-canvas" class="game-canvas"></canvas>
        
        <div class="game-controls">
          <button id="pause-btn" class="control-btn">Pause</button>
          <button id="restart-btn" class="control-btn">Restart</button>
        </div>
        
        <div class="game-over-overlay" id="game-over" style="display: none;">
          <h2>Game Over!</h2>
          <p class="final-score">Final Score: <span id="final-score">0</span></p>
          <button id="play-again-btn" class="primary-btn">Play Again</button>
        </div>
        
        <div class="pause-overlay" id="pause-overlay" style="display: none;">
          <h2>Paused</h2>
          <p>Press Space or tap Resume to continue</p>
        </div>
        
        <div class="mobile-instructions" id="mobile-instructions" style="display: none;">
          <p>Swipe to control the snake</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Sets up canvas dimensions based on game board size
   */
  function setupCanvas() {
    const state = stateManager.getState();
    const containerWidth = container.clientWidth || 600;
    const maxCanvasSize = Math.min(containerWidth - 40, 600); // Leave some padding
    
    // Calculate cell size to fit the board
    cellSize = Math.floor(maxCanvasSize / Math.max(state.boardWidth, state.boardHeight));
    
    // Set canvas dimensions
    canvas.width = state.boardWidth * cellSize;
    canvas.height = state.boardHeight * cellSize;
  }
  
  /**
   * Checks if the device is mobile
   * @returns {boolean} True if mobile device
   */
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Renders the complete game state
   * @param {Object} state - Current game state
   */
  function render(state) {
    // Clear canvas
    clearCanvas();
    
    // Render game board
    renderBoard(state);
    
    // Render food
    renderFood(state);
    
    // Render snake
    renderSnake(state);
    
    // Update score display
    updateScoreDisplay(state);
    
    // Handle overlays based on game status
    if (state.gameStatus === 'gameOver') {
      showGameOver(state.score);
    } else {
      hideGameOver();
    }
    
    if (state.gameStatus === 'paused') {
      showPauseIndicator();
    } else {
      hidePauseIndicator();
    }
  }
  
  /**
   * Clears the canvas
   */
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  /**
   * Renders the game board with grid cells
   * @param {Object} state - Current game state
   */
  function renderBoard(state) {
    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= state.boardWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= state.boardHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(canvas.width, y * cellSize);
      ctx.stroke();
    }
  }
  
  /**
   * Renders the snake with distinct head and body styling
   * @param {Object} state - Current game state
   */
  function renderSnake(state) {
    const { snake } = state;
    
    // Render body segments
    ctx.fillStyle = '#4CAF50';
    snake.body.forEach(segment => {
      renderCell(segment.x, segment.y, '#4CAF50');
    });
    
    // Render head with distinct styling
    renderCell(snake.head.x, snake.head.y, '#66BB6A');
    
    // Add eyes to the head for visual distinction
    renderSnakeEyes(snake.head, snake.direction);
  }
  
  /**
   * Renders eyes on the snake head
   * @param {Object} head - Head position {x, y}
   * @param {string} direction - Current direction
   */
  function renderSnakeEyes(head, direction) {
    const centerX = head.x * cellSize + cellSize / 2;
    const centerY = head.y * cellSize + cellSize / 2;
    const eyeSize = cellSize / 8;
    const eyeOffset = cellSize / 4;
    
    ctx.fillStyle = '#000000';
    
    // Position eyes based on direction
    let eye1X, eye1Y, eye2X, eye2Y;
    
    switch (direction) {
      case 'up':
        eye1X = centerX - eyeOffset;
        eye1Y = centerY - eyeOffset;
        eye2X = centerX + eyeOffset;
        eye2Y = centerY - eyeOffset;
        break;
      case 'down':
        eye1X = centerX - eyeOffset;
        eye1Y = centerY + eyeOffset;
        eye2X = centerX + eyeOffset;
        eye2Y = centerY + eyeOffset;
        break;
      case 'left':
        eye1X = centerX - eyeOffset;
        eye1Y = centerY - eyeOffset;
        eye2X = centerX - eyeOffset;
        eye2Y = centerY + eyeOffset;
        break;
      case 'right':
        eye1X = centerX + eyeOffset;
        eye1Y = centerY - eyeOffset;
        eye2X = centerX + eyeOffset;
        eye2Y = centerY + eyeOffset;
        break;
      default:
        eye1X = centerX - eyeOffset;
        eye1Y = centerY;
        eye2X = centerX + eyeOffset;
        eye2Y = centerY;
    }
    
    // Draw eyes
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Renders the food with visual distinction
   * @param {Object} state - Current game state
   */
  function renderFood(state) {
    if (!state.food) return;
    
    // Render food as a red circle
    const centerX = state.food.x * cellSize + cellSize / 2;
    const centerY = state.food.y * cellSize + cellSize / 2;
    const radius = cellSize / 2.5;
    
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a highlight for visual appeal
    ctx.fillStyle = '#FF8A80';
    ctx.beginPath();
    ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Renders a single cell
   * @param {number} x - Cell x coordinate
   * @param {number} y - Cell y coordinate
   * @param {string} color - Fill color
   */
  function renderCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      x * cellSize + 1,
      y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );
  }
  
  /**
   * Updates the score display
   * @param {Object} state - Current game state
   */
  function updateScoreDisplay(state) {
    if (scoreDisplay) {
      scoreDisplay.textContent = state.score;
    }
  }
  
  /**
   * Shows the game over overlay with final score
   * @param {number} score - Final score
   */
  function showGameOver(score) {
    if (gameOverOverlay) {
      gameOverOverlay.style.display = 'flex';
    }
    
    if (finalScoreDisplay) {
      finalScoreDisplay.textContent = score;
    }
  }
  
  /**
   * Hides the game over overlay
   */
  function hideGameOver() {
    if (gameOverOverlay) {
      gameOverOverlay.style.display = 'none';
    }
  }
  
  /**
   * Shows the pause indicator
   */
  function showPauseIndicator() {
    if (pauseOverlay) {
      pauseOverlay.style.display = 'flex';
    }
  }
  
  /**
   * Hides the pause indicator
   */
  function hidePauseIndicator() {
    if (pauseOverlay) {
      pauseOverlay.style.display = 'none';
    }
  }
  
  /**
   * Cleans up the UI controller
   * Unsubscribes from state changes and removes elements
   */
  function destroy() {
    if (unsubscribe) {
      unsubscribe();
    }
    
    if (container) {
      container.innerHTML = '';
    }
  }
  
  return {
    init,
    render,
    showGameOver,
    showPauseIndicator,
    hidePauseIndicator,
    destroy
  };
}
