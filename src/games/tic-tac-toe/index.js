// Tic-Tac-Toe game wrapper that implements the Game interface
import { createStateManager } from './stateManager.js';
import { createGameController } from './gameController.js';
import { createUIController } from './uiController.js';

/**
 * Creates a Tic-Tac-Toe game instance
 * @returns {Object} Game instance with init and destroy methods
 */
export default function createTicTacToeGame() {
  let stateManager = null;
  let gameController = null;
  let uiController = null;
  let container = null;
  let unsubscribe = null;
  
  /**
   * Initializes the game in the provided container
   * @param {HTMLElement} containerElement - Container to render the game in
   */
  async function init(containerElement) {
    container = containerElement;
    
    // Check if battle mode is enabled
    const battleModeEnabled = localStorage.getItem('battleMode') === 'true';
    
    // Restore game mode preference
    const savedGameMode = localStorage.getItem('gameMode') || 'pvp';
    
    // Create the game HTML structure
    container.innerHTML = `
      <div class="tic-tac-toe-game">
        <h1>Tic-Tac-Toe</h1>
        
        <div class="game-mode-selector">
          <label>
            <input type="radio" name="gameMode" value="pvp" ${savedGameMode === 'pvp' ? 'checked' : ''}>
            Player vs Player
          </label>
          <label>
            <input type="radio" name="gameMode" value="ai" ${savedGameMode === 'ai' ? 'checked' : ''}>
            Player vs AI
          </label>
        </div>
        
        <div class="battle-mode-toggle" id="battleModeToggle">
          <label>
            <input type="checkbox" id="battleModeCheckbox" ${battleModeEnabled ? 'checked' : ''}>
            <span class="battle-mode-label">⚔️ Battle Mode</span>
            <span class="battle-mode-hint">(Capture pieces for 2 turns! 🆕 = protected, 🔒 = locked)</span>
          </label>
        </div>
        
        <div class="difficulty-selector" id="difficultySelector" style="display: ${savedGameMode === 'ai' ? 'block' : 'none'};">
          <label for="difficulty">AI Difficulty:</label>
          <select id="difficulty">
            <option value="easy">Easy</option>
            <option value="medium" selected>Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div class="turn-indicator" id="turnIndicator">
          Player X's turn
        </div>
        
        <div class="battle-info" id="battleInfo" style="display: none;">
          <span class="turns-remaining" id="turnsRemaining"></span>
        </div>
        
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
        
        <div class="scoreboard" id="scoreboard">
          <div class="scoreboard-header">
            <h2>Scoreboard</h2>
            <button class="reset-scores-btn" id="resetScoresBtn" title="Reset scores">🔄</button>
          </div>
          
          <div class="scoreboard-content">
            <!-- PvP Scores -->
            <div class="score-section" id="pvpScores">
              <h3>Player vs Player</h3>
              <div class="score-grid">
                <div class="score-item">
                  <span class="score-label">Player X</span>
                  <span class="score-value" id="pvpXWins">0</span>
                </div>
                <div class="score-item">
                  <span class="score-label">Player O</span>
                  <span class="score-value" id="pvpOWins">0</span>
                </div>
                <div class="score-item">
                  <span class="score-label">Draws</span>
                  <span class="score-value" id="pvpDraws">0</span>
                </div>
              </div>
            </div>
            
            <!-- AI Scores -->
            <div class="score-section" id="aiScores" style="display: none;">
              <h3>Player vs AI</h3>
              <div class="score-grid">
                <div class="score-item">
                  <span class="score-label">Your Wins</span>
                  <span class="score-value" id="aiWins">0</span>
                </div>
                <div class="score-item">
                  <span class="score-label">AI Wins</span>
                  <span class="score-value" id="aiLosses">0</span>
                </div>
                <div class="score-item">
                  <span class="score-label">Draws</span>
                  <span class="score-value" id="aiDraws">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Create state manager with battle mode option
    stateManager = createStateManager({ battleMode: battleModeEnabled });
    
    // Create game controller
    gameController = createGameController(stateManager);
    
    // Set the game mode from saved preference
    gameController.setGameMode(savedGameMode);
    
    // Create UI controller with container scope
    uiController = createUIController(stateManager, gameController, container);
    
    // Initialize the UI controller (subscribes to state and renders)
    uiController.init();
  }
  
  /**
   * Cleans up resources when leaving the game
   */
  function destroy() {
    // Clean up event listeners and subscriptions
    if (unsubscribe) {
      unsubscribe();
    }
    
    // Clear the container
    if (container) {
      container.innerHTML = '';
    }
    
    // Reset references
    stateManager = null;
    gameController = null;
    uiController = null;
    container = null;
  }
  
  return {
    init,
    destroy
  };
}
