// Unit tests for tic-tac-toe game wrapper
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import createTicTacToeGame from '../src/games/tic-tac-toe/index.js';

describe('Tic-Tac-Toe Game Wrapper', () => {
  let container;
  let game;
  
  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create game instance
    game = createTicTacToeGame();
  });
  
  afterEach(() => {
    // Clean up
    if (game) {
      game.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
  
  it('should initialize game in container', async () => {
    await game.init(container);
    
    // Check that game elements are rendered
    expect(container.querySelector('.tic-tac-toe-game')).toBeTruthy();
    expect(container.querySelector('#gameBoard')).toBeTruthy();
    expect(container.querySelector('.cell')).toBeTruthy();
  });
  
  it('should render all game UI elements', async () => {
    await game.init(container);
    
    // Check for key UI elements
    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('.game-mode-selector')).toBeTruthy();
    expect(container.querySelector('#turnIndicator')).toBeTruthy();
    expect(container.querySelector('#newGameBtn')).toBeTruthy();
    expect(container.querySelector('#scoreboard')).toBeTruthy();
  });
  
  it('should render 9 cells in the game board', async () => {
    await game.init(container);
    
    const cells = container.querySelectorAll('.cell');
    expect(cells.length).toBe(9);
  });
  
  it('should clean up container on destroy', async () => {
    await game.init(container);
    
    // Verify game is rendered
    expect(container.querySelector('.tic-tac-toe-game')).toBeTruthy();
    
    // Destroy the game
    game.destroy();
    
    // Verify container is empty
    expect(container.innerHTML).toBe('');
  });
  
  it('should restore saved game mode preference', async () => {
    // Set a preference
    localStorage.setItem('gameMode', 'ai');
    
    await game.init(container);
    
    // Check that AI mode radio is checked
    const aiRadio = container.querySelector('input[name="gameMode"][value="ai"]');
    expect(aiRadio.checked).toBe(true);
    
    // Clean up
    localStorage.removeItem('gameMode');
  });
  
  it('should show difficulty selector when AI mode is selected', async () => {
    localStorage.setItem('gameMode', 'ai');
    
    await game.init(container);
    
    const difficultySelector = container.querySelector('#difficultySelector');
    expect(difficultySelector.style.display).toBe('block');
    
    // Clean up
    localStorage.removeItem('gameMode');
  });
  
  it('should hide difficulty selector when PvP mode is selected', async () => {
    localStorage.setItem('gameMode', 'pvp');
    
    await game.init(container);
    
    const difficultySelector = container.querySelector('#difficultySelector');
    expect(difficultySelector.style.display).toBe('none');
    
    // Clean up
    localStorage.removeItem('gameMode');
  });
});
