// Property-based tests for state manager
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createStateManager } from '../src/stateManager.js';
import { createEmptyBoard } from '../src/gameLogic.js';

const positionArb = fc.integer({ min: 0, max: 8 });

describe('State Manager Properties', () => {
  // Feature: tic-tac-toe, Property 3: Player alternation
  it('Property 3: Player alternation - for any valid move, player switches correctly', () => {
    fc.assert(
      fc.property(positionArb, (position) => {
        const stateManager = createStateManager();
        const initialPlayer = stateManager.getState().currentPlayer;
        
        // Make a valid move
        const success = stateManager.makeMove(position);
        
        if (!success) return true; // Skip if move was invalid
        
        const newPlayer = stateManager.getState().currentPlayer;
        const expectedPlayer = initialPlayer === 'X' ? 'O' : 'X';
        
        // Verify player switched (unless game ended)
        const gameStatus = stateManager.getState().gameStatus;
        if (gameStatus === 'playing') {
          return newPlayer === expectedPlayer;
        }
        return true; // Game ended, player switching doesn't matter
      }),
      { numRuns: 100 }
    );
  });

  // Feature: tic-tac-toe, Property 5: Post-win move prevention
  it('Property 5: Post-win move prevention - for any winning board, additional moves are rejected', () => {
    fc.assert(
      fc.property(positionArb, (position) => {
        const stateManager = createStateManager();
        
        // Create a winning board state (top row for X)
        stateManager.makeMove(0); // X
        stateManager.makeMove(3); // O
        stateManager.makeMove(1); // X
        stateManager.makeMove(4); // O
        stateManager.makeMove(2); // X wins
        
        const state = stateManager.getState();
        expect(state.gameStatus).toBe('won');
        expect(state.winner).toBe('X');
        
        // Try to make another move
        const boardBefore = [...state.board];
        const success = stateManager.makeMove(position);
        const boardAfter = stateManager.getState().board;
        
        // Verify move was rejected and board unchanged
        return !success && JSON.stringify(boardBefore) === JSON.stringify(boardAfter);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: tic-tac-toe, Property 7: Post-draw move prevention
  it('Property 7: Post-draw move prevention - for any draw board, additional moves are rejected', () => {
    fc.assert(
      fc.property(positionArb, (position) => {
        const stateManager = createStateManager();
        
        // Create a draw board state
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
        
        const state = stateManager.getState();
        expect(state.gameStatus).toBe('draw');
        
        // Try to make another move (all positions are occupied anyway)
        const boardBefore = [...state.board];
        const success = stateManager.makeMove(position);
        const boardAfter = stateManager.getState().board;
        
        // Verify move was rejected and board unchanged
        return !success && JSON.stringify(boardBefore) === JSON.stringify(boardAfter);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: tic-tac-toe, Property 8, 9, 10: Game reset properties
  it('Property 8, 9, 10: Game reset - reset produces correct initial state and accepts moves', () => {
    fc.assert(
      fc.property(positionArb, (position) => {
        const stateManager = createStateManager();
        
        // Create a finished game (win or draw)
        stateManager.makeMove(0); // X
        stateManager.makeMove(3); // O
        stateManager.makeMove(1); // X
        stateManager.makeMove(4); // O
        stateManager.makeMove(2); // X wins
        
        // Reset the game
        stateManager.resetGame();
        const state = stateManager.getState();
        
        // Property 8: Board should be empty
        const boardIsEmpty = state.board.every(cell => cell === null);
        
        // Property 9: Current player should be X
        const playerIsX = state.currentPlayer === 'X';
        
        // Property 10: Should accept valid moves after reset
        const emptyBoard = createEmptyBoard();
        const canMakeMove = stateManager.makeMove(position);
        const moveWorked = canMakeMove === true;
        
        return boardIsEmpty && playerIsX && moveWorked;
      }),
      { numRuns: 100 }
    );
  });
});
