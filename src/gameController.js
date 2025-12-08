// Game controller - manages game mode and AI
import { createAIPlayer } from './aiPlayer.js';
import { createScoreboard } from './scoreboard.js';

/**
 * Creates a game controller that manages PvP and AI modes
 * @param {Object} stateManager - The state manager instance
 * @returns {Object} Game controller with mode management
 */
export function createGameController(stateManager) {
  let gameMode = 'pvp'; // 'pvp' or 'ai'
  let aiPlayer = null;
  let aiDifficulty = 'medium';
  let isAIThinking = false;
  const scoreboard = createScoreboard();
  
  // Subscribe to state changes to record game results
  stateManager.subscribe((state) => {
    if (state.gameStatus === 'won') {
      if (gameMode === 'pvp') {
        scoreboard.recordGame('pvp', state.winner);
      } else if (gameMode === 'ai') {
        // In AI mode, X is the player, O is the AI
        if (state.winner === 'X') {
          scoreboard.recordGame('ai', 'win');
        } else {
          scoreboard.recordGame('ai', 'loss');
        }
      }
    } else if (state.gameStatus === 'draw') {
      scoreboard.recordGame(gameMode, 'draw');
    }
  });
  
  /**
   * Sets the game mode
   * @param {string} mode - 'pvp' or 'ai'
   */
  function setGameMode(mode) {
    gameMode = mode;
    
    if (mode === 'ai') {
      aiPlayer = createAIPlayer(aiDifficulty);
    } else {
      aiPlayer = null;
    }
    
    // Reset game when mode changes
    stateManager.resetGame();
  }
  
  /**
   * Sets the AI difficulty
   * @param {string} difficulty - 'easy', 'medium', or 'hard'
   */
  function setAIDifficulty(difficulty) {
    aiDifficulty = difficulty;
    
    if (gameMode === 'ai') {
      aiPlayer = createAIPlayer(difficulty);
    }
  }
  
  /**
   * Makes a move (handles both human and AI)
   * @param {number} position - Position to play
   * @param {boolean} isCapture - Whether this is a capture move (battle mode)
   * @returns {boolean} True if move was successful
   */
  function makeMove(position, isCapture = false) {
    // Don't allow moves while AI is thinking
    if (isAIThinking) {
      return false;
    }
    
    const state = stateManager.getState();
    
    // In AI mode, human is always X and plays first
    if (gameMode === 'ai' && state.currentPlayer === 'O') {
      return false; // Don't allow human to play as O in AI mode
    }
    
    // Make the human move
    const success = stateManager.makeMove(position, isCapture);
    
    // If successful and in AI mode, trigger AI move
    if (success && gameMode === 'ai') {
      const newState = stateManager.getState();
      
      // Only make AI move if game is still playing
      if (newState.gameStatus === 'playing' && newState.currentPlayer === 'O') {
        makeAIMove();
      }
    }
    
    return success;
  }
  
  /**
   * Checks if a position can be captured (battle mode)
   * @param {number} position - Position to check
   * @returns {boolean} True if position can be captured
   */
  function canCapture(position) {
    return stateManager.canCapture(position);
  }
  
  /**
   * Makes an AI move with a slight delay for better UX
   */
  function makeAIMove() {
    isAIThinking = true;
    
    // Add a small delay so the AI doesn't move instantly
    setTimeout(() => {
      const state = stateManager.getState();
      
      if (state.gameStatus === 'playing' && aiPlayer && state.currentPlayer === 'O') {
        const battleModeState = {
          lockedPositions: state.lockedPositions || [],
          lastPlacedPosition: state.lastPlacedPosition
        };
        const moveDecision = aiPlayer.getMove(state.board, 'O', state.battleMode, battleModeState);
        
        if (moveDecision !== null) {
          // moveDecision is an object with { position, isCapture }
          const { position, isCapture } = moveDecision;
          stateManager.makeMove(position, isCapture);
          
          // Check if AI still has more turns (battle mode)
          const newState = stateManager.getState();
          if (newState.gameStatus === 'playing' && 
              newState.currentPlayer === 'O' && 
              newState.turnsRemaining > 0) {
            // AI has another turn, make it after a delay
            isAIThinking = false;
            makeAIMove();
            return;
          }
        }
      }
      
      isAIThinking = false;
    }, 500); // 500ms delay
  }
  
  /**
   * Resets the game
   */
  function resetGame() {
    stateManager.resetGame();
  }
  
  /**
   * Gets the current game mode
   */
  function getGameMode() {
    return gameMode;
  }
  
  /**
   * Gets the AI difficulty
   */
  function getAIDifficulty() {
    return aiDifficulty;
  }
  
  /**
   * Checks if AI is currently thinking
   */
  function isAITurn() {
    return isAIThinking;
  }
  
  /**
   * Gets the scoreboard instance
   */
  function getScoreboard() {
    return scoreboard;
  }
  
  return {
    setGameMode,
    setAIDifficulty,
    makeMove,
    resetGame,
    getGameMode,
    getAIDifficulty,
    isAITurn,
    getScoreboard,
    canCapture
  };
}
