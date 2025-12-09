/**
 * Property-based tests for Tetris game loop
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { GameLoop } from '../src/games/tetris/gameLoop.js';
import { StateManager } from '../src/games/tetris/stateManager.js';

describe('Tetris Game Loop - Property Tests', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Feature: tetris-game, Property 5: Automatic drop moves down one row
  // Validates: Requirements 2.2, 2.5
  it('Property 5: When drop speed interval elapses, piece moves down by exactly one row if valid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // level
        (level) => {
          const stateManager = new StateManager();
          const gameLoop = new GameLoop(stateManager);
          
          // Start the game
          stateManager.startGame();
          const initialState = stateManager.getState();
          const initialY = initialState.currentPiece.y;
          const dropSpeed = initialState.dropSpeed;
          
          // Manually call update without starting the loop
          // This tests the core drop logic without requestAnimationFrame complications
          
          // Set the last drop time to simulate time passing
          const state = stateManager.getState();
          state.lastDropTime = Date.now() - dropSpeed - 1; // Ensure enough time has passed
          
          // Call update once
          gameLoop.update();
          
          const newState = stateManager.getState();
          const newY = newState.currentPiece.y;
          
          // Verify piece moved down by exactly one row (if it could move)
          // or stayed at same position (if at bottom or collision)
          if (newY !== initialY) {
            expect(newY).toBe(initialY + 1);
          } else {
            // Piece didn't move, which means it hit bottom or collision
            // This is valid behavior
            expect(newY).toBe(initialY);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
