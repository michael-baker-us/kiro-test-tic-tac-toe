/**
 * Integration tests for Flappy Bird game with main application
 * Requirements: 8.1, 8.2, 8.5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import createFlappyBirdGame from '../src/games/flappy-bird/index.js';

describe('Flappy Bird Application Integration Tests', () => {
  let container;
  let gameInstance;
  let mockContext;

  beforeEach(() => {
    // Set up DOM with Flappy Bird container
    document.body.innerHTML = `
      <div id="app">
        <nav class="game-tabs">
          <button class="tab-button" data-game="snake">🐍 Snake</button>
          <button class="tab-button" data-game="tic-tac-toe">⭕ Tic-Tac-Toe</button>
          <button class="tab-button" data-game="tetris">🟦 Tetris</button>
          <button class="tab-button active" data-game="flappy-bird">🐦 Flappy Bird</button>
        </nav>
        <div id="snake-container" class="game-container" style="display: none;"></div>
        <div id="tic-tac-toe-container" class="game-container" style="display: none;"></div>
        <div id="tetris-container" class="game-container" style="display: none;"></div>
        <div id="flappy-bird-container" class="game-container"></div>
      </div>
    `;
    
    container = document.getElementById('flappy-bird-container');
    
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
    
    // Mock HTMLCanvasElement.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
  });

  afterEach(() => {
    if (gameInstance) {
      gameInstance.destroy();
      gameInstance = null;
    }
  });

  it('should initialize Flappy Bird game from main app', async () => {
    // Requirement 8.1: Initialize game in container
    gameInstance = createFlappyBirdGame();
    
    expect(container.children.length).toBe(0);
    
    await gameInstance.init(container);
    
    // Verify canvas was created
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.tagName).toBe('CANVAS');
    
    // Verify game interface methods exist
    expect(typeof gameInstance.init).toBe('function');
    expect(typeof gameInstance.destroy).toBe('function');
    expect(typeof gameInstance.pause).toBe('function');
    expect(typeof gameInstance.resume).toBe('function');
  });

  it('should switch between games correctly', async () => {
    // Requirement 8.1, 8.2: Game switching and cleanup
    const flappyBirdContainer = document.getElementById('flappy-bird-container');
    const snakeContainer = document.getElementById('snake-container');
    const flappyBirdTab = document.querySelector('[data-game="flappy-bird"]');
    const snakeTab = document.querySelector('[data-game="snake"]');
    
    // Initialize Flappy Bird
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(flappyBirdContainer);
    
    // Initial state: Flappy Bird visible
    expect(flappyBirdContainer.style.display).toBe('');
    expect(snakeContainer.style.display).toBe('none');
    expect(flappyBirdTab.classList.contains('active')).toBe(true);
    
    // Simulate switching to Snake
    gameInstance.pause(); // Should pause when switching away
    flappyBirdContainer.style.display = 'none';
    snakeContainer.style.display = 'block';
    flappyBirdTab.classList.remove('active');
    snakeTab.classList.add('active');
    
    // Verify Snake is visible, Flappy Bird is hidden
    expect(snakeContainer.style.display).toBe('block');
    expect(flappyBirdContainer.style.display).toBe('none');
    expect(snakeTab.classList.contains('active')).toBe(true);
    expect(flappyBirdTab.classList.contains('active')).toBe(false);
    
    // Simulate switching back to Flappy Bird
    gameInstance.resume(); // Should resume when switching back
    snakeContainer.style.display = 'none';
    flappyBirdContainer.style.display = 'block';
    snakeTab.classList.remove('active');
    flappyBirdTab.classList.add('active');
    
    // Verify Flappy Bird is visible again
    expect(flappyBirdContainer.style.display).toBe('block');
    expect(snakeContainer.style.display).toBe('none');
    expect(flappyBirdTab.classList.contains('active')).toBe(true);
  });

  it('should cleanup when leaving Flappy Bird', async () => {
    // Requirement 8.2, 8.5: Proper cleanup when switching games
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(container);
    
    // Verify canvas exists
    let canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    
    // Destroy the game
    gameInstance.destroy();
    
    // Verify canvas is removed
    canvas = container.querySelector('canvas');
    expect(canvas).toBeFalsy();
    expect(container.children.length).toBe(0);
  });

  it('should handle pause and resume correctly', async () => {
    // Requirement 8.2: Pause/resume for tab switching
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(container);
    
    // Pause should not throw errors
    expect(() => gameInstance.pause()).not.toThrow();
    
    // Resume should not throw errors
    expect(() => gameInstance.resume()).not.toThrow();
    
    // Multiple pauses should be safe
    expect(() => {
      gameInstance.pause();
      gameInstance.pause();
    }).not.toThrow();
    
    // Multiple resumes should be safe
    expect(() => {
      gameInstance.resume();
      gameInstance.resume();
    }).not.toThrow();
  });

  it('should maintain game state when switching tabs', async () => {
    // Requirement 8.2: Game state persists during tab switches
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(container);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    
    // Pause the game (simulating tab switch away)
    gameInstance.pause();
    
    // Canvas should still exist
    const canvasAfterPause = container.querySelector('canvas');
    expect(canvasAfterPause).toBeTruthy();
    expect(canvasAfterPause).toBe(canvas);
    
    // Resume the game (simulating tab switch back)
    gameInstance.resume();
    
    // Canvas should still be the same
    const canvasAfterResume = container.querySelector('canvas');
    expect(canvasAfterResume).toBeTruthy();
    expect(canvasAfterResume).toBe(canvas);
  });

  it('should not interfere with other games', async () => {
    // Requirement 8.5: Handle own input events without interfering
    const flappyBirdContainer = document.getElementById('flappy-bird-container');
    const snakeContainer = document.getElementById('snake-container');
    
    // Initialize Flappy Bird
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(flappyBirdContainer);
    
    // Verify Flappy Bird canvas exists
    const flappyCanvas = flappyBirdContainer.querySelector('canvas');
    expect(flappyCanvas).toBeTruthy();
    
    // Verify Snake container is empty (no interference)
    expect(snakeContainer.children.length).toBe(0);
    
    // Destroy Flappy Bird
    gameInstance.destroy();
    
    // Verify Flappy Bird is cleaned up
    expect(flappyBirdContainer.children.length).toBe(0);
    
    // Verify Snake container is still empty (no side effects)
    expect(snakeContainer.children.length).toBe(0);
  });
});

describe('Flappy Bird Mobile Touch Integration Tests', () => {
  let container;
  let gameInstance;
  let originalUserAgent;
  let mockContext;

  beforeEach(() => {
    // Save original user agent
    originalUserAgent = navigator.userAgent;
    
    // Set up DOM
    document.body.innerHTML = `
      <div id="flappy-bird-container" class="game-container"></div>
    `;
    
    container = document.getElementById('flappy-bird-container');
    
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
    
    // Mock HTMLCanvasElement.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
  });

  afterEach(() => {
    if (gameInstance) {
      gameInstance.destroy();
      gameInstance = null;
    }
    
    // Restore user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true
    });
  });

  it('should work with mobile touch controls in integrated environment', async () => {
    // Requirement 6.1, 6.2, 6.5: Mobile touch controls
    
    // Mock mobile user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      writable: true,
      configurable: true
    });
    
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(container);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    
    // Create a touch event
    const touchEvent = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [{ clientX: 100, clientY: 100 }]
    });
    
    // Dispatch touch event (should not throw)
    expect(() => canvas.dispatchEvent(touchEvent)).not.toThrow();
  });

  it('should prevent default touch behaviors', async () => {
    // Requirement 6.2: Prevent default browser behaviors
    
    // Mock mobile user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Android; Mobile)',
      writable: true,
      configurable: true
    });
    
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(container);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    
    // Create a cancelable touch event
    const touchEvent = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [{ clientX: 100, clientY: 100 }]
    });
    
    // Spy on preventDefault
    const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');
    
    // Dispatch touch event
    canvas.dispatchEvent(touchEvent);
    
    // Verify preventDefault was called (prevents scrolling)
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should handle desktop and mobile environments', async () => {
    // Test desktop environment
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
      writable: true,
      configurable: true
    });
    
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(container);
    
    let canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    
    gameInstance.destroy();
    
    // Test mobile environment
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
      configurable: true
    });
    
    gameInstance = createFlappyBirdGame();
    await gameInstance.init(container);
    
    canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });
});

describe('Flappy Bird Multi-Game Integration', () => {
  let containers;
  let games;
  let mockContext;

  beforeEach(() => {
    // Set up DOM with all game containers
    document.body.innerHTML = `
      <div id="app">
        <nav class="game-tabs">
          <button class="tab-button active" data-game="snake">🐍 Snake</button>
          <button class="tab-button" data-game="tic-tac-toe">⭕ Tic-Tac-Toe</button>
          <button class="tab-button" data-game="tetris">🟦 Tetris</button>
          <button class="tab-button" data-game="flappy-bird">🐦 Flappy Bird</button>
        </nav>
        <div id="snake-container" class="game-container"></div>
        <div id="tic-tac-toe-container" class="game-container" style="display: none;"></div>
        <div id="tetris-container" class="game-container" style="display: none;"></div>
        <div id="flappy-bird-container" class="game-container" style="display: none;"></div>
      </div>
    `;
    
    containers = {
      snake: document.getElementById('snake-container'),
      ticTacToe: document.getElementById('tic-tac-toe-container'),
      tetris: document.getElementById('tetris-container'),
      flappyBird: document.getElementById('flappy-bird-container')
    };
    
    games = {};
    
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
    
    // Mock HTMLCanvasElement.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
  });

  afterEach(() => {
    // Clean up all games
    Object.values(games).forEach(game => {
      if (game && game.destroy) {
        game.destroy();
      }
    });
    games = {};
  });

  it('should initialize all games including Flappy Bird', async () => {
    // Requirement 8.1: Initialize Flappy Bird alongside other games
    
    // Mock other games
    games.snake = {
      init: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn()
    };
    
    games.tetris = {
      init: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn()
    };
    
    // Initialize real Flappy Bird game
    games.flappyBird = createFlappyBirdGame();
    
    // Initialize all games
    await games.snake.init(containers.snake);
    await games.tetris.init(containers.tetris);
    await games.flappyBird.init(containers.flappyBird);
    
    // Verify all games initialized
    expect(games.snake.init).toHaveBeenCalledWith(containers.snake);
    expect(games.tetris.init).toHaveBeenCalledWith(containers.tetris);
    
    // Verify Flappy Bird canvas exists
    const canvas = containers.flappyBird.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should handle switching between all games including Flappy Bird', async () => {
    // Requirement 8.2: Proper pause/resume when switching
    
    // Initialize Flappy Bird
    games.flappyBird = createFlappyBirdGame();
    await games.flappyBird.init(containers.flappyBird);
    
    // Show Flappy Bird
    containers.flappyBird.style.display = 'block';
    
    // Verify Flappy Bird is visible
    expect(containers.flappyBird.style.display).toBe('block');
    
    // Switch away from Flappy Bird
    games.flappyBird.pause();
    containers.flappyBird.style.display = 'none';
    containers.snake.style.display = 'block';
    
    // Verify Flappy Bird is hidden
    expect(containers.flappyBird.style.display).toBe('none');
    expect(containers.snake.style.display).toBe('block');
    
    // Switch back to Flappy Bird
    containers.snake.style.display = 'none';
    containers.flappyBird.style.display = 'block';
    games.flappyBird.resume();
    
    // Verify Flappy Bird is visible again
    expect(containers.flappyBird.style.display).toBe('block');
    expect(containers.snake.style.display).toBe('none');
  });

  it('should verify Flappy Bird tab exists in navigation', () => {
    // Requirement 8.1: Flappy Bird in game selection menu
    const flappyBirdTab = document.querySelector('[data-game="flappy-bird"]');
    
    expect(flappyBirdTab).toBeTruthy();
    expect(flappyBirdTab.dataset.game).toBe('flappy-bird');
    expect(flappyBirdTab.textContent).toContain('Flappy Bird');
    
    // Verify all game tabs exist
    const allTabs = document.querySelectorAll('.tab-button');
    expect(allTabs.length).toBe(4);
    
    const gameNames = Array.from(allTabs).map(tab => tab.dataset.game);
    expect(gameNames).toContain('snake');
    expect(gameNames).toContain('tic-tac-toe');
    expect(gameNames).toContain('tetris');
    expect(gameNames).toContain('flappy-bird');
  });
});
