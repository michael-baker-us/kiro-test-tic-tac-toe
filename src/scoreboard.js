// Scoreboard module - tracks game statistics
const STORAGE_KEY = 'tictactoe_scoreboard';

/**
 * Creates a scoreboard manager
 * @returns {Object} Scoreboard with methods to track and manage scores
 */
export function createScoreboard() {
  /**
   * Gets the current scores from localStorage
   * @returns {Object} Scores object with wins, losses, draws
   */
  function getScores() {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // If parsing fails, return default scores
        return getDefaultScores();
      }
    }
    
    return getDefaultScores();
  }
  
  /**
   * Gets default scores structure
   */
  function getDefaultScores() {
    return {
      pvp: {
        xWins: 0,
        oWins: 0,
        draws: 0
      },
      ai: {
        wins: 0,
        losses: 0,
        draws: 0
      }
    };
  }
  
  /**
   * Saves scores to localStorage
   * @param {Object} scores - Scores object to save
   */
  function saveScores(scores) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }
  
  /**
   * Records a game result
   * @param {string} gameMode - 'pvp' or 'ai'
   * @param {string} result - 'X', 'O', 'draw', 'win', or 'loss'
   */
  function recordGame(gameMode, result) {
    const scores = getScores();
    
    if (gameMode === 'pvp') {
      if (result === 'X') {
        scores.pvp.xWins++;
      } else if (result === 'O') {
        scores.pvp.oWins++;
      } else if (result === 'draw') {
        scores.pvp.draws++;
      }
    } else if (gameMode === 'ai') {
      if (result === 'win') {
        scores.ai.wins++;
      } else if (result === 'loss') {
        scores.ai.losses++;
      } else if (result === 'draw') {
        scores.ai.draws++;
      }
    }
    
    saveScores(scores);
  }
  
  /**
   * Resets all scores
   */
  function resetScores() {
    const defaultScores = getDefaultScores();
    saveScores(defaultScores);
  }
  
  /**
   * Resets scores for a specific game mode
   * @param {string} gameMode - 'pvp' or 'ai'
   */
  function resetModeScores(gameMode) {
    const scores = getScores();
    
    if (gameMode === 'pvp') {
      scores.pvp = getDefaultScores().pvp;
    } else if (gameMode === 'ai') {
      scores.ai = getDefaultScores().ai;
    }
    
    saveScores(scores);
  }
  
  return {
    getScores,
    recordGame,
    resetScores,
    resetModeScores
  };
}
