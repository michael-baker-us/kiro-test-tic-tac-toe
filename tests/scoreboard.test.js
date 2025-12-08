// Unit tests for scoreboard
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createScoreboard } from '../src/scoreboard.js';

describe('Scoreboard', () => {
  let scoreboard;
  const STORAGE_KEY = 'tictactoe_scoreboard';
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    scoreboard = createScoreboard();
  });
  
  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });
  
  describe('Initial state', () => {
    it('should return default scores when no data exists', () => {
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(0);
      expect(scores.pvp.oWins).toBe(0);
      expect(scores.pvp.draws).toBe(0);
      expect(scores.ai.wins).toBe(0);
      expect(scores.ai.losses).toBe(0);
      expect(scores.ai.draws).toBe(0);
    });
  });
  
  describe('Recording PvP games', () => {
    it('should record X wins', () => {
      scoreboard.recordGame('pvp', 'X');
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(1);
      expect(scores.pvp.oWins).toBe(0);
      expect(scores.pvp.draws).toBe(0);
    });
    
    it('should record O wins', () => {
      scoreboard.recordGame('pvp', 'O');
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(0);
      expect(scores.pvp.oWins).toBe(1);
      expect(scores.pvp.draws).toBe(0);
    });
    
    it('should record draws', () => {
      scoreboard.recordGame('pvp', 'draw');
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(0);
      expect(scores.pvp.oWins).toBe(0);
      expect(scores.pvp.draws).toBe(1);
    });
    
    it('should accumulate multiple games', () => {
      scoreboard.recordGame('pvp', 'X');
      scoreboard.recordGame('pvp', 'O');
      scoreboard.recordGame('pvp', 'X');
      scoreboard.recordGame('pvp', 'draw');
      
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(2);
      expect(scores.pvp.oWins).toBe(1);
      expect(scores.pvp.draws).toBe(1);
    });
  });
  
  describe('Recording AI games', () => {
    it('should record player wins', () => {
      scoreboard.recordGame('ai', 'win');
      const scores = scoreboard.getScores();
      
      expect(scores.ai.wins).toBe(1);
      expect(scores.ai.losses).toBe(0);
      expect(scores.ai.draws).toBe(0);
    });
    
    it('should record AI wins (player losses)', () => {
      scoreboard.recordGame('ai', 'loss');
      const scores = scoreboard.getScores();
      
      expect(scores.ai.wins).toBe(0);
      expect(scores.ai.losses).toBe(1);
      expect(scores.ai.draws).toBe(0);
    });
    
    it('should record draws', () => {
      scoreboard.recordGame('ai', 'draw');
      const scores = scoreboard.getScores();
      
      expect(scores.ai.wins).toBe(0);
      expect(scores.ai.losses).toBe(0);
      expect(scores.ai.draws).toBe(1);
    });
    
    it('should accumulate multiple games', () => {
      scoreboard.recordGame('ai', 'win');
      scoreboard.recordGame('ai', 'loss');
      scoreboard.recordGame('ai', 'win');
      scoreboard.recordGame('ai', 'draw');
      
      const scores = scoreboard.getScores();
      
      expect(scores.ai.wins).toBe(2);
      expect(scores.ai.losses).toBe(1);
      expect(scores.ai.draws).toBe(1);
    });
  });
  
  describe('Persistence', () => {
    it('should persist scores to localStorage', () => {
      scoreboard.recordGame('pvp', 'X');
      scoreboard.recordGame('ai', 'win');
      
      // Create a new scoreboard instance
      const newScoreboard = createScoreboard();
      const scores = newScoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(1);
      expect(scores.ai.wins).toBe(1);
    });
    
    it('should handle corrupted localStorage data', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      
      const newScoreboard = createScoreboard();
      const scores = newScoreboard.getScores();
      
      // Should return default scores
      expect(scores.pvp.xWins).toBe(0);
      expect(scores.ai.wins).toBe(0);
    });
  });
  
  describe('Resetting scores', () => {
    it('should reset all scores', () => {
      scoreboard.recordGame('pvp', 'X');
      scoreboard.recordGame('pvp', 'O');
      scoreboard.recordGame('ai', 'win');
      scoreboard.recordGame('ai', 'loss');
      
      scoreboard.resetScores();
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(0);
      expect(scores.pvp.oWins).toBe(0);
      expect(scores.pvp.draws).toBe(0);
      expect(scores.ai.wins).toBe(0);
      expect(scores.ai.losses).toBe(0);
      expect(scores.ai.draws).toBe(0);
    });
    
    it('should reset only PvP scores', () => {
      scoreboard.recordGame('pvp', 'X');
      scoreboard.recordGame('ai', 'win');
      
      scoreboard.resetModeScores('pvp');
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(0);
      expect(scores.ai.wins).toBe(1);
    });
    
    it('should reset only AI scores', () => {
      scoreboard.recordGame('pvp', 'X');
      scoreboard.recordGame('ai', 'win');
      
      scoreboard.resetModeScores('ai');
      const scores = scoreboard.getScores();
      
      expect(scores.pvp.xWins).toBe(1);
      expect(scores.ai.wins).toBe(0);
    });
  });
});
