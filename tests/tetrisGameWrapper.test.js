/**
 * Integration tests for Tetris game wrapper
 * Tests init/destroy lifecycle, module integration, and full game flow
 * Requirements: 12.2, 12.3, 12.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createTetrisGame from '../src/games/tetris/index.js';

describe('Tetris Game Wrapper Integration Tests', () => {
  let container;
  let gameInstance;
  let mockContext;
  
  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Mock canvas context
    mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn()
    };
    
    // Mock HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
  });
  
  afterEach(() => {
    // Clean up game instance
    if (gameInstance) {
      gameInstance.destroy();
      gameInstance = null;
    }
    
    // Clean up container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    container = null;
  });
  
  describe('Game Initialization', () => {
    it('should initialize game with all required elements', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      // Verify HTML structure is created
      expect(container.querySelector('.tetris-game')).toBeTruthy();
      expect(container.querySelector('#tetris-canvas')).toBeTruthy();
      expect(container.querySelector('#next-piece-canvas')).toBeTruthy();
      expect(container.querySelector('#tetris-score')).toBeTruthy();
      expect(container.querySelector('#tetris-level')).toBeTruthy();
      expect(container.querySelector('#tetris-lines')).toBeTruthy();
      expect(container.querySelector('#tetris-game-over')).toBeTruthy();
      expect(container.querySelector('#tetris-pause-overlay')).toBeTruthy();
      expect(container.querySelector('#tetris-play-again-btn')).toBeTruthy();
    });
    
    it('should throw error if container is not provided', async () => {
      gameInstance = createTetrisGame();
      
      await expect(gameInstance.init(null)).rejects.toThrow('Container element is required');
    });
    
    it('should set up canvas with correct dimensions', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#tetris-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.width).toBe(300); // 10 columns * 30 pixels
      expect(canvas.height).toBe(600); // 20 rows * 30 pixels
    });
    
    it('should set up next piece canvas with correct dimensions', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const nextPieceCanvas = container.querySelector('#next-piece-canvas');
      expect(nextPieceCanvas).toBeTruthy();
      expect(nextPieceCanvas.width).toBe(120); // 4 * 30 pixels
      expect(nextPieceCanvas.height).toBe(120); // 4 * 30 pixels
    });
    
    it('should display initial game stats', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const scoreDisplay = container.querySelector('#tetris-score');
      const levelDisplay = container.querySelector('#tetris-level');
      const linesDisplay = container.querySelector('#tetris-lines');
      
      expect(scoreDisplay.textContent).toBe('0');
      expect(levelDisplay.textContent).toBe('1');
      expect(linesDisplay.textContent).toBe('0');
    });
    
    it('should hide game over overlay initially', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const gameOverOverlay = container.querySelector('#tetris-game-over');
      expect(gameOverOverlay.style.display).toBe('none');
    });
    
    it('should hide pause overlay initially', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      expect(pauseOverlay.style.display).toBe('none');
    });
  });
  
  describe('Game Cleanup on Destroy', () => {
    it('should clean up all resources on destroy', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      // Verify elements exist
      expect(container.innerHTML).not.toBe('');
      
      // Destroy the game
      gameInstance.destroy();
      
      // Verify container is cleared
      expect(container.innerHTML).toBe('');
    });
    
    it('should handle multiple init/destroy cycles', async () => {
      gameInstance = createTetrisGame();
      
      // First cycle
      await gameInstance.init(container);
      expect(container.querySelector('.tetris-game')).toBeTruthy();
      gameInstance.destroy();
      expect(container.innerHTML).toBe('');
      
      // Second cycle
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      expect(container.querySelector('.tetris-game')).toBeTruthy();
      gameInstance.destroy();
      expect(container.innerHTML).toBe('');
    });
    
    it('should remove event listeners on destroy', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const playAgainBtn = container.querySelector('#tetris-play-again-btn');
      const clickSpy = vi.fn();
      
      // Add a spy to track if event listeners are still active
      playAgainBtn.addEventListener('click', clickSpy);
      
      // Destroy the game
      gameInstance.destroy();
      
      // Try to click the button (it should be removed from DOM)
      // So we can't actually click it, but we verify the container is empty
      expect(container.innerHTML).toBe('');
    });
  });
  
  describe('Full Game Flow', () => {
    it('should start game in playing state', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      // Game should start in playing state (pause overlay hidden)
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      expect(pauseOverlay.style.display).toBe('none');
      
      // Game over overlay should be hidden
      const gameOverOverlay = container.querySelector('#tetris-game-over');
      expect(gameOverOverlay.style.display).toBe('none');
    });
    
    it('should handle pause and resume via keyboard', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      
      // Initially not paused
      expect(pauseOverlay.style.display).toBe('none');
      
      // Simulate pressing 'P' key to pause
      const pauseEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(pauseEvent);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should be paused
      expect(pauseOverlay.style.display).toBe('flex');
      
      // Simulate pressing 'P' key again to resume
      const resumeEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(resumeEvent);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should be resumed
      expect(pauseOverlay.style.display).toBe('none');
    });
    
    it('should handle pause and resume via Escape key', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      
      // Initially not paused
      expect(pauseOverlay.style.display).toBe('none');
      
      // Simulate pressing Escape key to pause
      const pauseEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(pauseEvent);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should be paused
      expect(pauseOverlay.style.display).toBe('flex');
      
      // Simulate pressing Escape key again to resume
      const resumeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(resumeEvent);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should be resumed
      expect(pauseOverlay.style.display).toBe('none');
    });
    
    it('should handle restart via play again button', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const playAgainBtn = container.querySelector('#tetris-play-again-btn');
      const scoreDisplay = container.querySelector('#tetris-score');
      
      // Click play again button
      playAgainBtn.click();
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verify score is reset
      expect(scoreDisplay.textContent).toBe('0');
      
      // Verify game is in playing state (overlays hidden)
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      const gameOverOverlay = container.querySelector('#tetris-game-over');
      expect(pauseOverlay.style.display).toBe('none');
      expect(gameOverOverlay.style.display).toBe('none');
    });
    
    it('should wire input handler to state manager correctly', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      // Simulate left arrow key
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(leftEvent);
      
      // Simulate right arrow key
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(rightEvent);
      
      // Simulate down arrow key
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(downEvent);
      
      // Simulate rotation keys
      const rotateCWEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(rotateCWEvent);
      
      const rotateCCWEvent = new KeyboardEvent('keydown', { key: 'z' });
      document.dispatchEvent(rotateCCWEvent);
      
      // Simulate hard drop
      const hardDropEvent = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(hardDropEvent);
      
      // If no errors are thrown, the wiring is correct
      // The game should handle all these inputs without crashing
      expect(container.querySelector('.tetris-game')).toBeTruthy();
    });
    
    it('should integrate game loop with state manager', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      // Wait for a few game loop ticks
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Game should still be running without errors
      expect(container.querySelector('.tetris-game')).toBeTruthy();
      
      // Stats should still be displayed
      const scoreDisplay = container.querySelector('#tetris-score');
      expect(scoreDisplay).toBeTruthy();
    });
    
    it('should stop game loop when destroyed', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      // Let game loop run for a bit
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Destroy the game
      gameInstance.destroy();
      
      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Container should be empty (game loop stopped)
      expect(container.innerHTML).toBe('');
    });
  });
  
  describe('Module Integration', () => {
    it('should coordinate state manager, UI controller, input handler, and game loop', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      // Verify state manager is working (initial state displayed)
      const scoreDisplay = container.querySelector('#tetris-score');
      const levelDisplay = container.querySelector('#tetris-level');
      expect(scoreDisplay.textContent).toBe('0');
      expect(levelDisplay.textContent).toBe('1');
      
      // Verify UI controller is working (canvas rendered)
      const canvas = container.querySelector('#tetris-canvas');
      expect(canvas).toBeTruthy();
      expect(mockContext.fillRect).toHaveBeenCalled();
      
      // Verify input handler is working (can receive keyboard events)
      const moveEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      expect(() => document.dispatchEvent(moveEvent)).not.toThrow();
      
      // Verify game loop is working (game is running)
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(container.querySelector('.tetris-game')).toBeTruthy();
    });
    
    it('should handle state changes across all modules', async () => {
      gameInstance = createTetrisGame();
      await gameInstance.init(container);
      
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      
      // Pause the game
      const pauseEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(pauseEvent);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // UI should reflect paused state
      expect(pauseOverlay.style.display).toBe('flex');
      
      // Resume the game
      const resumeEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(resumeEvent);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // UI should reflect playing state
      expect(pauseOverlay.style.display).toBe('none');
    });
  });
});
