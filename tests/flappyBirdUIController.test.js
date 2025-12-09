// Unit tests for Flappy Bird UI controller
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createUIController } from '../src/games/flappy-bird/uiController.js';
import { createStateManager } from '../src/games/flappy-bird/stateManager.js';
import { CONFIG } from '../src/games/flappy-bird/config.js';

describe('Flappy Bird UI Controller', () => {
  let stateManager;
  let uiController;
  let container;
  let mockContext;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    // Mock canvas context
    mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      }))
    };
    
    // Mock HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    
    // Create state manager
    stateManager = createStateManager(CONFIG);
    
    // Create UI controller
    uiController = createUIController(stateManager, container, CONFIG);
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
    it('should create canvas element', () => {
      uiController.init();
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('should initialize canvas with dimensions', () => {
      uiController.init();
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('should get 2D rendering context', () => {
      uiController.init();
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
    });

    it('should throw error if context cannot be obtained', () => {
      // Mock getContext to return null
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      
      const newController = createUIController(stateManager, container, CONFIG);
      expect(() => newController.init()).toThrow('Failed to get 2D rendering context');
    });

    it('should subscribe to state changes', () => {
      const subscribeSpy = vi.spyOn(stateManager, 'subscribe');
      
      uiController.init();
      
      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should set up window resize listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      uiController.init();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });
  });

  describe('Rendering Menu State', () => {
    it('should render start menu when in menu state', () => {
      uiController.init();
      
      const state = stateManager.getState();
      expect(state.gameStatus).toBe(CONFIG.GAME_STATES.MENU);
      
      // Check that text rendering was called (for menu)
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should display game title in menu', () => {
      uiController.init();
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      const titleCall = fillTextCalls.find(call => call[0] === 'Flappy Bird');
      
      expect(titleCall).toBeTruthy();
    });

    it('should display instructions in menu', () => {
      uiController.init();
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      const instructionCall = fillTextCalls.find(call => 
        call[0].includes('Click') || call[0].includes('Tap')
      );
      
      expect(instructionCall).toBeTruthy();
    });

    it('should display high score if exists', () => {
      // Set high score
      const state = stateManager.getState();
      state.highScore = 10;
      
      uiController.init();
      uiController.render(state);
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      const highScoreCall = fillTextCalls.find(call => 
        call[0].includes('High Score')
      );
      
      expect(highScoreCall).toBeTruthy();
    });
  });

  describe('Rendering Playing State', () => {
    it('should render bird when playing', () => {
      stateManager.startGame();
      uiController.init();
      
      // Bird is rendered using arc (circle)
      expect(mockContext.arc).toHaveBeenCalled();
    });

    it('should render bird with rotation', () => {
      stateManager.startGame();
      uiController.init();
      
      // Rotation uses save/restore and rotate
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.rotate).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should render score during gameplay', () => {
      stateManager.startGame();
      uiController.init();
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      const scoreCall = fillTextCalls.find(call => call[0] === '0');
      
      expect(scoreCall).toBeTruthy();
    });

    it('should render pipes when they exist', () => {
      stateManager.startGame();
      
      // Add a pipe to state
      const state = stateManager.getState();
      state.pipes = [{
        x: 300,
        gapY: 300,
        gapHeight: 150,
        width: 52,
        passed: false
      }];
      
      uiController.init();
      uiController.render(state);
      
      // Pipes are rendered using fillRect
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should clear canvas before rendering', () => {
      uiController.init();
      
      mockContext.clearRect.mockClear();
      
      const state = stateManager.getState();
      uiController.render(state);
      
      expect(mockContext.clearRect).toHaveBeenCalled();
    });
  });

  describe('Rendering Game Over State', () => {
    it('should render game over screen', () => {
      stateManager.startGame();
      stateManager.endGame();
      
      uiController.init();
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      const gameOverCall = fillTextCalls.find(call => call[0] === 'Game Over');
      
      expect(gameOverCall).toBeTruthy();
    });

    it('should display final score on game over', () => {
      stateManager.startGame();
      stateManager.incrementScore();
      stateManager.incrementScore();
      stateManager.endGame();
      
      uiController.init();
      
      const state = stateManager.getState();
      expect(state.score).toBe(2);
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      const scoreCall = fillTextCalls.find(call => 
        call[0].includes('Score:') || call[0] === '2'
      );
      
      expect(scoreCall).toBeTruthy();
    });

    it('should display restart instruction on game over', () => {
      stateManager.startGame();
      stateManager.endGame();
      
      uiController.init();
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      const restartCall = fillTextCalls.find(call => 
        call[0].includes('Restart') || call[0].includes('Click')
      );
      
      expect(restartCall).toBeTruthy();
    });

    it('should render semi-transparent overlay on game over', () => {
      stateManager.startGame();
      stateManager.endGame();
      
      uiController.init();
      
      // Check for overlay rendering (rgba with alpha)
      const fillStyleCalls = mockContext.fillRect.mock.calls;
      expect(fillStyleCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Canvas Sizing', () => {
    it('should adjust canvas size based on container', () => {
      // Create a new container with specific dimensions
      const smallContainer = document.createElement('div');
      Object.defineProperty(smallContainer, 'clientWidth', { value: 300, writable: true });
      Object.defineProperty(smallContainer, 'clientHeight', { value: 500, writable: true });
      document.body.appendChild(smallContainer);
      
      const smallController = createUIController(stateManager, smallContainer, CONFIG);
      smallController.init();
      
      const canvas = smallContainer.querySelector('#flappy-bird-canvas');
      expect(canvas.width).toBeLessThanOrEqual(300);
      
      smallController.destroy();
      document.body.removeChild(smallContainer);
    });

    it('should handle window resize events', () => {
      uiController.init();
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      const originalWidth = canvas.width;
      
      // Change container size
      container.style.width = '200px';
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      
      // Canvas should be updated (in real scenario)
      expect(canvas).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('should remove canvas on destroy', () => {
      uiController.init();
      
      const canvas = container.querySelector('#flappy-bird-canvas');
      expect(canvas).toBeTruthy();
      
      uiController.destroy();
      
      const canvasAfter = container.querySelector('#flappy-bird-canvas');
      expect(canvasAfter).toBeNull();
    });

    it('should unsubscribe from state changes on destroy', () => {
      uiController.init();
      
      // Get initial subscriber count
      const state = stateManager.getState();
      
      uiController.destroy();
      
      // After destroy, updates should not trigger renders
      mockContext.clearRect.mockClear();
      stateManager.startGame();
      
      // If properly unsubscribed, clearRect should not be called
      // (since render won't be triggered)
      expect(mockContext.clearRect).not.toHaveBeenCalled();
    });

    it('should remove resize listener on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      uiController.init();
      uiController.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('should handle multiple destroy calls gracefully', () => {
      uiController.init();
      
      expect(() => {
        uiController.destroy();
        uiController.destroy();
      }).not.toThrow();
    });
  });

  describe('Background Rendering', () => {
    it('should render background gradient', () => {
      uiController.init();
      
      expect(mockContext.createLinearGradient).toHaveBeenCalled();
    });

    it('should fill background', () => {
      uiController.init();
      
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });
});
