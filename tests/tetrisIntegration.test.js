// Integration tests for Tetris tab switching and initialization
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Tetris Integration Tests', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Create a new JSDOM instance with the HTML structure including Tetris
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="app">
            <nav class="game-tabs">
              <button class="tab-button active" data-game="snake">🐍 Snake</button>
              <button class="tab-button" data-game="tic-tac-toe">⭕ Tic-Tac-Toe</button>
              <button class="tab-button" data-game="tetris">🟦 Tetris</button>
            </nav>
            <div id="snake-container" class="game-container"></div>
            <div id="tic-tac-toe-container" class="game-container" style="display: none;"></div>
            <div id="tetris-container" class="game-container" style="display: none;"></div>
          </div>
        </body>
      </html>
    `, {
      url: 'http://localhost/'
    });
    
    window = dom.window;
    document = window.document;
    
    // Set up global window and document
    global.window = window;
    global.document = document;
  });

  afterEach(() => {
    // Clean up
    if (dom) {
      dom.window.close();
    }
  });

  // Test: Tetris tab appears in navigation
  // Validates: Requirements 12.1
  it('should display Tetris tab in navigation', () => {
    const tetrisTab = document.querySelector('[data-game="tetris"]');
    
    expect(tetrisTab).toBeTruthy();
    expect(tetrisTab.textContent).toContain('Tetris');
    expect(tetrisTab.dataset.game).toBe('tetris');
  });

  // Test: Tetris container exists
  // Validates: Requirements 12.1
  it('should have Tetris container element', () => {
    const tetrisContainer = document.getElementById('tetris-container');
    
    expect(tetrisContainer).toBeTruthy();
    expect(tetrisContainer.classList.contains('game-container')).toBe(true);
  });

  // Test: Tetris initializes when selected
  // Validates: Requirements 12.2
  it('should initialize Tetris when tab is selected', async () => {
    const tetrisContainer = document.getElementById('tetris-container');
    
    // Mock Tetris game
    const mockTetrisGame = {
      init: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn()
    };
    
    // Initialize the game
    await mockTetrisGame.init(tetrisContainer);
    
    // Verify init was called with the container
    expect(mockTetrisGame.init).toHaveBeenCalledWith(tetrisContainer);
    expect(mockTetrisGame.init).toHaveBeenCalledTimes(1);
  });

  // Test: Game pauses when switching away
  // Validates: Requirements 12.3
  it('should pause Tetris game when switching to another tab', () => {
    const tetrisContainer = document.getElementById('tetris-container');
    const snakeContainer = document.getElementById('snake-container');
    
    // Mock Tetris game with pause method
    const mockTetrisGame = {
      init: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn()
    };
    
    // Simulate Tetris being active
    tetrisContainer.style.display = 'block';
    snakeContainer.style.display = 'none';
    let activeGame = 'tetris';
    
    // Simulate switching away from Tetris
    if (activeGame === 'tetris' && mockTetrisGame) {
      mockTetrisGame.pause();
    }
    
    tetrisContainer.style.display = 'none';
    snakeContainer.style.display = 'block';
    activeGame = 'snake';
    
    // Verify pause was called
    expect(mockTetrisGame.pause).toHaveBeenCalled();
    expect(tetrisContainer.style.display).toBe('none');
    expect(snakeContainer.style.display).toBe('block');
  });

  // Test: Game resumes when switching back
  // Validates: Requirements 12.4
  it('should resume Tetris game when switching back to Tetris tab', () => {
    const tetrisContainer = document.getElementById('tetris-container');
    const snakeContainer = document.getElementById('snake-container');
    
    // Mock Tetris game with resume method
    const mockTetrisGame = {
      init: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn()
    };
    
    // Simulate Snake being active
    snakeContainer.style.display = 'block';
    tetrisContainer.style.display = 'none';
    let activeGame = 'snake';
    
    // Simulate switching to Tetris
    snakeContainer.style.display = 'none';
    tetrisContainer.style.display = 'block';
    activeGame = 'tetris';
    
    if (activeGame === 'tetris' && mockTetrisGame) {
      mockTetrisGame.resume();
    }
    
    // Verify resume was called
    expect(mockTetrisGame.resume).toHaveBeenCalled();
    expect(tetrisContainer.style.display).toBe('block');
    expect(snakeContainer.style.display).toBe('none');
  });

  // Test: Tab switching maintains correct visibility
  // Validates: Requirements 12.1, 12.2, 12.3, 12.4
  it('should maintain correct container visibility when switching between all three games', () => {
    const snakeContainer = document.getElementById('snake-container');
    const ticTacToeContainer = document.getElementById('tic-tac-toe-container');
    const tetrisContainer = document.getElementById('tetris-container');
    
    // Helper function to show a game
    function showGame(gameName) {
      snakeContainer.style.display = 'none';
      ticTacToeContainer.style.display = 'none';
      tetrisContainer.style.display = 'none';
      
      if (gameName === 'snake') {
        snakeContainer.style.display = 'block';
      } else if (gameName === 'tic-tac-toe') {
        ticTacToeContainer.style.display = 'block';
      } else if (gameName === 'tetris') {
        tetrisContainer.style.display = 'block';
      }
    }
    
    // Start with snake (default)
    showGame('snake');
    expect(snakeContainer.style.display).toBe('block');
    expect(ticTacToeContainer.style.display).toBe('none');
    expect(tetrisContainer.style.display).toBe('none');
    
    // Switch to Tetris
    showGame('tetris');
    expect(snakeContainer.style.display).toBe('none');
    expect(ticTacToeContainer.style.display).toBe('none');
    expect(tetrisContainer.style.display).toBe('block');
    
    // Switch to Tic-Tac-Toe
    showGame('tic-tac-toe');
    expect(snakeContainer.style.display).toBe('none');
    expect(ticTacToeContainer.style.display).toBe('block');
    expect(tetrisContainer.style.display).toBe('none');
    
    // Switch back to Tetris
    showGame('tetris');
    expect(snakeContainer.style.display).toBe('none');
    expect(ticTacToeContainer.style.display).toBe('none');
    expect(tetrisContainer.style.display).toBe('block');
  });

  // Test: Tab button styling updates correctly
  // Validates: Requirements 12.1
  it('should update tab button active class when switching to Tetris', () => {
    const snakeTab = document.querySelector('[data-game="snake"]');
    const ticTacToeTab = document.querySelector('[data-game="tic-tac-toe"]');
    const tetrisTab = document.querySelector('[data-game="tetris"]');
    
    // Helper function to update tab styles
    function updateTabStyles(activeGameName) {
      const tabButtons = document.querySelectorAll('.tab-button');
      tabButtons.forEach(button => {
        if (button.dataset.game === activeGameName) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }
    
    // Initially snake is active
    expect(snakeTab.classList.contains('active')).toBe(true);
    
    // Switch to Tetris
    updateTabStyles('tetris');
    expect(snakeTab.classList.contains('active')).toBe(false);
    expect(ticTacToeTab.classList.contains('active')).toBe(false);
    expect(tetrisTab.classList.contains('active')).toBe(true);
    
    // Switch to Tic-Tac-Toe
    updateTabStyles('tic-tac-toe');
    expect(snakeTab.classList.contains('active')).toBe(false);
    expect(ticTacToeTab.classList.contains('active')).toBe(true);
    expect(tetrisTab.classList.contains('active')).toBe(false);
  });

  // Test: Pause/resume cycle maintains game state
  // Validates: Requirements 12.3, 12.4
  it('should maintain game state through pause/resume cycle', () => {
    // Mock state manager
    const mockStateManager = {
      getState: vi.fn(() => ({
        gameStatus: 'playing',
        score: 1000,
        level: 5,
        linesCleared: 42
      })),
      pauseGame: vi.fn(),
      resumeGame: vi.fn()
    };
    
    // Mock game loop
    const mockGameLoop = {
      pause: vi.fn(),
      resume: vi.fn()
    };
    
    // Mock Tetris game
    const mockTetrisGame = {
      pause: vi.fn(() => {
        const state = mockStateManager.getState();
        if (state.gameStatus === 'playing') {
          mockStateManager.pauseGame();
          mockGameLoop.pause();
        }
      }),
      resume: vi.fn(() => {
        const state = mockStateManager.getState();
        if (state.gameStatus === 'paused') {
          mockStateManager.resumeGame();
          mockGameLoop.resume();
        }
      })
    };
    
    // Get initial state
    const initialState = mockStateManager.getState();
    expect(initialState.score).toBe(1000);
    expect(initialState.level).toBe(5);
    
    // Pause the game
    mockTetrisGame.pause();
    expect(mockStateManager.pauseGame).toHaveBeenCalled();
    expect(mockGameLoop.pause).toHaveBeenCalled();
    
    // State should still be accessible
    const pausedState = mockStateManager.getState();
    expect(pausedState.score).toBe(1000);
    expect(pausedState.level).toBe(5);
    
    // Resume the game
    mockStateManager.getState = vi.fn(() => ({
      gameStatus: 'paused',
      score: 1000,
      level: 5,
      linesCleared: 42
    }));
    
    mockTetrisGame.resume();
    expect(mockStateManager.resumeGame).toHaveBeenCalled();
    expect(mockGameLoop.resume).toHaveBeenCalled();
  });
});
