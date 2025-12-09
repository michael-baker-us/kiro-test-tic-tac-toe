/**
 * Property-based tests for Tetris State Manager
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { StateManager, calculateDropSpeed } from '../src/games/tetris/stateManager.js';

describe('Tetris State Manager - Property Tests', () => {
  
  // Feature: tetris-game, Property 4: Piece spawns at correct position
  // Validates: Requirements 2.1
  describe('Property 4: Piece spawns at correct position', () => {
    it('should spawn pieces at top-center position (x=3 for most, x=4 for O, y=0)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // Number of spawns to test
          (iterations) => {
            const stateManager = new StateManager();
            
            for (let i = 0; i < Math.min(iterations, 50); i++) {
              const state = stateManager.getState();
              const piece = state.currentPiece;
              
              // Check spawn position based on piece type
              if (piece.type === 'O') {
                expect(piece.x).toBe(4);
              } else {
                expect(piece.x).toBe(3);
              }
              expect(piece.y).toBe(0);
              expect(piece.rotation).toBe(0);
              
              // Spawn next piece
              stateManager.spawnNextPiece();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: tetris-game, Property 6: Blocked spawn triggers game over
  // Validates: Requirements 2.4
  describe('Property 6: Blocked spawn triggers game over', () => {
    it('should trigger game over when spawn position is blocked', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('I', 'O', 'T', 'S', 'Z', 'J', 'L'), // Piece type
          (pieceType) => {
            const stateManager = new StateManager();
            const state = stateManager.getState();
            
            // Block the spawn area by filling top rows
            for (let row = 0; row < 4; row++) {
              for (let col = 0; col < 10; col++) {
                state.board[row][col] = '#ff0000'; // Fill with red
              }
            }
            
            // Force the next piece to be the test piece type
            state.nextPiece.type = pieceType;
            
            // Try to spawn - should fail and trigger game over
            const spawnSuccess = stateManager.spawnNextPiece();
            const newState = stateManager.getState();
            
            expect(spawnSuccess).toBe(false);
            expect(newState.gameStatus).toBe('gameOver');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: tetris-game, Property 11: Level progression
  // Validates: Requirements 4.2
  describe('Property 11: Level progression', () => {
    it('should calculate level as 1 + floor(totalLinesCleared / 10)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 200 }), // Total lines cleared
          (totalLines) => {
            const stateManager = new StateManager();
            
            // Directly set lines cleared in the internal state
            stateManager.state.linesCleared = totalLines;
            
            // Update level
            stateManager.updateLevel();
            
            const newState = stateManager.getState();
            const expectedLevel = 1 + Math.floor(totalLines / 10);
            
            expect(newState.level).toBe(expectedLevel);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: tetris-game, Property 12: Drop speed formula
  // Validates: Requirements 4.3, 4.4
  describe('Property 12: Drop speed formula', () => {
    it('should calculate drop speed as max(100, 1000 - (level - 1) * 100)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // Level
          (level) => {
            const dropSpeed = calculateDropSpeed(level);
            const expectedSpeed = Math.max(100, 1000 - (level - 1) * 100);
            
            expect(dropSpeed).toBe(expectedSpeed);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: tetris-game, Property 13: Next piece advances in sequence
  // Validates: Requirements 5.3
  describe('Property 13: Next piece advances in sequence', () => {
    it('should make previous next piece become current piece when spawning', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // Number of spawns to test
          (numSpawns) => {
            const stateManager = new StateManager();
            
            for (let i = 0; i < numSpawns; i++) {
              const stateBefore = stateManager.getState();
              const previousNextPiece = stateBefore.nextPiece.type;
              
              // Spawn next piece
              const success = stateManager.spawnNextPiece();
              
              if (!success) {
                // Game over, stop testing
                break;
              }
              
              const stateAfter = stateManager.getState();
              
              // Previous next piece should now be current piece
              expect(stateAfter.currentPiece.type).toBe(previousNextPiece);
              
              // Next piece should be different (a new piece was generated)
              expect(stateAfter.nextPiece).toBeDefined();
              expect(stateAfter.nextPiece.type).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: tetris-game, Property 14: Pause prevents state changes
  // Validates: Requirements 7.2
  describe('Property 14: Pause prevents state changes', () => {
    it('should not modify board, piece position, or score when paused', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('left', 'right', 'down', 'rotateCW', 'rotateCCW'), // Action type
          (action) => {
            const stateManager = new StateManager();
            
            // Pause the game
            stateManager.pauseGame();
            
            const stateBefore = stateManager.getState();
            const boardBefore = JSON.stringify(stateBefore.board);
            const pieceBefore = { ...stateBefore.currentPiece };
            const scoreBefore = stateBefore.score;
            
            // Try to perform actions
            switch (action) {
              case 'left':
                stateManager.movePiece(-1, 0);
                break;
              case 'right':
                stateManager.movePiece(1, 0);
                break;
              case 'down':
                stateManager.movePiece(0, 1);
                break;
              case 'rotateCW':
                stateManager.rotatePiece('cw');
                break;
              case 'rotateCCW':
                stateManager.rotatePiece('ccw');
                break;
            }
            
            const stateAfter = stateManager.getState();
            const boardAfter = JSON.stringify(stateAfter.board);
            
            // State should be unchanged
            expect(stateAfter.gameStatus).toBe('paused');
            expect(boardAfter).toBe(boardBefore);
            expect(stateAfter.currentPiece.x).toBe(pieceBefore.x);
            expect(stateAfter.currentPiece.y).toBe(pieceBefore.y);
            expect(stateAfter.currentPiece.rotation).toBe(pieceBefore.rotation);
            expect(stateAfter.score).toBe(scoreBefore);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: tetris-game, Property 18: Game reset returns to initial state
  // Validates: Requirements 10.3, 10.4
  describe('Property 18: Game reset returns to initial state', () => {
    it('should reset to initial state with empty board, score=0, level=1, linesCleared=0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // Score to set
          fc.integer({ min: 1, max: 20 }), // Level to set
          fc.integer({ min: 0, max: 200 }), // Lines cleared to set
          (score, level, linesCleared) => {
            const stateManager = new StateManager();
            
            // Modify state to non-initial values
            stateManager.state.score = score;
            stateManager.state.level = level;
            stateManager.state.linesCleared = linesCleared;
            stateManager.state.gameStatus = 'gameOver';
            
            // Fill some board cells
            stateManager.state.board[19][0] = '#ff0000';
            stateManager.state.board[19][1] = '#00ff00';
            
            // Reset the game
            stateManager.resetGame();
            
            const stateAfter = stateManager.getState();
            
            // Check initial state values
            expect(stateAfter.score).toBe(0);
            expect(stateAfter.level).toBe(1);
            expect(stateAfter.linesCleared).toBe(0);
            expect(stateAfter.gameStatus).toBe('playing');
            
            // Check board is empty
            const isEmpty = stateAfter.board.every(row => 
              row.every(cell => cell === null)
            );
            expect(isEmpty).toBe(true);
            
            // Check piece spawned
            expect(stateAfter.currentPiece).toBeDefined();
            expect(stateAfter.currentPiece.y).toBe(0);
            expect(stateAfter.nextPiece).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

});
