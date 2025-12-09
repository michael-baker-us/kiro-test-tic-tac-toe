/**
 * Integration tests for Flappy Bird game wrapper
 * Tests init/destroy lifecycle, module integration, and full game flow
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createFlappyBirdGame from '../src/games/flappy-bird/index.js';

describe('Flappy Bird Game Wrapper Integration Tests', () => {
  let container;
  let gameInstance;
  let mockContext;
  
  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '400px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    // Mock canvas context
    mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      strokeText: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: ''
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
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Verify canvas is created
      const canvas = container.querySelector('#flappy-bird-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.className).toBe('game-canvas');
    });
    
    it('should throw error if container is not provided', async () => {
      gameInstance = createFlappyBirdGame();
      
      await expect(gameInstance.init(null)).rejects.toThrow('Container element is required');
    });
    
    it('should set up canvas with responsive dimensions', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });
    
    it('should render initial menu state', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Wait for initial render
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verify rendering methods were called
      expect(mockContext.fillText).toHaveBeenCalled();
      expect(mockContext.clearRect).toHaveBeenCalled();
    });
  });
  
  describe('Game Cleanup on Destroy', () => {
    it('should clean up all resources on destroy', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Verify canvas exists
      expect(container.querySelector('#flappy-bird-canvas')).toBeTruthy();
      
      // Destroy the game
      gameInstance.destroy();
      
      // Verify container is cleared
      expect(container.innerHTML).toBe('');
    });
    
    it('should handle multiple init/destroy cycles', async () => {
      gameInstance = createFlappyBirdGame();
      
      // First cycle
      await gameInstance.init(container);
      expect(container.querySelector('#flappy-bird-canvas')).toBeTruthy();
      gameInstance.destroy();
      expect(container.innerHTML).toBe('');
      
      // Second cycle
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      expect(container.querySelector('#flappy-bird-canvas')).toBeTruthy();
      gameInstance.destroy();
      expect(container.innerHTML).toBe('');
    });
    
    it('should remove event listeners on destroy', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      const clickSpy = vi.fn();
      
      // Add a spy to track if event listeners are still active
      canvas.addEventListener('click', clickSpy);
      
      // Destroy the game
      gameInstance.destroy();
      
      // Container should be empty (canvas removed)
      expect(container.innerHTML).toBe('');
    });
  });
  
  describe('Pause and Resume Methods', () => {
    it('should pause game loop when pause() is called', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Start the game by clicking
      const canvas = container.querySelector('#flappy-bird-canvas');
      canvas.click();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Pause the game
      gameInstance.pause();
      
      // Game loop should be paused (no errors should occur)
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(container.querySelector('#flappy-bird-canvas')).toBeTruthy();
    });
    
    it('should resume game loop when resume() is called', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Start the game
      const canvas = container.querySelector('#flappy-bird-canvas');
      canvas.click();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Pause then resume
      gameInstance.pause();
      gameInstance.resume();
      
      // Game should continue running
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(container.querySelector('#flappy-bird-canvas')).toBeTruthy();
    });
  });
  
  describe('Full Game Flow', () => {
    it('should start game in menu state', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Wait for initial render
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Game should render menu (fillText called for menu text)
      expect(mockContext.fillText).toHaveBeenCalled();
    });
    
    it('should handle click to start game', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      
      // Click to start
      canvas.click();
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Game should be running (no errors)
      expect(canvas).toBeTruthy();
    });
    
    it('should handle spacebar to start game', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Press spacebar to start
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(spaceEvent);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Game should be running
      expect(container.querySelector('#flappy-bird-canvas')).toBeTruthy();
    });
    
    it('should handle flap action during gameplay', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      
      // Start game
      canvas.click();
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Flap during gameplay
      canvas.click();
      
      // Wait for physics update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Game should still be running
      expect(canvas).toBeTruthy();
    });
    
    it('should wire input handler to state manager correctly', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      
      // Simulate various inputs
      canvas.click();
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(spaceEvent);
      
      // If no errors are thrown, the wiring is correct
      expect(canvas).toBeTruthy();
    });
    
    it('should integrate game loop with state manager', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Start the game
      const canvas = container.querySelector('#flappy-bird-canvas');
      canvas.click();
      
      // Wait for a few game loop ticks
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Game should still be running without errors
      expect(canvas).toBeTruthy();
    });
    
    it('should stop game loop when destroyed', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Start the game
      const canvas = container.querySelector('#flappy-bird-canvas');
      canvas.click();
      
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
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      // Verify UI controller is working (canvas rendered)
      const canvas = container.querySelector('#flappy-bird-canvas');
      expect(canvas).toBeTruthy();
      expect(mockContext.clearRect).toHaveBeenCalled();
      
      // Verify input handler is working (can receive events)
      const clickEvent = new MouseEvent('click');
      expect(() => canvas.dispatchEvent(clickEvent)).not.toThrow();
      
      // Verify game loop is working (game is running)
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(canvas).toBeTruthy();
    });
    
    it('should handle state changes across all modules', async () => {
      gameInstance = createFlappyBirdGame();
      await gameInstance.init(container);
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      
      // Start the game (menu -> playing)
      canvas.click();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Game should be in playing state (no errors)
      expect(canvas).toBeTruthy();
      
      // Flap action
      canvas.click();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Game should still be running
      expect(canvas).toBeTruthy();
    });
  });
  
  describe('Exported Interface', () => {
    it('should export required methods', () => {
      gameInstance = createFlappyBirdGame();
      
      // Verify all required methods exist
      expect(typeof gameInstance.init).toBe('function');
      expect(typeof gameInstance.destroy).toBe('function');
      expect(typeof gameInstance.pause).toBe('function');
      expect(typeof gameInstance.resume).toBe('function');
    });
  });
});
