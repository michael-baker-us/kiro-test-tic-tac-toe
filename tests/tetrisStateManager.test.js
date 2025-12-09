/**
 * Unit tests for Tetris State Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager } from '../src/games/tetris/stateManager.js';

describe('Tetris State Manager - Unit Tests', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const state = stateManager.getState();
      
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
      expect(state.linesCleared).toBe(0);
      expect(state.gameStatus).toBe('playing');
      expect(state.board).toBeDefined();
      expect(state.board.length).toBe(20);
      expect(state.board[0].length).toBe(10);
      expect(state.currentPiece).toBeDefined();
      expect(state.nextPiece).toBeDefined();
      expect(state.dropSpeed).toBe(1000);
    });

    it('should have an empty board initially', () => {
      const state = stateManager.getState();
      const isEmpty = state.board.every(row => row.every(cell => cell === null));
      expect(isEmpty).toBe(true);
    });
  });

  describe('State Transitions', () => {
    it('should transition from playing to paused', () => {
      expect(stateManager.getState().gameStatus).toBe('playing');
      
      stateManager.pauseGame();
      expect(stateManager.getState().gameStatus).toBe('paused');
    });

    it('should transition from paused back to playing', () => {
      stateManager.pauseGame();
      expect(stateManager.getState().gameStatus).toBe('paused');
      
      stateManager.resumeGame();
      expect(stateManager.getState().gameStatus).toBe('playing');
    });

    it('should not pause when already paused', () => {
      stateManager.pauseGame();
      const stateBefore = stateManager.getState();
      
      stateManager.pauseGame();
      const stateAfter = stateManager.getState();
      
      expect(stateAfter.gameStatus).toBe('paused');
    });

    it('should not resume when already playing', () => {
      expect(stateManager.getState().gameStatus).toBe('playing');
      
      stateManager.resumeGame();
      expect(stateManager.getState().gameStatus).toBe('playing');
    });

    it('should transition to game over when spawn is blocked', () => {
      const state = stateManager.getState();
      
      // Block spawn area
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 10; col++) {
          state.board[row][col] = '#ff0000';
        }
      }
      
      stateManager.spawnNextPiece();
      expect(stateManager.getState().gameStatus).toBe('gameOver');
    });
  });

  describe('Observer Pattern', () => {
    it('should notify observers when state changes', () => {
      let notificationCount = 0;
      let lastState = null;
      
      stateManager.subscribe((state) => {
        notificationCount++;
        lastState = state;
      });
      
      stateManager.pauseGame();
      
      expect(notificationCount).toBe(1);
      expect(lastState.gameStatus).toBe('paused');
    });

    it('should support multiple observers', () => {
      let count1 = 0;
      let count2 = 0;
      
      stateManager.subscribe(() => count1++);
      stateManager.subscribe(() => count2++);
      
      stateManager.pauseGame();
      
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });

    it('should allow unsubscribing', () => {
      let count = 0;
      
      const unsubscribe = stateManager.subscribe(() => count++);
      
      stateManager.pauseGame();
      expect(count).toBe(1);
      
      unsubscribe();
      
      stateManager.resumeGame();
      expect(count).toBe(1); // Should not increment after unsubscribe
    });
  });

  describe('Piece Movement', () => {
    it('should move piece left when valid', () => {
      const stateBefore = stateManager.getState();
      const xBefore = stateBefore.currentPiece.x;
      
      const success = stateManager.movePiece(-1, 0);
      
      expect(success).toBe(true);
      expect(stateManager.getState().currentPiece.x).toBe(xBefore - 1);
    });

    it('should move piece right when valid', () => {
      const stateBefore = stateManager.getState();
      const xBefore = stateBefore.currentPiece.x;
      
      const success = stateManager.movePiece(1, 0);
      
      expect(success).toBe(true);
      expect(stateManager.getState().currentPiece.x).toBe(xBefore + 1);
    });

    it('should move piece down when valid', () => {
      const stateBefore = stateManager.getState();
      const yBefore = stateBefore.currentPiece.y;
      
      const success = stateManager.movePiece(0, 1);
      
      expect(success).toBe(true);
      expect(stateManager.getState().currentPiece.y).toBe(yBefore + 1);
    });

    it('should not move piece when paused', () => {
      stateManager.pauseGame();
      
      const stateBefore = stateManager.getState();
      const xBefore = stateBefore.currentPiece.x;
      
      const success = stateManager.movePiece(-1, 0);
      
      expect(success).toBe(false);
      expect(stateManager.getState().currentPiece.x).toBe(xBefore);
    });
  });

  describe('Piece Rotation', () => {
    it('should rotate piece clockwise when valid', () => {
      const stateBefore = stateManager.getState();
      const rotationBefore = stateBefore.currentPiece.rotation;
      
      const success = stateManager.rotatePiece('cw');
      
      if (stateBefore.currentPiece.type !== 'O') {
        // O-piece doesn't rotate
        expect(success).toBe(true);
        expect(stateManager.getState().currentPiece.rotation).toBe((rotationBefore + 1) % 4);
      }
    });

    it('should rotate piece counter-clockwise when valid', () => {
      const stateBefore = stateManager.getState();
      const rotationBefore = stateBefore.currentPiece.rotation;
      
      const success = stateManager.rotatePiece('ccw');
      
      if (stateBefore.currentPiece.type !== 'O') {
        // O-piece doesn't rotate
        expect(success).toBe(true);
        expect(stateManager.getState().currentPiece.rotation).toBe((rotationBefore + 3) % 4);
      }
    });

    it('should not rotate piece when paused', () => {
      stateManager.pauseGame();
      
      const stateBefore = stateManager.getState();
      const rotationBefore = stateBefore.currentPiece.rotation;
      
      const success = stateManager.rotatePiece('cw');
      
      expect(success).toBe(false);
      expect(stateManager.getState().currentPiece.rotation).toBe(rotationBefore);
    });
  });

  describe('Hard Drop', () => {
    it('should move piece to bottom and lock it', () => {
      const stateBefore = stateManager.getState();
      const scoreBefore = stateBefore.score;
      
      stateManager.hardDrop();
      
      const stateAfter = stateManager.getState();
      
      // Score should have increased (hard drop scoring)
      expect(stateAfter.score).toBeGreaterThan(scoreBefore);
      
      // A new piece should have spawned (since the piece was locked)
      expect(stateAfter.currentPiece.y).toBe(0);
    });

    it('should not execute hard drop when paused', () => {
      stateManager.pauseGame();
      
      const stateBefore = stateManager.getState();
      const scoreBefore = stateBefore.score;
      
      stateManager.hardDrop();
      
      expect(stateManager.getState().score).toBe(scoreBefore);
    });
  });

  describe('Score and Level Updates', () => {
    it('should update score', () => {
      stateManager.updateScore(100);
      expect(stateManager.getState().score).toBe(100);
      
      stateManager.updateScore(50);
      expect(stateManager.getState().score).toBe(150);
    });

    it('should update level when lines cleared reaches threshold', () => {
      stateManager.state.linesCleared = 10;
      stateManager.updateLevel();
      
      expect(stateManager.getState().level).toBe(2);
    });

    it('should update drop speed when level changes', () => {
      stateManager.state.linesCleared = 10;
      stateManager.updateLevel();
      
      const state = stateManager.getState();
      expect(state.level).toBe(2);
      expect(state.dropSpeed).toBe(900); // 1000 - (2-1)*100
    });
  });

});
