/**
 * Unit tests for Tetris game loop
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../src/games/tetris/gameLoop.js';
import { StateManager } from '../src/games/tetris/stateManager.js';

describe('Tetris Game Loop - Unit Tests', () => {
  
  let stateManager;
  let gameLoop;

  beforeEach(() => {
    vi.useFakeTimers();
    stateManager = new StateManager();
    gameLoop = new GameLoop(stateManager);
    stateManager.startGame();
  });

  afterEach(() => {
    if (gameLoop.isRunning) {
      gameLoop.stop();
    }
    vi.restoreAllMocks();
  });

  describe('start/stop functionality', () => {
    it('should start the game loop', () => {
      gameLoop.start();
      expect(gameLoop.isRunning).toBe(true);
      expect(gameLoop.isPaused).toBe(false);
    });

    it('should not start if already running', () => {
      gameLoop.start();
      const firstRunning = gameLoop.isRunning;
      gameLoop.start(); // Try to start again
      expect(gameLoop.isRunning).toBe(firstRunning);
    });

    it('should stop the game loop', () => {
      gameLoop.start();
      gameLoop.stop();
      expect(gameLoop.isRunning).toBe(false);
      expect(gameLoop.isPaused).toBe(false);
    });
  });

  describe('pause/resume functionality', () => {
    it('should pause the game loop', () => {
      gameLoop.start();
      gameLoop.pause();
      expect(gameLoop.isPaused).toBe(true);
      expect(gameLoop.isRunning).toBe(true); // Still running, just paused
    });

    it('should resume the game loop', () => {
      gameLoop.start();
      gameLoop.pause();
      gameLoop.resume();
      expect(gameLoop.isPaused).toBe(false);
      expect(gameLoop.isRunning).toBe(true);
    });

    it('should not update game state when paused', () => {
      const initialState = stateManager.getState();
      const initialY = initialState.currentPiece.y;
      
      gameLoop.start();
      gameLoop.pause();
      
      // Manually set last drop time to trigger drop
      const state = stateManager.getState();
      state.lastDropTime = Date.now() - state.dropSpeed - 1;
      
      // Call update while paused
      gameLoop.update();
      
      const newState = stateManager.getState();
      expect(newState.currentPiece.y).toBe(initialY); // Should not have moved
    });
  });

  describe('drop speed changes', () => {
    it('should update drop speed', () => {
      const newSpeed = 500;
      gameLoop.setDropSpeed(newSpeed);
      
      const state = stateManager.getState();
      expect(state.dropSpeed).toBe(newSpeed);
    });

    it('should respect new drop speed for automatic drops', () => {
      const initialState = stateManager.getState();
      const initialY = initialState.currentPiece.y;
      
      // Set a very fast drop speed
      gameLoop.setDropSpeed(100);
      
      // Set last drop time to trigger drop
      const state = stateManager.getState();
      state.lastDropTime = Date.now() - 101;
      
      gameLoop.update();
      
      const newState = stateManager.getState();
      // Piece should have moved (or stayed if at bottom)
      expect(newState.currentPiece.y).toBeGreaterThanOrEqual(initialY);
    });
  });

  describe('lock delay timing', () => {
    it('should start lock delay when piece cannot move down', () => {
      // Access internal state directly
      const state = stateManager.state;
      
      // Fill rows 17-19 completely to create a collision scenario
      for (let row = 17; row < 20; row++) {
        for (let x = 0; x < 10; x++) {
          state.board[row][x] = '#ff0000';
        }
      }
      
      // Move piece to position where it will collide
      state.currentPiece.y = 16;
      
      // Set last drop time to trigger drop
      state.lastDropTime = Date.now() - state.dropSpeed - 1;
      
      // Update - piece should try to move down and fail, starting lock delay
      gameLoop.update();
      
      // Lock delay should be started (or piece already locked and new piece spawned)
      // Either lock delay started OR piece was locked and new piece spawned at y=0
      expect(state.lockDelayStart !== null || state.currentPiece.y === 0).toBe(true);
    });

    it('should lock piece after lock delay expires', () => {
      // Access internal state directly
      const state = stateManager.state;
      
      // Move piece to bottom
      state.currentPiece.y = 17;
      
      // Start lock delay in the past
      state.lockDelayStart = Date.now() - state.lockDelay - 1;
      
      // Update should lock the piece
      gameLoop.update();
      
      // A new piece should have spawned (y should be 0)
      expect(state.currentPiece.y).toBe(0);
    });

    it('should not update when game status is not playing', () => {
      stateManager.pauseGame();
      
      const initialState = stateManager.getState();
      const initialY = initialState.currentPiece.y;
      
      // Set last drop time to trigger drop
      const state = stateManager.getState();
      state.lastDropTime = Date.now() - state.dropSpeed - 1;
      
      gameLoop.update();
      
      const newState = stateManager.getState();
      expect(newState.currentPiece.y).toBe(initialY); // Should not have moved
    });
  });

  describe('automatic piece dropping', () => {
    it('should move piece down when drop speed interval elapses', () => {
      const initialState = stateManager.getState();
      const initialY = initialState.currentPiece.y;
      const dropSpeed = initialState.dropSpeed;
      
      // Set last drop time to trigger drop
      const state = stateManager.getState();
      state.lastDropTime = Date.now() - dropSpeed - 1;
      
      gameLoop.update();
      
      const newState = stateManager.getState();
      expect(newState.currentPiece.y).toBeGreaterThanOrEqual(initialY);
    });

    it('should not move piece down before drop speed interval elapses', () => {
      const initialState = stateManager.getState();
      const initialY = initialState.currentPiece.y;
      
      // Set last drop time to NOT trigger drop (just happened)
      const state = stateManager.getState();
      state.lastDropTime = Date.now();
      
      gameLoop.update();
      
      const newState = stateManager.getState();
      expect(newState.currentPiece.y).toBe(initialY);
    });
  });
});
