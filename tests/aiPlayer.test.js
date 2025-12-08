// Unit tests for AI player
import { describe, it, expect } from 'vitest';
import { createAIPlayer } from '../src/aiPlayer.js';
import { createEmptyBoard, makeMove } from '../src/gameLogic.js';

describe('AI Player', () => {
  describe('Easy difficulty', () => {
    it('should make a valid move', () => {
      const ai = createAIPlayer('easy');
      const board = createEmptyBoard();
      const moveDecision = ai.getMove(board, 'O');
      
      expect(moveDecision).not.toBe(null);
      expect(moveDecision.position).toBeGreaterThanOrEqual(0);
      expect(moveDecision.position).toBeLessThanOrEqual(8);
      expect(moveDecision.isCapture).toBe(false);
    });
    
    it('should return null when no moves available', () => {
      const ai = createAIPlayer('easy');
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      const move = ai.getMove(board, 'O');
      
      expect(move).toBe(null);
    });
  });
  
  describe('Medium difficulty', () => {
    it('should take winning move when available', () => {
      const ai = createAIPlayer('medium');
      // O can win at position 2
      const board = ['O', 'O', null, 'X', 'X', null, null, null, null];
      const moveDecision = ai.getMove(board, 'O');
      
      expect(moveDecision.position).toBe(2);
    });
    
    it('should block opponent winning move', () => {
      const ai = createAIPlayer('medium');
      // X is about to win at position 2, O should block
      const board = ['X', 'X', null, 'O', null, null, null, null, null];
      const moveDecision = ai.getMove(board, 'O');
      
      expect(moveDecision.position).toBe(2);
    });
    
    it('should prefer center when available', () => {
      const ai = createAIPlayer('medium');
      const board = ['X', null, null, null, null, null, null, null, null];
      const moveDecision = ai.getMove(board, 'O');
      
      expect(moveDecision.position).toBe(4);
    });
  });
  
  describe('Hard difficulty', () => {
    it('should never lose - take winning move', () => {
      const ai = createAIPlayer('hard');
      // O can win at position 2
      const board = ['O', 'O', null, 'X', 'X', null, null, null, null];
      const moveDecision = ai.getMove(board, 'O');
      
      expect(moveDecision.position).toBe(2);
    });
    
    it('should never lose - block opponent', () => {
      const ai = createAIPlayer('hard');
      // X is about to win at position 2
      const board = ['X', 'X', null, 'O', null, null, null, null, null];
      const moveDecision = ai.getMove(board, 'O');
      
      expect(moveDecision.position).toBe(2);
    });
    
    it('should make optimal first move', () => {
      const ai = createAIPlayer('hard');
      const board = createEmptyBoard();
      const moveDecision = ai.getMove(board, 'O');
      
      // Optimal first moves are center or corners
      const optimalMoves = [0, 2, 4, 6, 8];
      expect(optimalMoves).toContain(moveDecision.position);
    });
  });
  
  describe('Battle Mode', () => {
    it('should return capture decision when capturing wins immediately', () => {
      const ai = createAIPlayer('medium');
      // O has two pieces, X has one at position 2
      // If O captures X at 2, O wins
      const board = ['O', 'O', 'X', null, null, null, null, null, null];
      const moveDecision = ai.getMove(board, 'O', true);
      
      expect(moveDecision.position).toBe(2);
      expect(moveDecision.isCapture).toBe(true);
    });
    
    it('should make normal moves when no strategic captures available', () => {
      const ai = createAIPlayer('easy');
      const board = ['X', null, null, null, null, null, null, null, null];
      const moveDecision = ai.getMove(board, 'O', true);
      
      // Should make a normal move (not capture the X at position 0 in early game)
      expect(moveDecision).not.toBe(null);
      expect(moveDecision.position).toBeGreaterThanOrEqual(0);
      expect(moveDecision.position).toBeLessThanOrEqual(8);
    });
    
    it('should work without battle mode (backward compatibility)', () => {
      const ai = createAIPlayer('medium');
      const board = createEmptyBoard();
      const moveDecision = ai.getMove(board, 'O', false);
      
      expect(moveDecision.position).toBeGreaterThanOrEqual(0);
      expect(moveDecision.position).toBeLessThanOrEqual(8);
      expect(moveDecision.isCapture).toBe(false);
    });
  });
});
