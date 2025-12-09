/**
 * Integration tests for Snake game wrapper
 * Tests init/destroy lifecycle, module integration, responsive sizing, and mobile detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createSnakeGame from '../src/games/snake/index.js';

describe('Snake Game Wrapper Integration Tests', () => {
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
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn()
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
  
  describe('Init and Destroy Lifecycle', () => {
    it('should initialize game with all required elements', async () => {
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      // Verify HTML structure is created
      expect(container.querySelector('.snake-game')).toBeTruthy();
      expect(container.querySelector('#game-canvas')).toBeTruthy();
      expect(container.querySelector('#score')).toBeTruthy();
      expect(container.querySelector('#pause-btn')).toBeTruthy();
      expect(container.querySelector('#restart-btn')).toBeTruthy();
      expect(container.querySelector('#game-over')).toBeTruthy();
      expect(container.querySelector('#pause-overlay')).toBeTruthy();
      expect(container.querySelector('#mobile-instructions')).toBeTruthy();
    });
    
    it('should throw error if container is not provided', async () => {
      gameInstance = createSnakeGame();
      
      await expect(gameInstance.init(null)).rejects.toThrow('Container element is required');
    });
    
    it('should clean up all resources on destroy', async () => {
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      // Verify elements exist
      expect(container.innerHTML).not.toBe('');
      
      // Destroy the game
      gameInstance.destroy();
      
      // Verify container is cleared
      expect(container.innerHTML).toBe('');
    });
    
    it('should handle multiple init/destroy cycles', async () => {
      gameInstance = createSnakeGame();
      
      // First cycle
      await gameInstance.init(container);
      expect(container.querySelector('.snake-game')).toBeTruthy();
      gameInstance.destroy();
      expect(container.innerHTML).toBe('');
      
      // Second cycle
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      expect(container.querySelector('.snake-game')).toBeTruthy();
      gameInstance.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
  
  describe('Module Integration', () => {
    it('should wire together all modules correctly', async () => {
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      // Verify canvas is set up (UI controller)
      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
      
      // Verify initial score is displayed
      const scoreDisplay = container.querySelector('#score');
      expect(scoreDisplay.textContent).toBe('0');
      
      // Verify game over overlay is hidden initially
      const gameOverOverlay = container.querySelector('#game-over');
      expect(gameOverOverlay.style.display).toBe('none');
      
      // Verify pause overlay is hidden initially
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('none');
    });
    
    it('should handle pause button clicks', async () => {
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const pauseBtn = container.querySelector('#pause-btn');
      expect(pauseBtn).toBeTruthy();
      
      // Click pause button
      pauseBtn.click();
      
      // Verify pause overlay is shown
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('flex');
      
      // Verify button text changes
      expect(pauseBtn.textContent).toBe('Resume');
      
      // Click resume button
      pauseBtn.click();
      
      // Verify pause overlay is hidden
      expect(pauseOverlay.style.display).toBe('none');
      
      // Verify button text changes back
      expect(pauseBtn.textContent).toBe('Pause');
    });
    
    it('should handle restart button clicks', async () => {
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const restartBtn = container.querySelector('#restart-btn');
      expect(restartBtn).toBeTruthy();
      
      // Click restart button
      restartBtn.click();
      
      // Verify score is reset
      const scoreDisplay = container.querySelector('#score');
      expect(scoreDisplay.textContent).toBe('0');
      
      // Verify game is in playing state (pause overlay hidden)
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('none');
    });
    
    it('should handle play again button clicks', async () => {
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const playAgainBtn = container.querySelector('#play-again-btn');
      expect(playAgainBtn).toBeTruthy();
      
      // Click play again button
      playAgainBtn.click();
      
      // Verify score is reset
      const scoreDisplay = container.querySelector('#score');
      expect(scoreDisplay.textContent).toBe('0');
      
      // Verify game over overlay is hidden
      const gameOverOverlay = container.querySelector('#game-over');
      expect(gameOverOverlay.style.display).toBe('none');
    });
  });
  
  describe('Responsive Board Sizing', () => {
    it('should create board with desktop dimensions on desktop', async () => {
      // Mock desktop user agent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        configurable: true
      });
      
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#game-canvas');
      
      // Desktop should have 20x20 board
      // Canvas dimensions should be equal (square board)
      expect(canvas.width).toBe(canvas.height);
      
      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
    
    it('should create board with mobile dimensions on mobile portrait', async () => {
      // Mock mobile user agent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true
      });
      
      // Mock portrait orientation (height > width)
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 667,
        configurable: true
      });
      
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#game-canvas');
      
      // Mobile portrait should have 15x20 board (narrower, taller)
      // Canvas height should be greater than width
      expect(canvas.height).toBeGreaterThan(canvas.width);
      
      // Restore original values
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        configurable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: originalInnerHeight,
        configurable: true
      });
    });
    
    it('should create board with mobile dimensions on mobile landscape', async () => {
      // Mock mobile user agent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true
      });
      
      // Mock landscape orientation (width > height)
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;
      Object.defineProperty(window, 'innerWidth', {
        value: 667,
        configurable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 375,
        configurable: true
      });
      
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#game-canvas');
      
      // Mobile landscape should have 20x15 board (wider, shorter)
      // Canvas width should be greater than height
      expect(canvas.width).toBeGreaterThan(canvas.height);
      
      // Restore original values
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        configurable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: originalInnerHeight,
        configurable: true
      });
    });
  });
  
  describe('Mobile Detection', () => {
    it('should show mobile instructions on mobile devices', async () => {
      // Mock mobile user agent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true
      });
      
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const mobileInstructions = container.querySelector('#mobile-instructions');
      expect(mobileInstructions).toBeTruthy();
      expect(mobileInstructions.style.display).toBe('block');
      
      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
    
    it('should hide mobile instructions on desktop', async () => {
      // Mock desktop user agent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        configurable: true
      });
      
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      const mobileInstructions = container.querySelector('#mobile-instructions');
      expect(mobileInstructions).toBeTruthy();
      expect(mobileInstructions.style.display).toBe('none');
      
      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
    
    it('should enable touch controls on mobile devices', async () => {
      // Mock mobile user agent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Android; Mobile) AppleWebKit/537.36',
        configurable: true
      });
      
      gameInstance = createSnakeGame();
      await gameInstance.init(container);
      
      // Touch controls should be enabled (we can't directly test this,
      // but we can verify the game initializes without errors on mobile)
      expect(container.querySelector('.snake-game')).toBeTruthy();
      
      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });
});
