/**
 * UI Controller module for Flappy Bird game
 * Handles all rendering and visual updates using HTML5 Canvas
 * Requirements: 6.3, 8.1, 4.3, 4.4, 5.1, 7.1, 7.2, 8.2
 */

import { CONFIG } from './config.js';

/**
 * Creates a UI controller for the Flappy Bird game
 * @param {Object} stateManager - The state manager instance
 * @param {HTMLElement} container - Container element for the game
 * @param {Object} config - Game configuration (defaults to CONFIG)
 * @returns {Object} UI controller with methods to render and manage display
 */
export function createUIController(stateManager, container, config = CONFIG) {
  let canvas = null;
  let ctx = null;
  let unsubscribe = null;
  let resizeHandler = null;
  
  /**
   * Initializes the UI controller
   * Sets up canvas and rendering
   * Requirement 6.3, 8.1: Create and configure canvas, set up responsive sizing
   */
  function init() {
    // Create canvas element
    canvas = document.createElement('canvas');
    canvas.id = 'flappy-bird-canvas';
    canvas.className = 'game-canvas';
    
    // Get 2D rendering context
    ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    
    // Set up responsive canvas sizing
    setupCanvas();
    
    // Add canvas to container
    container.appendChild(canvas);
    
    // Subscribe to state changes for rendering
    unsubscribe = stateManager.subscribe((state) => {
      render(state);
    });
    
    // Handle window resize events for responsive sizing
    // Requirement 8.2: Handle window resize events
    resizeHandler = () => {
      setupCanvas();
      render(stateManager.getState());
    };
    window.addEventListener('resize', resizeHandler);
    
    // Initial render
    render(stateManager.getState());
    
    // Return the canvas element so input handler can attach to it
    return canvas;
  }
  
  /**
   * Sets up canvas dimensions for responsive sizing
   * Requirement 6.3: Set up responsive canvas sizing for mobile
   */
  function setupCanvas() {
    const containerWidth = container.clientWidth || 400;
    const containerHeight = container.clientHeight || 600;
    
    // Calculate canvas size to fit container while maintaining aspect ratio
    const aspectRatio = config.canvasWidth / config.canvasHeight;
    let canvasWidth = Math.min(containerWidth - 40, 400); // Max 400px width
    let canvasHeight = canvasWidth / aspectRatio;
    
    // Adjust if height is too large
    if (canvasHeight > containerHeight - 100) {
      canvasHeight = containerHeight - 100;
      canvasWidth = canvasHeight * aspectRatio;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Store scale factor for rendering calculations
    canvas.scaleX = canvasWidth / config.canvasWidth;
    canvas.scaleY = canvasHeight / config.canvasHeight;
  }
  
  /**
   * Renders the complete game state
   * Requirement 4.3, 4.4, 5.1, 7.1, 7.2: Render all game elements
   * @param {Object} state - Current game state
   */
  function render(state) {
    if (!ctx || !canvas) return;
    
    // Clear canvas
    clearCanvas();
    
    // Render based on game status
    if (state.gameStatus === config.GAME_STATES.MENU) {
      renderStartMenu(state);
    } else if (state.gameStatus === config.GAME_STATES.GAME_OVER) {
      renderGameplay(state);
      renderGameOver(state);
    } else {
      renderGameplay(state);
    }
  }
  
  /**
   * Clears the canvas
   * Requirement 8.2: Clear canvas on state changes
   */
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  /**
   * Renders the start menu with instructions
   * Requirement 5.1, 4.4: Display start menu with instructions and readable font
   */
  function renderStartMenu(state) {
    // Draw background
    drawBackground();
    
    // Draw title with shadow and gradient
    const titleX = canvas.width / 2;
    const titleY = canvas.height / 3;
    
    // Title shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `bold ${scale(56)}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Flappy Bird', titleX + scale(3), titleY + scale(3));
    
    // Title outline
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = scale(6);
    ctx.strokeText('Flappy Bird', titleX, titleY);
    
    // Title gradient
    const titleGradient = ctx.createLinearGradient(titleX, titleY - scale(28), titleX, titleY + scale(28));
    titleGradient.addColorStop(0, '#FFD54F');
    titleGradient.addColorStop(1, '#FFA726');
    ctx.fillStyle = titleGradient;
    ctx.fillText('Flappy Bird', titleX, titleY);
    
    // Draw bird icon next to title (if scale is supported)
    if (ctx.scale) {
      ctx.save();
      ctx.translate(titleX - scale(120), titleY);
      ctx.scale(1.2, 1.2);
      drawBirdIcon();
      ctx.restore();
    }
    
    // Draw instructions with better styling
    const instructY = canvas.height / 2;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${scale(24)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText('Click or Tap to Start', titleX, instructY);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${scale(18)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText('Click/Tap to Flap', titleX, instructY + scale(40));
    
    // Draw high score if exists
    if (state.highScore > 0) {
      const hsY = canvas.height * 0.7;
      
      // High score background
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.fillRect(titleX - scale(80), hsY - scale(15), scale(160), scale(30));
      
      // High score text
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${scale(20)}px 'Segoe UI', Arial, sans-serif`;
      ctx.fillText(`High Score: ${state.highScore}`, titleX, hsY);
    }
  }
  
  /**
   * Draws a small bird icon for decoration
   */
  function drawBirdIcon() {
    const radius = scale(15);
    
    // Body
    const gradient = ctx.createRadialGradient(-scale(2), -scale(2), 0, 0, 0, radius);
    gradient.addColorStop(0, '#FFD54F');
    gradient.addColorStop(1, '#FFA726');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(scale(5), -scale(3), scale(3), 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(radius + scale(8), -scale(2));
    ctx.lineTo(radius + scale(8), scale(2));
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Renders the gameplay view (bird, pipes, score)
   */
  function renderGameplay(state) {
    // Draw background
    drawBackground();
    
    // Draw pipes
    drawPipes(state.pipes);
    
    // Draw bird with rotation
    // Requirements 7.1, 7.2: Display rotation animation based on velocity
    drawBird(state.bird);
    
    // Display score during gameplay
    // Requirement 4.3: Display current score
    drawScore(state.score);
  }
  
  /**
   * Renders the game over screen with final score
   * Requirement 4.4: Display final score with readable font on game over screen
   */
  function renderGameOver(state) {
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const titleY = canvas.height / 3;
    
    // Draw game over text with dramatic styling
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = `bold ${scale(56)}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', centerX + scale(3), titleY + scale(3));
    
    // Outline
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = scale(5);
    ctx.strokeText('Game Over', centerX, titleY);
    
    // Main text with gradient
    const gameOverGradient = ctx.createLinearGradient(centerX, titleY - scale(28), centerX, titleY + scale(28));
    gameOverGradient.addColorStop(0, '#FF5252');
    gameOverGradient.addColorStop(1, '#D32F2F');
    ctx.fillStyle = gameOverGradient;
    ctx.fillText('Game Over', centerX, titleY);
    
    // Score panel background
    const panelY = canvas.height / 2 - scale(20);
    const panelHeight = scale(100);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(centerX - scale(120), panelY, scale(240), panelHeight);
    
    // Score panel border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = scale(2);
    ctx.strokeRect(centerX - scale(120), panelY, scale(240), panelHeight);
    
    // Draw final score
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `${scale(20)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText('Score', centerX, panelY + scale(25));
    
    // Score value with gradient
    const scoreGradient = ctx.createLinearGradient(centerX, panelY + scale(40), centerX, panelY + scale(70));
    scoreGradient.addColorStop(0, '#FFF9C4');
    scoreGradient.addColorStop(1, '#FFD54F');
    ctx.fillStyle = scoreGradient;
    ctx.font = `bold ${scale(32)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText(state.score.toString(), centerX, panelY + scale(55));
    
    // Draw high score if exists
    if (state.highScore > 0) {
      const hsY = canvas.height / 2 + scale(60);
      
      // Check if new high score
      const isNewHighScore = state.score === state.highScore && state.score > 0;
      
      if (isNewHighScore) {
        // New high score indicator
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${scale(18)}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillText('★ NEW HIGH SCORE! ★', centerX, hsY);
      } else {
        // Regular high score display
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.font = `${scale(18)}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillText(`High Score: ${state.highScore}`, centerX, hsY);
      }
    }
    
    // Draw restart instruction with pulsing effect
    const restartY = canvas.height * 0.75;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${scale(20)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText('Click or Tap to Restart', centerX, restartY);
  }
  
  /**
   * Draws the background with enhanced gradient
   * Requirement 4.3, 4.4: Add background color or gradient
   */
  function drawBackground() {
    // Sky gradient - vibrant blue sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4FC3F7');  // Bright sky blue at top
    gradient.addColorStop(0.5, '#81D4FA'); // Light blue in middle
    gradient.addColorStop(1, '#B3E5FC');   // Very light blue at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some clouds for visual interest
    drawClouds();
  }
  
  /**
   * Draws decorative clouds in the background
   */
  function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    // Cloud 1
    drawCloud(scaleX(80), scaleY(60), scale(40));
    
    // Cloud 2
    drawCloud(scaleX(250), scaleY(120), scale(50));
    
    // Cloud 3
    drawCloud(scaleX(150), scaleY(200), scale(35));
  }
  
  /**
   * Draws a single cloud
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Cloud size
   */
  function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size * 0.9, 0, Math.PI * 2);
    ctx.arc(x + size * 2, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draws the bird with rotation based on velocity
   * Requirements 7.1, 7.2, 4.3: Draw bird sprite with color and shape
   * @param {Object} bird - Bird state object
   */
  function drawBird(bird) {
    ctx.save();
    
    // Translate to bird position
    const x = scaleX(bird.x + bird.width / 2);
    const y = scaleY(bird.y + bird.height / 2);
    ctx.translate(x, y);
    
    // Rotate based on bird rotation
    ctx.rotate((bird.rotation * Math.PI) / 180);
    
    // Draw bird as a stylized character
    const radius = scale(bird.width / 2);
    
    // Wing (behind body) - use ellipse if available, otherwise skip
    if (ctx.ellipse) {
      ctx.fillStyle = '#FFA726';
      ctx.beginPath();
      ctx.ellipse(-scale(3), scale(2), scale(8), scale(5), -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Body - gradient for depth (if supported)
    if (ctx.createRadialGradient) {
      const bodyGradient = ctx.createRadialGradient(
        -scale(2), -scale(2), 0,
        0, 0, radius
      );
      bodyGradient.addColorStop(0, '#FFD54F');
      bodyGradient.addColorStop(1, '#FFA726');
      ctx.fillStyle = bodyGradient;
    } else {
      ctx.fillStyle = '#FFD700';
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Body outline
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = scale(2);
    ctx.stroke();
    
    // Belly patch - use ellipse if available
    if (ctx.ellipse) {
      ctx.fillStyle = '#FFF9C4';
      ctx.beginPath();
      ctx.ellipse(scale(2), scale(3), scale(8), scale(10), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Eye white
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(scale(6), -scale(4), scale(5), 0, Math.PI * 2);
    ctx.fill();
    
    // Eye outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = scale(1);
    ctx.stroke();
    
    // Pupil
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(scale(7), -scale(4), scale(3), 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(scale(8), -scale(5), scale(1.5), 0, Math.PI * 2);
    ctx.fill();
    
    // Beak - more detailed
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.moveTo(radius, scale(1));
    ctx.lineTo(radius + scale(12), -scale(2));
    ctx.lineTo(radius + scale(12), scale(4));
    ctx.closePath();
    ctx.fill();
    
    // Beak outline
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = scale(1.5);
    ctx.stroke();
    
    // Beak detail line
    ctx.strokeStyle = '#BF360C';
    ctx.lineWidth = scale(1);
    ctx.beginPath();
    ctx.moveTo(radius, scale(1));
    ctx.lineTo(radius + scale(12), scale(1));
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Draws pipes with gaps and consistent styling
   * Requirement 4.3: Draw pipes with consistent styling
   * @param {Array} pipes - Array of pipe objects
   */
  function drawPipes(pipes) {
    pipes.forEach(pipe => {
      const x = scaleX(pipe.x);
      const width = scale(pipe.width);
      const gapTop = scaleY(pipe.gapY - pipe.gapHeight / 2);
      const gapBottom = scaleY(pipe.gapY + pipe.gapHeight / 2);
      
      // Draw top pipe
      drawPipe(x, 0, width, gapTop, true);
      
      // Draw bottom pipe
      drawPipe(x, gapBottom, width, canvas.height - gapBottom, false);
    });
  }
  
  /**
   * Draws a single pipe with detailed styling
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Pipe width
   * @param {number} height - Pipe height
   * @param {boolean} isTop - Whether this is a top pipe
   */
  function drawPipe(x, y, width, height, isTop) {
    // Main pipe body with gradient
    const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
    gradient.addColorStop(0, '#2E7D32');
    gradient.addColorStop(0.5, '#43A047');
    gradient.addColorStop(1, '#2E7D32');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Pipe highlights for 3D effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + scale(3), y, scale(4), height);
    
    // Pipe shadows for 3D effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + width - scale(6), y, scale(4), height);
    
    // Pipe outline
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = scale(2);
    ctx.strokeRect(x, y, width, height);
    
    // Pipe cap
    const capHeight = scale(24);
    const capWidth = width + scale(8);
    const capX = x - scale(4);
    const capY = isTop ? y + height - capHeight : y;
    
    // Cap gradient
    const capGradient = ctx.createLinearGradient(capX, 0, capX + capWidth, 0);
    capGradient.addColorStop(0, '#388E3C');
    capGradient.addColorStop(0.5, '#4CAF50');
    capGradient.addColorStop(1, '#388E3C');
    ctx.fillStyle = capGradient;
    ctx.fillRect(capX, capY, capWidth, capHeight);
    
    // Cap highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(capX + scale(3), capY + scale(2), scale(5), capHeight - scale(4));
    
    // Cap shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(capX + capWidth - scale(7), capY + scale(2), scale(4), capHeight - scale(4));
    
    // Cap outline
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = scale(2.5);
    ctx.strokeRect(capX, capY, capWidth, capHeight);
    
    // Cap inner border for depth
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = scale(1);
    ctx.strokeRect(capX + scale(2), capY + scale(2), capWidth - scale(4), capHeight - scale(4));
  }
  
  /**
   * Draws the score with readable font
   * Requirement 4.3, 4.4: Display score with readable font
   * @param {number} score - Current score
   */
  function drawScore(score) {
    const text = score.toString();
    const x = canvas.width / 2;
    const y = scale(30);
    
    // Shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `bold ${scale(48)}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x + scale(2), y + scale(2));
    
    // Outline for contrast
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = scale(5);
    ctx.strokeText(text, x, y);
    
    // Main score text with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + scale(48));
    gradient.addColorStop(0, '#FFF9C4');
    gradient.addColorStop(1, '#FFD54F');
    ctx.fillStyle = gradient;
    ctx.fillText(text, x, y);
    
    // Inner highlight
    ctx.strokeStyle = '#FFEB3B';
    ctx.lineWidth = scale(2);
    ctx.strokeText(text, x, y);
  }
  
  /**
   * Scales a value based on canvas scale factor
   * @param {number} value - Value to scale
   * @returns {number} Scaled value
   */
  function scale(value) {
    return value * Math.min(canvas.scaleX || 1, canvas.scaleY || 1);
  }
  
  /**
   * Scales X coordinate
   * @param {number} x - X coordinate
   * @returns {number} Scaled X coordinate
   */
  function scaleX(x) {
    return x * (canvas.scaleX || 1);
  }
  
  /**
   * Scales Y coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Scaled Y coordinate
   */
  function scaleY(y) {
    return y * (canvas.scaleY || 1);
  }
  
  /**
   * Cleans up the UI controller
   * Requirement 8.2: Remove canvas and listeners
   */
  function destroy() {
    // Unsubscribe from state changes
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    
    // Remove resize listener
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    
    // Remove canvas from DOM
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    
    canvas = null;
    ctx = null;
  }
  
  return {
    init,
    render,
    destroy
  };
}
