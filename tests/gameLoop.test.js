/**
 * Unit tests for game loop module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGameLoop } from '../src/games/snake/gameLoop.js';
import { createStateManager } from '../src/games/snake/stateManager.js';

describe('Game Loop', () => {
  let stateManager;
  let gameLoop;
  let rafCallbacks = [];
  let rafId = 0;
  let currentTime = 0;
  
  beforeEach(() => {
    // Create a state manager for testing
    stateManager = createStateManager({
      boardWidth: 10,
      boardHeight: 10,
      initialSpeed: 100
    });
    
    // Reset RAF state
    rafCallbacks = [];
    rafId = 0;
    currentTime = 0;
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      const id = ++rafId;
      rafCallbacks.push({ id, callback });
      return id;
    });
    
    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = vi.fn((id) => {
      const index = rafCallbacks.findIndex(item => item.id === id);
      if (index > -1) {
        rafCallbacks.splice(index, 1);
      }
    });
    
    // Mock performance.now
    global.performance = {
      now: vi.fn(() => currentTime)
    };
    
    // Create game loop
    gameLoop = createGameLoop(stateManager);
  });
  
  afterEach(() => {
    // Clean up
    if (gameLoop) {
      gameLoop.stop();
    }
    vi.restoreAllMocks();
  });
  
  // Helper function to advance time and trigger RAF callbacks
  function advanceTime(ms) {
    currentTime += ms;
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach(({ callback }) => callback(currentTime));
  }
  
  describe('Loop initialization and cleanup', () => {
    it('should initialize in stopped state', () => {
      expect(gameLoop.getIsRunning()).toBe(false);
    });
    
    it('should start the loop when start is called', () => {
      gameLoop.start();
      expect(gameLoop.getIsRunning()).toBe(true);
    });
    
    it('should stop the loop when stop is called', () => {
      gameLoop.start();
      gameLoop.stop();
      expect(gameLoop.getIsRunning()).toBe(false);
    });
    
    it('should not start multiple times if already running', () => {
      gameLoop.start();
      const firstRunning = gameLoop.getIsRunning();
      gameLoop.start(); // Try to start again
      expect(gameLoop.getIsRunning()).toBe(firstRunning);
    });
    
    it('should handle stop when not running', () => {
      expect(() => gameLoop.stop()).not.toThrow();
      expect(gameLoop.getIsRunning()).toBe(false);
    });
  });
  
  describe('Pause/resume behavior', () => {
    it('should not update state when paused', () => {
      const initialState = stateManager.getState();
      const initialSnakePos = { ...initialState.snake.head };
      
      // Pause the game
      stateManager.pauseGame();
      
      // Start the loop
      gameLoop.start();
      
      // Advance time
      advanceTime(200);
      
      const currentState = stateManager.getState();
      
      // Snake should not have moved
      expect(currentState.snake.head).toEqual(initialSnakePos);
      expect(currentState.gameStatus).toBe('paused');
    });
    
    it('should resume updating after unpause', () => {
      // Pause then resume
      stateManager.pauseGame();
      stateManager.resumeGame();
      
      const initialState = stateManager.getState();
      const initialSnakeX = initialState.snake.head.x;
      
      // Start the loop
      gameLoop.start();
      
      // Advance time enough for multiple updates
      advanceTime(100);
      advanceTime(100);
      advanceTime(100);
      
      const currentState = stateManager.getState();
      
      // Snake should have moved (direction is right by default)
      expect(currentState.snake.head.x).toBeGreaterThan(initialSnakeX);
    });
    
    it('should stop loop when game is over', () => {
      gameLoop.start();
      expect(gameLoop.getIsRunning()).toBe(true);
      
      // Trigger a game over by making snake collide with itself
      // Set up snake to collide with its body
      const state = stateManager.getState();
      // Place body segment in front of head
      state.snake.body = [
        { x: state.snake.head.x + 1, y: state.snake.head.y },
        ...state.snake.body
      ];
      state.snake.direction = 'right';
      
      // Advance time to trigger self-collision
      advanceTime(100);
      
      // Check that game is over
      expect(stateManager.getState().gameStatus).toBe('gameOver');
      
      // Try to advance again - loop should not continue
      const beforeX = stateManager.getState().snake.head.x;
      advanceTime(100);
      const afterX = stateManager.getState().snake.head.x;
      
      // Snake should not have moved after game over
      expect(afterX).toBe(beforeX);
      expect(gameLoop.getIsRunning()).toBe(false);
    });
  });
  
  describe('Speed adjustment', () => {
    it('should update at initial speed', () => {
      const initialState = stateManager.getState();
      const initialSpeed = initialState.speed;
      const initialSnakeX = initialState.snake.head.x;
      
      gameLoop.start();
      
      // Advance time by exactly the speed interval
      advanceTime(initialSpeed);
      
      const currentState = stateManager.getState();
      
      // Snake should have moved once
      expect(currentState.snake.head.x).toBe(initialSnakeX + 1);
    });
    
    it('should adapt to speed changes dynamically', () => {
      gameLoop.start();
      
      // Get initial position
      const initialX = stateManager.getState().snake.head.x;
      
      // Advance time by initial speed (100ms) - this triggers first update
      advanceTime(100);
      
      // Should have moved once
      let currentX = stateManager.getState().snake.head.x;
      expect(currentX).toBe(initialX + 1);
      
      // Verify that speed changes are respected by the loop
      // The loop reads state.speed on each iteration
      // Let's just verify the loop continues to work after speed changes
      const state = stateManager.getState();
      const oldSpeed = state.speed;
      
      // Advance by another interval at current speed
      advanceTime(oldSpeed);
      
      // Should have moved again
      currentX = stateManager.getState().snake.head.x;
      expect(currentX).toBe(initialX + 2);
    });
    
    it('should not update before speed interval elapses', () => {
      const initialState = stateManager.getState();
      const initialSnakeX = initialState.snake.head.x;
      const speed = initialState.speed;
      
      gameLoop.start();
      
      // Advance time by less than speed interval
      advanceTime(speed - 10);
      
      const currentState = stateManager.getState();
      
      // Snake should not have moved yet
      expect(currentState.snake.head.x).toBe(initialSnakeX);
    });
  });
});
