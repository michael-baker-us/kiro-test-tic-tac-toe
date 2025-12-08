// UI controller module

/**
 * Creates a UI controller for the tic-tac-toe game
 * @param {Object} stateManager - The state manager instance
 * @param {Object} gameController - The game controller instance
 * @returns {Object} UI controller with methods to render and handle events
 */
export function createUIController(stateManager, gameController) {
  const boardElement = document.getElementById('gameBoard');
  const statusElement = document.getElementById('statusMessage');
  const turnIndicatorElement = document.getElementById('turnIndicator');
  const newGameButton = document.getElementById('newGameBtn');
  const difficultySelector = document.getElementById('difficultySelector');
  const difficultySelect = document.getElementById('difficulty');
  const resetScoresButton = document.getElementById('resetScoresBtn');
  const pvpScoresSection = document.getElementById('pvpScores');
  const aiScoresSection = document.getElementById('aiScores');
  const battleModeCheckbox = document.getElementById('battleModeCheckbox');
  const battleModeToggle = document.getElementById('battleModeToggle');
  const battleInfo = document.getElementById('battleInfo');
  const turnsRemainingEl = document.getElementById('turnsRemaining');
  
  /**
   * Renders the game board and status based on current state
   * @param {Object} state - Current game state
   */
  function render(state) {
    renderBoard(state.board);
    renderStatus(state);
    renderTurnIndicator(state);
    renderScoreboard();
  }
  
  /**
   * Renders the scoreboard
   */
  function renderScoreboard() {
    const scoreboard = gameController.getScoreboard();
    const scores = scoreboard.getScores();
    const gameMode = gameController.getGameMode();
    
    // Show/hide appropriate score section
    if (pvpScoresSection && aiScoresSection) {
      if (gameMode === 'pvp') {
        pvpScoresSection.style.display = 'block';
        aiScoresSection.style.display = 'none';
      } else {
        pvpScoresSection.style.display = 'none';
        aiScoresSection.style.display = 'block';
      }
    }
    
    // Update PvP scores
    const pvpXWinsEl = document.getElementById('pvpXWins');
    const pvpOWinsEl = document.getElementById('pvpOWins');
    const pvpDrawsEl = document.getElementById('pvpDraws');
    
    if (pvpXWinsEl) pvpXWinsEl.textContent = scores.pvp.xWins;
    if (pvpOWinsEl) pvpOWinsEl.textContent = scores.pvp.oWins;
    if (pvpDrawsEl) pvpDrawsEl.textContent = scores.pvp.draws;
    
    // Update AI scores
    const aiWinsEl = document.getElementById('aiWins');
    const aiLossesEl = document.getElementById('aiLosses');
    const aiDrawsEl = document.getElementById('aiDraws');
    
    if (aiWinsEl) aiWinsEl.textContent = scores.ai.wins;
    if (aiLossesEl) aiLossesEl.textContent = scores.ai.losses;
    if (aiDrawsEl) aiDrawsEl.textContent = scores.ai.draws;
  }
  
  /**
   * Renders the board cells
   * @param {Array} board - Current board state
   */
  function renderBoard(board) {
    const cells = boardElement.querySelectorAll('.cell');
    const state = stateManager.getState();
    
    cells.forEach((cell, index) => {
      const value = board[index];
      
      // Update cell content
      cell.textContent = value || '';
      
      // Update cell classes
      cell.classList.remove('x', 'o', 'occupied', 'winning', 'capturable', 'locked', 'last-placed');
      
      if (value) {
        cell.classList.add('occupied');
        cell.classList.add(value.toLowerCase());
      }
      
      // Mark locked positions (captured pieces that cannot be recaptured)
      if (state.battleMode && state.lockedPositions && state.lockedPositions.includes(index)) {
        cell.classList.add('locked');
      }
      
      // Mark the last placed position (cannot be captured immediately)
      if (state.battleMode && state.lastPlacedPosition === index && value) {
        cell.classList.add('last-placed');
      }
      
      // Highlight winning cells
      if (state.winningLine && state.winningLine.includes(index)) {
        cell.classList.add('winning');
      }
      
      // In battle mode, mark capturable cells
      if (state.battleMode && state.gameStatus === 'playing') {
        if (gameController.canCapture(index)) {
          cell.classList.add('capturable');
        }
      }
      
      // Update hover preview for available cells
      if (!value && state.gameStatus === 'playing') {
        cell.setAttribute('data-preview', state.currentPlayer);
        cell.classList.add(state.currentPlayer.toLowerCase());
      } else {
        cell.removeAttribute('data-preview');
      }
    });
  }
  
  /**
   * Renders the status message based on game state
   * @param {Object} state - Current game state
   */
  function renderStatus(state) {
    statusElement.classList.remove('win', 'draw');
    
    if (state.gameStatus === 'won') {
      const gameMode = gameController.getGameMode();
      
      if (gameMode === 'ai') {
        if (state.winner === 'X') {
          statusElement.textContent = 'You win! 🎉';
        } else {
          statusElement.textContent = 'AI wins!';
        }
      } else {
        statusElement.textContent = `Player ${state.winner} wins!`;
      }
      
      statusElement.classList.add('win');
    } else if (state.gameStatus === 'draw') {
      statusElement.textContent = "It's a draw!";
      statusElement.classList.add('draw');
    } else {
      statusElement.textContent = '';
    }
  }
  
  /**
   * Renders the turn indicator
   * @param {Object} state - Current game state
   */
  function renderTurnIndicator(state) {
    if (state.gameStatus === 'playing') {
      const gameMode = gameController.getGameMode();
      
      if (gameMode === 'ai') {
        if (state.currentPlayer === 'X') {
          turnIndicatorElement.textContent = "Your turn";
        } else {
          turnIndicatorElement.textContent = "AI is thinking...";
        }
      } else {
        turnIndicatorElement.textContent = `Player ${state.currentPlayer}'s turn`;
      }
      
      // Show battle mode info
      if (state.battleMode && battleInfo && turnsRemainingEl) {
        battleInfo.style.display = 'block';
        
        if (state.turnsRemaining > 1) {
          if (gameMode === 'ai') {
            const playerName = state.currentPlayer === 'X' ? 'You' : 'AI';
            turnsRemainingEl.textContent = `⚡ ${state.turnsRemaining} turns remaining for ${playerName}`;
          } else {
            turnsRemainingEl.textContent = `⚡ ${state.turnsRemaining} turns remaining for Player ${state.currentPlayer}`;
          }
        } else {
          if (gameMode === 'ai') {
            turnsRemainingEl.textContent = `💡 Capture AI's pieces (🆕 = protected, 🔒 = locked)`;
          } else {
            turnsRemainingEl.textContent = `💡 Capture pieces (🆕 = protected, 🔒 = locked)`;
          }
        }
      } else if (battleInfo) {
        battleInfo.style.display = 'none';
      }
    } else {
      const gameMode = gameController.getGameMode();
      
      if (state.gameStatus === 'won' && gameMode === 'ai') {
        if (state.winner === 'X') {
          turnIndicatorElement.textContent = 'You win!';
        } else {
          turnIndicatorElement.textContent = 'AI wins!';
        }
      } else {
        turnIndicatorElement.textContent = 'Game Over';
      }
      
      if (battleInfo) {
        battleInfo.style.display = 'none';
      }
    }
  }
  
  /**
   * Attaches event listeners to the UI elements
   */
  function attachEventListeners() {
    // Attach click handlers to cells
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      cell.addEventListener('click', () => handleCellClick(index));
    });
    
    // Attach click handler to new game button
    newGameButton.addEventListener('click', handleNewGameClick);
    
    // Attach game mode radio button handlers
    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
    gameModeRadios.forEach(radio => {
      radio.addEventListener('change', handleGameModeChange);
    });
    
    // Attach difficulty selector handler
    if (difficultySelect) {
      difficultySelect.addEventListener('change', handleDifficultyChange);
    }
    
    // Attach reset scores button handler
    if (resetScoresButton) {
      resetScoresButton.addEventListener('click', handleResetScores);
    }
    
    // Attach battle mode checkbox handler
    if (battleModeCheckbox) {
      battleModeCheckbox.addEventListener('change', handleBattleModeChange);
    }
  }
  
  /**
   * Handles cell click events
   * @param {number} index - Index of the clicked cell
   */
  function handleCellClick(index) {
    const state = stateManager.getState();
    
    // In battle mode, check if this is a capture move
    if (state.battleMode && gameController.canCapture(index)) {
      // Ask for confirmation for capture
      const opponent = state.currentPlayer === 'X' ? 'O' : 'X';
      const confirmed = confirm(
        `Capture this ${opponent} piece?\n\n` +
        `⚠️ Warning: Player ${opponent} will get 2 consecutive turns!`
      );
      
      if (confirmed) {
        gameController.makeMove(index, true); // Capture move
      }
    } else {
      // Normal move
      gameController.makeMove(index, false);
    }
  }
  
  /**
   * Handles new game button click
   */
  function handleNewGameClick() {
    gameController.resetGame();
  }
  
  /**
   * Handles game mode change
   */
  function handleGameModeChange(event) {
    const mode = event.target.value;
    gameController.setGameMode(mode);
    
    // Save game mode preference
    localStorage.setItem('gameMode', mode);
    
    // Show/hide difficulty selector
    if (difficultySelector) {
      difficultySelector.style.display = mode === 'ai' ? 'block' : 'none';
    }
    
    // Battle mode is available in both PvP and AI modes
    if (battleModeToggle) {
      battleModeToggle.style.display = 'block';
    }
  }
  
  /**
   * Handles battle mode toggle
   */
  function handleBattleModeChange(event) {
    const battleModeEnabled = event.target.checked;
    
    // Need to recreate state manager with battle mode
    // This is a limitation - we'll need to restart the game
    const confirmed = confirm(
      battleModeEnabled
        ? '⚔️ Enable Battle Mode?\n\nYou can capture opponent pieces, but they get 2 turns!\n\nThe current game will be reset.'
        : 'Disable Battle Mode?\n\nThe current game will be reset.'
    );
    
    if (confirmed) {
      // Trigger a game restart with new battle mode setting
      window.location.reload();
      // Store battle mode preference
      localStorage.setItem('battleMode', battleModeEnabled);
    } else {
      // Revert checkbox
      event.target.checked = !battleModeEnabled;
    }
  }
  
  /**
   * Handles difficulty change
   */
  function handleDifficultyChange(event) {
    const difficulty = event.target.value;
    gameController.setAIDifficulty(difficulty);
    gameController.resetGame();
  }
  
  /**
   * Handles reset scores button click
   */
  function handleResetScores() {
    const confirmed = confirm('Are you sure you want to reset the scoreboard?');
    
    if (confirmed) {
      const scoreboard = gameController.getScoreboard();
      scoreboard.resetScores();
      renderScoreboard();
    }
  }
  
  /**
   * Initializes the UI controller by subscribing to state changes
   */
  function init() {
    // Subscribe to state changes
    stateManager.subscribe((state) => {
      render(state);
    });
    
    // Attach event listeners
    attachEventListeners();
    
    // Initial render
    render(stateManager.getState());
  }
  
  return {
    render,
    attachEventListeners,
    init
  };
}
