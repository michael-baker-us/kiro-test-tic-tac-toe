// Unit tests for UI controller
import { describe, it, expect, beforeEach } from 'vitest';
import { createUIController } from '../src/games/tic-tac-toe/uiController.js';
import { createStateManager } from '../src/games/tic-tac-toe/stateManager.js';
import { createGameController } from '../src/games/tic-tac-toe/gameController.js';

describe('UI Controller', () => {
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
  });

  describe('Rendering', () => {
    it('should render empty board correctly', () => {
      const state = stateManager.getState();
      uiController.render(state);
      
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        expect(cell.textContent).toBe('');
        expect(cell.classList.contains('occupied')).toBe(false);
      });
    });

    it('should render board with moves correctly', () => {
      stateManager.makeMove(0); // X
      stateManager.makeMove(4); // O
      
      const state = stateManager.getState();
      uiController.render(state);
      
      const cells = document.querySelectorAll('.cell');
      expect(cells[0].textContent).toBe('X');
      expect(cells[0].classList.contains('x')).toBe(true);
      expect(cells[0].classList.contains('occupied')).toBe(true);
      
      expect(cells[4].textContent).toBe('O');
      expect(cells[4].classList.contains('o')).toBe(true);
      expect(cells[4].classList.contains('occupied')).toBe(true);
      
      expect(cells[1].textContent).toBe('');
    });

    it('should display status message for win', () => {
      // Create a winning game
      stateManager.makeMove(0); // X
      stateManager.makeMove(3); // O
      stateManager.makeMove(1); // X
      stateManager.makeMove(4); // O
      stateManager.makeMove(2); // X wins
      
      const state = stateManager.getState();
      uiController.render(state);
      
      const statusMessage = document.getElementById('statusMessage');
      expect(statusMessage.textContent).toBe('Player X wins!');
      expect(statusMessage.classList.contains('win')).toBe(true);
    });

    it('should display status message for draw', () => {
      // Create a draw game
      stateManager.makeMove(0); // X
      stateManager.makeMove(1); // O
      stateManager.makeMove(2); // X
      stateManager.makeMove(4); // O
      stateManager.makeMove(3); // X
      stateManager.makeMove(5); // O
      stateManager.makeMove(7); // X
      stateManager.makeMove(6); // O
      stateManager.makeMove(8); // X - draw
      
      const state = stateManager.getState();
      uiController.render(state);
      
      const statusMessage = document.getElementById('statusMessage');
      expect(statusMessage.textContent).toBe("It's a draw!");
      expect(statusMessage.classList.contains('draw')).toBe(true);
    });

    it('should update turn indicator during game', () => {
      let state = stateManager.getState();
      uiController.render(state);
      
      const turnIndicator = document.getElementById('turnIndicator');
      expect(turnIndicator.textContent).toBe("Player X's turn");
      
      stateManager.makeMove(0); // X
      state = stateManager.getState();
      uiController.render(state);
      
      expect(turnIndicator.textContent).toBe("Player O's turn");
    });

    it('should update turn indicator when game ends', () => {
      // Create a winning game
      stateManager.makeMove(0); // X
      stateManager.makeMove(3); // O
      stateManager.makeMove(1); // X
      stateManager.makeMove(4); // O
      stateManager.makeMove(2); // X wins
      
      const state = stateManager.getState();
      uiController.render(state);
      
      const turnIndicator = document.getElementById('turnIndicator');
      expect(turnIndicator.textContent).toBe('Game Over');
    });
  });
});
