// Unit tests for battle mode
import { describe, it, expect, beforeEach } from 'vitest';
import { createStateManager } from '../src/games/tic-tac-toe/stateManager.js';

describe('Battle Mode', () => {
  let stateManager;
  
  beforeEach(() => {
    stateManager = createStateManager({ battleMode: true });
  });
  
  describe('Normal moves', () => {
    it('should allow normal moves on empty cells', () => {
      const success = stateManager.makeMove(0, false);
      const state = stateManager.getState();
      
      expect(success).toBe(true);
      expect(state.board[0]).toBe('X');
      expect(state.currentPlayer).toBe('O');
    });
    
    it('should not consume extra turns for normal moves', () => {
      stateManager.makeMove(0, false); // X
      stateManager.makeMove(1, false); // O
      
      const state = stateManager.getState();
      expect(state.currentPlayer).toBe('X');
      expect(state.turnsRemaining).toBe(1);
    });
  });
  
  describe('Capture moves', () => {
    it('should allow capturing opponent pieces (not last placed)', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2 (now 0 is capturable)
      
      // O captures X's piece at position 0 (not the last placed)
      const success = stateManager.makeMove(0, true);
      const state = stateManager.getState();
      
      expect(success).toBe(true);
      expect(state.board[0]).toBe('O');
      expect(state.currentPlayer).toBe('X');
      expect(state.turnsRemaining).toBe(2);
    });
    
    it('should not allow capturing own pieces', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      
      // X tries to capture own piece at 0
      const success = stateManager.makeMove(0, true);
      
      expect(success).toBe(false);
    });
    
    it('should not allow capturing empty cells', () => {
      const success = stateManager.makeMove(0, true);
      
      expect(success).toBe(false);
    });
    
    it('should give opponent 2 consecutive turns after capture', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2
      stateManager.makeMove(0, true);  // O captures at 0
      
      let state = stateManager.getState();
      expect(state.currentPlayer).toBe('X');
      expect(state.turnsRemaining).toBe(2);
      
      // X makes first move
      stateManager.makeMove(3, false);
      state = stateManager.getState();
      expect(state.currentPlayer).toBe('X');
      expect(state.turnsRemaining).toBe(1);
      
      // X makes second move
      stateManager.makeMove(4, false);
      state = stateManager.getState();
      expect(state.currentPlayer).toBe('O');
      expect(state.turnsRemaining).toBe(1);
    });
  });
  
  describe('canCapture method', () => {
    it('should return true for opponent pieces (not last placed)', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2
      
      // O's turn, can capture X at position 0 (not the last placed)
      expect(stateManager.canCapture(0)).toBe(true);
    });
    
    it('should return false for own pieces', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      
      // X's turn, cannot capture own piece at position 0
      expect(stateManager.canCapture(0)).toBe(false);
    });
    
    it('should return false for empty cells', () => {
      expect(stateManager.canCapture(0)).toBe(false);
    });
    
    it('should return false when game is over', () => {
      // Create a winning scenario
      stateManager.makeMove(0, false); // X
      stateManager.makeMove(3, false); // O
      stateManager.makeMove(1, false); // X
      stateManager.makeMove(4, false); // O
      stateManager.makeMove(2, false); // X wins
      
      const state = stateManager.getState();
      expect(state.gameStatus).toBe('won');
      expect(stateManager.canCapture(3)).toBe(false);
    });
  });
  
  describe('Win detection with captures', () => {
    it('should detect win after capture', () => {
      // Set up a scenario where capture creates a win
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(3, false); // O at 3
      stateManager.makeMove(1, false); // X at 1
      stateManager.makeMove(4, false); // O at 4
      
      // X captures O at position 4, but doesn't win yet
      stateManager.makeMove(4, true); // X captures at 4
      let state = stateManager.getState();
      expect(state.gameStatus).toBe('playing');
      
      // O gets 2 turns
      stateManager.makeMove(5, false); // O at 5
      stateManager.makeMove(6, false); // O at 6
      
      // X captures O at position 5 to complete row
      stateManager.makeMove(2, false); // X at 2 - wins!
      state = stateManager.getState();
      expect(state.gameStatus).toBe('won');
      expect(state.winner).toBe('X');
    });
  });
  
  describe('Battle mode disabled', () => {
    it('should not allow captures when battle mode is off', () => {
      const normalStateManager = createStateManager({ battleMode: false });
      
      normalStateManager.makeMove(0, false); // X at 0
      normalStateManager.makeMove(1, false); // O at 1
      
      // Try to capture - should fail
      const success = normalStateManager.makeMove(1, true);
      expect(success).toBe(false);
      
      // canCapture should return false
      expect(normalStateManager.canCapture(1)).toBe(false);
    });
  });
  
  describe('Last placed position protection', () => {
    it('should track the last placed position', () => {
      stateManager.makeMove(0, false); // X at 0
      
      let state = stateManager.getState();
      expect(state.lastPlacedPosition).toBe(0);
      
      stateManager.makeMove(1, false); // O at 1
      state = stateManager.getState();
      expect(state.lastPlacedPosition).toBe(1);
    });
    
    it('should not allow capturing the last placed position', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1 (last placed)
      
      // X tries to capture the last placed position (1) - should fail
      const success = stateManager.makeMove(1, true);
      expect(success).toBe(false);
      
      const state = stateManager.getState();
      expect(state.board[1]).toBe('O'); // Still O's piece
    });
    
    it('should allow capturing older positions', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2 (now last placed)
      
      // O can capture position 0 (not the last placed)
      expect(stateManager.canCapture(0)).toBe(true);
      const success = stateManager.makeMove(0, true);
      expect(success).toBe(true);
      
      const state = stateManager.getState();
      expect(state.board[0]).toBe('O');
    });
    
    it('should not show last placed position as capturable', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1 (last placed)
      
      // X's turn now
      // Position 1 should not be capturable (it's the last placed)
      expect(stateManager.canCapture(1)).toBe(false);
      
      // Make another move so position 0 is no longer last placed
      stateManager.makeMove(2, false); // X at 2 (now last placed)
      
      // O's turn now
      // Position 0 should be capturable (it's not the last placed)
      expect(stateManager.canCapture(0)).toBe(true);
    });
    
    it('should update last placed position after capture', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2
      
      // O captures position 0
      stateManager.makeMove(0, true); // O captures at 0 (now last placed)
      
      let state = stateManager.getState();
      expect(state.lastPlacedPosition).toBe(0);
      
      // X gets 2 turns, makes a move
      stateManager.makeMove(3, false); // X at 3 (now last placed)
      state = stateManager.getState();
      expect(state.lastPlacedPosition).toBe(3);
    });
    
    it('should reset last placed position on game reset', () => {
      stateManager.makeMove(0, false); // X at 0
      
      let state = stateManager.getState();
      expect(state.lastPlacedPosition).toBe(0);
      
      stateManager.resetGame();
      state = stateManager.getState();
      expect(state.lastPlacedPosition).toBe(null);
    });
  });
  
  describe('Locked positions (no recapture)', () => {
    it('should lock a position after capture', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2 (last placed)
      stateManager.makeMove(0, true);  // O captures at 0 (not last placed)
      
      const state = stateManager.getState();
      expect(state.lockedPositions).toContain(0);
    });
    
    it('should not allow recapturing a locked position', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2
      stateManager.makeMove(0, true);  // O captures at 0 (now locked)
      
      // X gets 2 turns
      stateManager.makeMove(3, false); // X at 3
      stateManager.makeMove(4, false); // X at 4
      
      // O tries to recapture position 0 - should fail
      const success = stateManager.makeMove(0, true);
      expect(success).toBe(false);
      
      const state = stateManager.getState();
      expect(state.board[0]).toBe('O'); // Still O's piece
    });
    
    it('should not show locked positions as capturable', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2
      stateManager.makeMove(0, true);  // O captures at 0 (now locked)
      
      // X gets 2 turns
      stateManager.makeMove(3, false); // X at 3
      stateManager.makeMove(4, false); // X at 4
      
      // Position 0 should not be capturable even though it has O
      expect(stateManager.canCapture(0)).toBe(false);
    });
    
    it('should allow capturing non-locked opponent pieces', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2
      stateManager.makeMove(0, true);  // O captures at 0 (locked)
      
      // X gets 2 turns
      stateManager.makeMove(3, false); // X at 3
      stateManager.makeMove(4, false); // X at 4
      
      // O places at 5
      stateManager.makeMove(5, false); // O at 5
      
      // X should be able to capture O at position 1 (not locked, not last placed)
      expect(stateManager.canCapture(1)).toBe(true);
      const success = stateManager.makeMove(1, true);
      expect(success).toBe(true);
      
      const state = stateManager.getState();
      expect(state.board[1]).toBe('X');
      expect(state.lockedPositions).toContain(0);
      expect(state.lockedPositions).toContain(1);
    });
    
    it('should reset locked positions on game reset', () => {
      stateManager.makeMove(0, false); // X at 0
      stateManager.makeMove(1, false); // O at 1
      stateManager.makeMove(2, false); // X at 2
      stateManager.makeMove(0, true);  // O captures at 0 (locked)
      
      let state = stateManager.getState();
      expect(state.lockedPositions.length).toBe(1);
      
      stateManager.resetGame();
      state = stateManager.getState();
      expect(state.lockedPositions.length).toBe(0);
    });
  });
});
