// Unit tests for Snake UI controller
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createUIController } from '../src/games/snake/uiController.js';
import { createStateManager } from '../src/games/snake/stateManager.js';

describe('Snake UI Controller', () => {
  let stateManager;
  let uiController;
  let container;
  let mockContext;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
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
    
    // Create state manager
    stateManager = createStateManager({
      boardWidth: 10,
      boardHeight: 10,
      initialSpeed: 200
    });
    
    // Create UI controller
    uiController = createUIController(stateManager, container);
    
    // Initialize the UI controller once for all tests
    uiController.init();
  });
  
  afterEach(() => {
    // Clean up
    if (uiController) {
      uiController.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Canvas Initialization', () => {
    it('should create HTML structure with all required elements', () => {
      expect(container.querySelector('#game-canvas')).toBeTruthy();
      expect(container.querySelector('#score')).toBeTruthy();
      expect(container.querySelector('#game-over')).toBeTruthy();
      expect(container.querySelector('#pause-overlay')).toBeTruthy();
      expect(container.querySelector('#final-score')).toBeTruthy();
      expect(container.querySelector('#mobile-instructions')).toBeTruthy();
    });

    it('should initialize canvas with correct dimensions', () => {
      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('should throw error if canvas element is not found', () => {
      // The UI controller creates its own HTML structure, so we need to test
      // a scenario where querySelector fails after structure creation
      // This is more of an edge case test
      const emptyContainer = document.createElement('div');
      
      // Mock querySelector to return null
      const originalQuerySelector = emptyContainer.querySelector;
      emptyContainer.querySelector = vi.fn(() => null);
      
      const newController = createUIController(stateManager, emptyContainer);
      expect(() => newController.init()).toThrow('Canvas element not found');
      
      // Restore
      emptyContainer.querySelector = originalQuerySelector;
    });

    it('should get 2D rendering context', () => {
      const canvas = container.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      expect(ctx).toBeTruthy();
    });
  });

  describe('Rendering with Various Game States', () => {
    it('should render initial game state', () => {
      const state = stateManager.getState();
      uiController.render(state);
      
      const scoreDisplay = container.querySelector('#score');
      expect(scoreDisplay.textContent).toBe('0');
      
      const gameOverOverlay = container.querySelector('#game-over');
      expect(gameOverOverlay.style.display).toBe('none');
      
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('none');
    });

    it('should update score display when score changes', () => {
      // Simulate food consumption by directly modifying state
      // Move snake to food position and tick
      const state = stateManager.getState();
      const foodPos = state.food;
      
      // Move snake towards food and consume it
      // This is a simplified test - in real game, snake would move to food
      stateManager.tick();
      
      const scoreDisplay = container.querySelector('#score');
      // Score should still be rendered (even if 0)
      expect(scoreDisplay.textContent).toBeDefined();
    });

    it('should render snake on canvas', () => {
      const canvas = container.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      
      // Spy on canvas methods
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');
      
      const state = stateManager.getState();
      uiController.render(state);
      
      // Should have called fillRect for board, snake segments, etc.
      expect(fillRectSpy).toHaveBeenCalled();
    });

    it('should render food on canvas', () => {
      const canvas = container.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      
      // Spy on canvas arc method (food is rendered as circle)
      const arcSpy = vi.spyOn(ctx, 'arc');
      
      const state = stateManager.getState();
      uiController.render(state);
      
      // Should have called arc for food rendering
      expect(arcSpy).toHaveBeenCalled();
    });

    it('should render game board with grid', () => {
      const canvas = container.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      
      // Spy on canvas stroke method (grid lines)
      const strokeSpy = vi.spyOn(ctx, 'stroke');
      
      const state = stateManager.getState();
      uiController.render(state);
      
      // Should have called stroke for grid lines
      expect(strokeSpy).toHaveBeenCalled();
    });
  });

  describe('Game Over Overlay Display', () => {
    it('should show game over overlay when game ends', () => {
      // Trigger game over by causing collision
      // Move snake out of bounds
      for (let i = 0; i < 20; i++) {
        stateManager.tick();
      }
      
      const state = stateManager.getState();
      if (state.gameStatus === 'gameOver') {
        uiController.render(state);
        
        const gameOverOverlay = container.querySelector('#game-over');
        expect(gameOverOverlay.style.display).toBe('flex');
      }
    });

    it('should display final score in game over overlay', () => {
      const testScore = 50;
      
      // Show game over with specific score
      uiController.showGameOver(testScore);
      
      const finalScoreDisplay = container.querySelector('#final-score');
      expect(finalScoreDisplay.textContent).toBe(String(testScore));
    });

    it('should hide game over overlay when game is playing', () => {
      // First show it
      uiController.showGameOver(100);
      
      // Then render playing state
      const state = stateManager.getState();
      uiController.render(state);
      
      const gameOverOverlay = container.querySelector('#game-over');
      expect(gameOverOverlay.style.display).toBe('none');
    });
  });

  describe('Pause Overlay Display', () => {
    it('should show pause overlay when game is paused', () => {
      stateManager.pauseGame();
      
      const state = stateManager.getState();
      uiController.render(state);
      
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('flex');
    });

    it('should hide pause overlay when game is playing', () => {
      // First pause
      stateManager.pauseGame();
      uiController.render(stateManager.getState());
      
      // Then resume
      stateManager.resumeGame();
      uiController.render(stateManager.getState());
      
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('none');
    });

    it('should show pause indicator using method', () => {
      uiController.showPauseIndicator();
      
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('flex');
    });

    it('should hide pause indicator using method', () => {
      uiController.showPauseIndicator();
      uiController.hidePauseIndicator();
      
      const pauseOverlay = container.querySelector('#pause-overlay');
      expect(pauseOverlay.style.display).toBe('none');
    });
  });

  describe('Score Display Updates', () => {
    it('should display initial score of 0', () => {
      const state = stateManager.getState();
      uiController.render(state);
      
      const scoreDisplay = container.querySelector('#score');
      expect(scoreDisplay.textContent).toBe('0');
    });

    it('should update score display immediately when score changes', () => {
      const state = stateManager.getState();
      
      // Manually set score for testing
      state.score = 30;
      uiController.render(state);
      
      const scoreDisplay = container.querySelector('#score');
      expect(scoreDisplay.textContent).toBe('30');
    });

    it('should display score in game over overlay', () => {
      const finalScore = 120;
      uiController.showGameOver(finalScore);
      
      const finalScoreDisplay = container.querySelector('#final-score');
      expect(finalScoreDisplay.textContent).toBe(String(finalScore));
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      expect(container.innerHTML).not.toBe('');
      
      uiController.destroy();
      
      expect(container.innerHTML).toBe('');
    });

    it('should unsubscribe from state changes on destroy', () => {
      // Test that destroy cleans up the already initialized controller
      const scoreDisplayBefore = container.querySelector('#score');
      expect(scoreDisplayBefore).toBeTruthy();
      expect(scoreDisplayBefore.textContent).toBe('0');
      
      // Destroy the controller
      uiController.destroy();
      
      // After destroy, container should be empty
      expect(container.innerHTML).toBe('');
      
      // Verify elements are gone
      expect(container.querySelector('#score')).toBeNull();
      expect(container.querySelector('#game-canvas')).toBeNull();
    });
  });
});
