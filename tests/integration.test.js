// Integration tests for complete game flows
import { describe, it, expect, beforeEach } from 'vitest';
import { createStateManager } from '../src/games/tic-tac-toe/stateManager.js';
import { createGameController } from '../src/games/tic-tac-toe/gameController.js';
import { createUIController } from '../src/games/tic-tac-toe/uiController.js';

describe('Integration Tests', () => {
  let stateManager;
  let gameController;
  let uiController;

  beforeEach(() => {
    // Set up DOM elements
    document.body.innerHTML = `
      <div class="game-mode-selector">
        <label><input type="radio" name="gameMode" value="pvp" checked> Player vs Player</label>
        <label><input type="radio" name="gameMode" value="ai"> Player vs AI</label>
      </div>
      <div class="difficulty-selector" id="difficultySelector" style="display: none;">
        <label for="difficulty">AI Difficulty:</label>
        <select id="difficulty">
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div class="turn-indicator" id="turnIndicator"></div>
      <div class="game-board" id="gameBoard">
        <div class="cell" data-index="0"></div>
        <div class="cell" data-index="1"></div>
        <div class="cell" data-index="2"></div>
        <div class="cell" data-index="3"></div>
        <div class="cell" data-index="4"></div>
        <div class="cell" data-index="5"></div>
        <div class="cell" data-index="6"></div>
        <div class="cell" data-index="7"></div>
        <div class="cell" data-index="8"></div>
      </div>
      <div class="status-message" id="statusMessage"></div>
      <button class="new-game-btn" id="newGameBtn">New Game</button>
    `;
    
    stateManager = createStateManager();
    gameController = createGameController(stateManager);
    uiController = createUIController(stateManager, gameController);
    uiController.init();
  });

  it('should complete a full game flow from start to win', () => {
    // Initial state
    let state = stateManager.getState();
    expect(state.gameStatus).toBe('playing');
    expect(state.currentPlayer).toBe('X');
    
    // Play a winning game for X
    stateManager.makeMove(0); // X
    state = stateManager.getState();
    expect(state.currentPlayer).toBe('O');
    expect(state.board[0]).toBe('X');
    
    stateManager.makeMove(3); // O
    state = stateManager.getState();
    expect(state.currentPlayer).toBe('X');
    expect(state.board[3]).toBe('O');
    
    stateManager.makeMove(1); // X
    state = stateManager.getState();
    expect(state.currentPlayer).toBe('O');
    
    stateManager.makeMove(4); // O
    state = stateManager.getState();
    expect(state.currentPlayer).toBe('X');
    
    stateManager.makeMove(2); // X wins (top row)
    state = stateManager.getState();
    expect(state.gameStatus).toBe('won');
    expect(state.winner).toBe('X');
    expect(state.winningLine).toEqual([0, 1, 2]);
    
    // Verify UI reflects win state
    const statusMessage = document.getElementById('statusMessage');
    expect(statusMessage.textContent).toBe('Player X wins!');
    
    const turnIndicator = document.getElementById('turnIndicator');
    expect(turnIndicator.textContent).toBe('Game Over');
    
    // Verify winning cells are highlighted
    const cells = document.querySelectorAll('.cell');
    expect(cells[0].classList.contains('winning')).toBe(true);
    expect(cells[1].classList.contains('winning')).toBe(true);
    expect(cells[2].classList.contains('winning')).toBe(true);
  });

  it('should complete a full game flow from start to draw', () => {
    // Initial state
    let state = stateManager.getState();
    expect(state.gameStatus).toBe('playing');
    
    // Play a draw game
    // X O X
    // X O O
    // O X X
    stateManager.makeMove(0); // X
    stateManager.makeMove(1); // O
    stateManager.makeMove(2); // X
    stateManager.makeMove(4); // O
    stateManager.makeMove(3); // X
    stateManager.makeMove(5); // O
    stateManager.makeMove(7); // X
    stateManager.makeMove(6); // O
    stateManager.makeMove(8); // X - draw
    
    state = stateManager.getState();
    expect(state.gameStatus).toBe('draw');
    expect(state.winner).toBe(null);
    
    // Verify UI reflects draw state
    const statusMessage = document.getElementById('statusMessage');
    expect(statusMessage.textContent).toBe("It's a draw!");
    
    const turnIndicator = document.getElementById('turnIndicator');
    expect(turnIndicator.textContent).toBe('Game Over');
    
    // Verify all cells are filled
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      expect(cell.textContent).not.toBe('');
    });
  });

  it('should reset game after win', () => {
    // Play a winning game
    stateManager.makeMove(0); // X
    stateManager.makeMove(3); // O
    stateManager.makeMove(1); // X
    stateManager.makeMove(4); // O
    stateManager.makeMove(2); // X wins
    
    let state = stateManager.getState();
    expect(state.gameStatus).toBe('won');
    expect(state.winner).toBe('X');
    
    // Reset the game
    stateManager.resetGame();
    state = stateManager.getState();
    
    // Verify state is reset
    expect(state.gameStatus).toBe('playing');
    expect(state.currentPlayer).toBe('X');
    expect(state.winner).toBe(null);
    expect(state.winningLine).toBe(null);
    expect(state.board.every(cell => cell === null)).toBe(true);
    
    // Verify UI is reset
    const statusMessage = document.getElementById('statusMessage');
    expect(statusMessage.textContent).toBe('');
    
    const turnIndicator = document.getElementById('turnIndicator');
    expect(turnIndicator.textContent).toBe("Player X's turn");
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      expect(cell.textContent).toBe('');
      expect(cell.classList.contains('winning')).toBe(false);
    });
    
    // Verify we can play again
    const success = stateManager.makeMove(4);
    expect(success).toBe(true);
    state = stateManager.getState();
    expect(state.board[4]).toBe('X');
  });

  it('should reset game after draw', () => {
    // Play a draw game
    stateManager.makeMove(0); // X
    stateManager.makeMove(1); // O
    stateManager.makeMove(2); // X
    stateManager.makeMove(4); // O
    stateManager.makeMove(3); // X
    stateManager.makeMove(5); // O
    stateManager.makeMove(7); // X
    stateManager.makeMove(6); // O
    stateManager.makeMove(8); // X - draw
    
    let state = stateManager.getState();
    expect(state.gameStatus).toBe('draw');
    
    // Reset the game
    stateManager.resetGame();
    state = stateManager.getState();
    
    // Verify state is reset
    expect(state.gameStatus).toBe('playing');
    expect(state.currentPlayer).toBe('X');
    expect(state.winner).toBe(null);
    expect(state.board.every(cell => cell === null)).toBe(true);
    
    // Verify UI is reset
    const statusMessage = document.getElementById('statusMessage');
    expect(statusMessage.textContent).toBe('');
    
    const turnIndicator = document.getElementById('turnIndicator');
    expect(turnIndicator.textContent).toBe("Player X's turn");
    
    // Verify we can play again
    const success = stateManager.makeMove(0);
    expect(success).toBe(true);
    state = stateManager.getState();
    expect(state.board[0]).toBe('X');
  });
});
