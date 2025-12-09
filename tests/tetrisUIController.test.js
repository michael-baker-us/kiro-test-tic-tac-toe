/**
 * Unit tests for Tetris UI Controller
 * Tests canvas initialization, rendering, and display updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createUIController } from '../src/games/tetris/uiController.js';
import { StateManager } from '../src/games/tetris/stateManager.js';

describe('Tetris UI Controller', () => {
  let container;
  let stateManager;
  let uiController;
  let mockContext;
  
  beforeEach(() => {
    // Create container
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create state manager
    stateManager = new StateManager();
    
    // Mock canvas context
    mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn()
    };
    
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    
    // Create and init UI controller
    uiController = createUIController(stateManager, container);
    uiController.init();
  });
  
  afterEach(() => {
    if (uiController) {
      uiController.destroy();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });
  
  describe('Initialization', () => {
    it('should create canvas elements', () => {
      const canvas = container.querySelector('#tetris-canvas');
      const nextPieceCanvas = container.querySelector('#next-piece-canvas');
      
      expect(canvas).toBeTruthy();
      expect(nextPieceCanvas).toBeTruthy();
    });
    
    it('should set correct canvas dimensions', () => {
      const canvas = container.querySelector('#tetris-canvas');
      
      expect(canvas.width).toBe(300);
      expect(canvas.height).toBe(600);
    });
    
    it('should create stats display elements', () => {
      const scoreDisplay = container.querySelector('#tetris-score');
      const levelDisplay = container.querySelector('#tetris-level');
      const linesDisplay = container.querySelector('#tetris-lines');
      
      expect(scoreDisplay).toBeTruthy();
      expect(levelDisplay).toBeTruthy();
      expect(linesDisplay).toBeTruthy();
    });
  });
  
  describe('Rendering', () => {
    it('should render board', () => {
      const emptyBoard = Array(20).fill(null).map(() => Array(10).fill(null));
      
      mockContext.fillRect.mockClear();
      uiController.renderBoard(emptyBoard);
      
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
    
    it('should render current piece', () => {
      const piece = {
        type: 'T',
        rotation: 0,
        x: 3,
        y: 0,
        color: '#a000f0'
      };
      
      mockContext.fillRect.mockClear();
      uiController.renderCurrentPiece(piece);
      
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
    
    it('should render ghost piece', () => {
      const piece = {
        type: 'T',
        rotation: 0,
        x: 3,
        y: 0,
        color: '#a000f0'
      };
      
      mockContext.strokeRect.mockClear();
      uiController.renderGhostPiece(piece, 17);
      
      expect(mockContext.strokeRect).toHaveBeenCalled();
    });
    
    it('should render next piece', () => {
      const nextPiece = {
        type: 'I',
        color: '#00f0f0'
      };
      
      const nextCanvas = container.querySelector('#next-piece-canvas');
      const nextCtx = nextCanvas.getContext('2d');
      nextCtx.clearRect.mockClear();
      
      uiController.renderNextPiece(nextPiece);
      
      expect(nextCtx.clearRect).toHaveBeenCalled();
    });
  });
  
  describe('Stats Display', () => {
    it('should update score', () => {
      const scoreDisplay = container.querySelector('#tetris-score');
      
      uiController.renderStats(1000, 5, 25);
      
      expect(scoreDisplay.textContent).toBe('1000');
    });
    
    it('should update level', () => {
      const levelDisplay = container.querySelector('#tetris-level');
      
      uiController.renderStats(1000, 5, 25);
      
      expect(levelDisplay.textContent).toBe('5');
    });
    
    it('should update lines', () => {
      const linesDisplay = container.querySelector('#tetris-lines');
      
      uiController.renderStats(1000, 5, 25);
      
      expect(linesDisplay.textContent).toBe('25');
    });
  });
  
  describe('Overlays', () => {
    it('should show pause screen', () => {
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      
      uiController.showPauseScreen();
      
      expect(pauseOverlay.style.display).toBe('flex');
    });
    
    it('should hide pause screen', () => {
      const pauseOverlay = container.querySelector('#tetris-pause-overlay');
      
      uiController.showPauseScreen();
      uiController.hidePauseScreen();
      
      expect(pauseOverlay.style.display).toBe('none');
    });
    
    it('should show game over screen', () => {
      const gameOverOverlay = container.querySelector('#tetris-game-over');
      const finalScoreDisplay = container.querySelector('#tetris-final-score');
      
      uiController.showGameOverScreen(5000);
      
      expect(gameOverOverlay.style.display).toBe('flex');
      expect(finalScoreDisplay.textContent).toBe('5000');
    });
    
    it('should hide game over screen', () => {
      const gameOverOverlay = container.querySelector('#tetris-game-over');
      
      uiController.showGameOverScreen(5000);
      uiController.hideGameOverScreen();
      
      expect(gameOverOverlay.style.display).toBe('none');
    });
  });
  
  describe('State Subscription', () => {
    it('should subscribe to state changes', () => {
      const initialObserverCount = stateManager.observers.length;
      
      expect(initialObserverCount).toBeGreaterThan(0);
    });
    
    it('should unsubscribe on destroy', () => {
      const initialObserverCount = stateManager.observers.length;
      
      uiController.destroy();
      
      expect(stateManager.observers.length).toBe(initialObserverCount - 1);
    });
  });
  
  describe('Cleanup', () => {
    it('should clear container on destroy', () => {
      uiController.destroy();
      
      expect(container.innerHTML).toBe('');
    });
  });
});
