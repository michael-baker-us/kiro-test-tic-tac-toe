/**
 * UI Controller module for Tetris game
 * Handles all rendering and visual updates using HTML5 Canvas
 */

import { getPieceShape } from './pieceDefinitions.js';
import { calculateGhostPosition } from './gameLogic.js';

const CELL_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

/**
 * Creates a UI controller for the Tetris game
 * @param {Object} stateManager - The state manager instance
 * @param {HTMLElement} container - Container element for the game
 * @returns {Object} UI controller with methods to render and manage display
 */
export function createUIController(stateManager, container) {
  let canvas = null;
  let ctx = null;
  let nextPieceCanvas = null;
  let nextPieceCtx = null;
  let unsubscribe = null;
  
  // UI element references
  let scoreDisplay = null;
  let levelDisplay = null;
  let linesDisplay = null;
  let gameOverOverlay = null;
  let pauseOverlay = null;
  let finalScoreDisplay = null;
  
  /**
   * Initializes the UI controller
   * Sets up canvas and DOM elements
   */
  function init() {
    // Create HTML structure
    createHTMLStructure();
    
    // Get element references
    canvas = container.querySelector('#tetris-canvas');
    nextPieceCanvas = container.querySelector('#next-piece-canvas');
    scoreDisplay = container.querySelector('#tetris-score');
    levelDisplay = container.querySelector('#tetris-level');
    linesDisplay = container.querySelector('#tetris-lines');
    gameOverOverlay = container.querySelector('#tetris-game-over');
    pauseOverlay = container.querySelector('#tetris-pause-overlay');
    finalScoreDisplay = container.querySelector('#tetris-final-score');
    
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    // Get 2D rendering contexts
    ctx = canvas.getContext('2d');
    if (nextPieceCanvas) {
      nextPieceCtx = nextPieceCanvas.getContext('2d');
    }
    
    // Set up canvas dimensions
    canvas.width = BOARD_WIDTH * CELL_SIZE;
    canvas.height = BOARD_HEIGHT * CELL_SIZE;
    
    if (nextPieceCanvas) {
      nextPieceCanvas.width = 4 * CELL_SIZE;
      nextPieceCanvas.height = 4 * CELL_SIZE;
    }
    
    // Subscribe to state changes
    unsubscribe = stateManager.subscribe((state) => {
      render(state);
    });
    
    // Initial render
    render(stateManager.getState());
  }
  
  /**
   * Creates the HTML structure for the game
   */
  function createHTMLStructure() {
    container.innerHTML = `
      <div class="tetris-game">
        <div class="game-header">
          <h1>Tetris</h1>
        </div>
        
        <div class="tetris-main">
          <div class="tetris-board-container">
            <canvas id="tetris-canvas" class="game-canvas"></canvas>
          </div>
          
          <div class="tetris-sidebar">
            <div class="tetris-stats">
              <div class="stat-item">
                <span class="stat-label">Score</span>
                <span class="stat-value" id="tetris-score">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Level</span>
                <span class="stat-value" id="tetris-level">1</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Lines</span>
                <span class="stat-value" id="tetris-lines">0</span>
              </div>
            </div>
            
            <div class="tetris-next-piece">
              <h3>Next</h3>
              <canvas id="next-piece-canvas"></canvas>
            </div>
            
            <div class="tetris-controls">
              <p><strong>Controls:</strong></p>
              <p>← → : Move</p>
              <p>↑ X : Rotate CW</p>
              <p>Z : Rotate CCW</p>
              <p>↓ : Soft Drop</p>
              <p>Space : Hard Drop</p>
              <p>P/Esc : Pause</p>
              <p class="mobile-controls"><strong>Mobile:</strong></p>
              <p class="mobile-controls">Swipe: Move/Drop</p>
              <p class="mobile-controls">Tap: Rotate</p>
              <p class="mobile-controls">Double Tap: Hard Drop</p>
            </div>
          </div>
        </div>
        
        <div class="game-over-overlay" id="tetris-game-over" style="display: none;">
          <h2>Game Over!</h2>
          <p class="final-score">Final Score: <span id="tetris-final-score">0</span></p>
          <button id="tetris-play-again-btn" class="primary-btn">Play Again</button>
        </div>
        
        <div class="pause-overlay" id="tetris-pause-overlay" style="display: none;">
          <h2>Paused</h2>
          <p>Press P or Escape to continue</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Renders the complete game state
   * @param {Object} state - Current game state
   */
  function render(state) {
    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render game board with locked pieces
    renderBoard(state.board);
    
    // Render ghost piece
    if (state.currentPiece && state.gameStatus === 'playing') {
      const ghostY = calculateGhostPosition(state.board, state.currentPiece);
      renderGhostPiece(state.currentPiece, ghostY);
    }
    
    // Render current piece
    if (state.currentPiece) {
      renderCurrentPiece(state.currentPiece);
    }
    
    // Render next piece preview
    if (state.nextPiece) {
      renderNextPiece(state.nextPiece);
    }
    
    // Update stats display
    renderStats(state.score, state.level, state.linesCleared);
    
    // Handle overlays based on game status
    if (state.gameStatus === 'gameOver') {
      showGameOverScreen(state.score);
    } else {
      hideGameOverScreen();
    }
    
    if (state.gameStatus === 'paused') {
      showPauseScreen();
    } else {
      hidePauseScreen();
    }
  }
  
  /**
   * Renders the game board with locked pieces
   * @param {Array<Array<string|null>>} board - The game board
   */
  function renderBoard(board) {
    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(canvas.width, y * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw locked pieces
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (board[row][col] !== null) {
          renderCell(ctx, col, row, board[row][col]);
        }
      }
    }
  }
  
  /**
   * Renders the current piece
   * @param {Object} piece - Current piece {type, rotation, x, y, color}
   */
  function renderCurrentPiece(piece) {
    const shape = getPieceShape(piece.type, piece.rotation);
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (shape[row][col]) {
          const boardX = piece.x + col;
          const boardY = piece.y + row;
          
          // Only render if within visible board area
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            renderCell(ctx, boardX, boardY, piece.color);
          }
        }
      }
    }
  }
  
  /**
   * Renders the ghost piece
   * @param {Object} piece - Current piece {type, rotation, x, y, color}
   * @param {number} ghostY - Y position where piece would land
   */
  function renderGhostPiece(piece, ghostY) {
    const shape = getPieceShape(piece.type, piece.rotation);
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (shape[row][col]) {
          const boardX = piece.x + col;
          const boardY = ghostY + row;
          
          // Only render if within visible board area and not at current piece position
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            renderGhostCell(ctx, boardX, boardY, piece.color);
          }
        }
      }
    }
  }
  
  /**
   * Renders a single cell
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} x - Cell x coordinate
   * @param {number} y - Cell y coordinate
   * @param {string} color - Fill color
   */
  function renderCell(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(
      x * CELL_SIZE + 1,
      y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
    
    // Add highlight for 3D effect
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(
      x * CELL_SIZE + 2,
      y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      4
    );
  }
  
  /**
   * Renders a ghost cell (semi-transparent)
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} x - Cell x coordinate
   * @param {number} y - Cell y coordinate
   * @param {string} color - Fill color
   */
  function renderGhostCell(context, x, y, color) {
    // Draw outline only
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.strokeRect(
      x * CELL_SIZE + 2,
      y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );
  }
  
  /**
   * Renders the next piece preview
   * @param {Object} nextPiece - Next piece {type, color}
   */
  function renderNextPiece(nextPiece) {
    if (!nextPieceCtx) return;
    
    // Clear canvas
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    // Draw background
    nextPieceCtx.fillStyle = '#1a1a1a';
    nextPieceCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    // Get piece shape (rotation 0)
    const shape = getPieceShape(nextPiece.type, 0);
    
    // Center the piece in the preview
    let offsetX = 0;
    let offsetY = 0;
    
    // Adjust offset for different piece types to center them
    if (nextPiece.type === 'I') {
      offsetY = 0.5;
    } else if (nextPiece.type === 'O') {
      offsetX = 0.5;
      offsetY = 0.5;
    } else {
      offsetX = 0.5;
    }
    
    // Render the piece
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (shape[row][col]) {
          renderCell(nextPieceCtx, col + offsetX, row + offsetY, nextPiece.color);
        }
      }
    }
  }
  
  /**
   * Renders the stats display
   * @param {number} score - Current score
   * @param {number} level - Current level
   * @param {number} lines - Lines cleared
   */
  function renderStats(score, level, lines) {
    if (scoreDisplay) {
      scoreDisplay.textContent = score;
    }
    if (levelDisplay) {
      levelDisplay.textContent = level;
    }
    if (linesDisplay) {
      linesDisplay.textContent = lines;
    }
  }
  
  /**
   * Shows the pause screen
   */
  function showPauseScreen() {
    if (pauseOverlay) {
      pauseOverlay.style.display = 'flex';
    }
  }
  
  /**
   * Hides the pause screen
   */
  function hidePauseScreen() {
    if (pauseOverlay) {
      pauseOverlay.style.display = 'none';
    }
  }
  
  /**
   * Shows the game over screen with final score
   * @param {number} score - Final score
   */
  function showGameOverScreen(score) {
    if (gameOverOverlay) {
      gameOverOverlay.style.display = 'flex';
    }
    
    if (finalScoreDisplay) {
      finalScoreDisplay.textContent = score;
    }
  }
  
  /**
   * Hides the game over screen
   */
  function hideGameOverScreen() {
    if (gameOverOverlay) {
      gameOverOverlay.style.display = 'none';
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
    renderBoard,
    renderCurrentPiece,
    renderGhostPiece,
    renderNextPiece,
    renderStats,
    showPauseScreen,
    hidePauseScreen,
    showGameOverScreen,
    hideGameOverScreen,
    destroy
  };
}
