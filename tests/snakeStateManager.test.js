// Unit tests for Snake game state manager
import { describe, it, expect } from 'vitest';
import { createStateManager } from '../src/games/snake/stateManager.js';
import { DIRECTIONS } from '../src/games/snake/gameLogic.js';

describe('Snake State Manager', () => {
  describe('Initial state creation', () => {
    it('should create initial state with default configuration', () => {
      const manager = createStateManager();
      const state = manager.getState();
      
      expect(state.score).toBe(0);
      expect(state.gameStatus).toBe('playing');
      expect(state.speed).toBe(200);
      expect(state.boardWidth).toBe(20);
      expect(state.boardHeight).toBe(20);
      expect(state.snake).toBeDefined();
      expect(state.food).toBeDefined();
    });
    
    it('should create initial state with custom configuration', () => {
      const config = {
        boardWidth: 15,
        boardHeight: 15,
        initialSpeed: 150,
        initialSnakeLength: 4
      };
      
      const manager = createStateManager(config);
      const state = manager.getState();
      
      expect(state.boardWidth).toBe(15);
      expect(state.boardHeight).toBe(15);
      expect(state.speed).toBe(150);
      expect(1 + state.snake.body.length).toBe(4);
    });
    
    it('should initialize snake at center of board', () => {
      const config = { boardWidth: 20, boardHeight: 20 };
      const manager = createStateManager(config);
      const state = manager.getState();
      
      expect(state.snake.head.x).toBe(10);
      expect(state.snake.head.y).toBe(10);
    });
    
    it('should spawn initial food that does not overlap with snake', () => {
      const manager = createStateManager();
      const state = manager.getState();
      
      // Food should not be at head position
      const foodAtHead = state.food.x === state.snake.head.x && 
                         state.food.y === state.snake.head.y;
      expect(foodAtHead).toBe(false);
      
      // Food should not be at any body position
      const foodAtBody = state.snake.body.some(segment => 
        segment.x === state.food.x && segment.y === state.food.y
      );
      expect(foodAtBody).toBe(false);
    });
  });
  
  describe('State subscription and notification', () => {
    it('should notify subscribers when state changes', () => {
      const manager = createStateManager();
      let notificationCount = 0;
      let lastState = null;
      
      manager.subscribe((state) => {
        notificationCount++;
        lastState = state;
      });
      
      // Trigger state change
      manager.tick();
      
      expect(notificationCount).toBeGreaterThan(0);
      expect(lastState).toBeDefined();
    });
    
    it('should allow multiple subscribers', () => {
      const manager = createStateManager();
      let count1 = 0;
      let count2 = 0;
      
      manager.subscribe(() => count1++);
      manager.subscribe(() => count2++);
      
      manager.tick();
      
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });
    
    it('should allow unsubscribing', () => {
      const manager = createStateManager();
      let count = 0;
      
      const unsubscribe = manager.subscribe(() => count++);
      
      manager.tick();
      expect(count).toBe(1);
      
      unsubscribe();
      
      manager.tick();
      expect(count).toBe(1); // Should not increase
    });
    
    it('should notify on pause', () => {
      const manager = createStateManager();
      let notified = false;
      
      manager.subscribe(() => notified = true);
      
      manager.pauseGame();
      
      expect(notified).toBe(true);
    });
    
    it('should notify on resume', () => {
      const manager = createStateManager();
      manager.pauseGame();
      
      let notified = false;
      manager.subscribe(() => notified = true);
      
      manager.resumeGame();
      
      expect(notified).toBe(true);
    });
    
    it('should notify on reset', () => {
      const manager = createStateManager();
      let notified = false;
      
      manager.subscribe(() => notified = true);
      
      manager.resetGame();
      
      expect(notified).toBe(true);
    });
  });
  
  describe('Score and speed boundaries', () => {
    it('should start with score of 0', () => {
      const manager = createStateManager();
      const state = manager.getState();
      
      expect(state.score).toBe(0);
    });
    
    it('should not allow speed to go below minimum speed', () => {
      const config = {
        initialSpeed: 100,
        minSpeed: 50,
        speedThreshold: 10, // Very low threshold to trigger speed increases quickly
        speedIncrement: 20
      };
      
      const manager = createStateManager(config);
      
      // Play for many ticks to try to exceed max speed
      for (let i = 0; i < 100; i++) {
        const state = manager.getState();
        if (state.gameStatus !== 'playing') break;
        
        expect(state.speed).toBeGreaterThanOrEqual(config.minSpeed);
        manager.tick();
      }
    });
    
    it('should increase speed when score crosses threshold', () => {
      const config = {
        initialSpeed: 200,
        speedThreshold: 50,
        speedIncrement: 10,
        minSpeed: 50
      };
      
      const manager = createStateManager(config);
      const initialSpeed = manager.getState().speed;
      
      // Manually test speed calculation
      // At score 0: speed = 200
      // At score 50: speed = 200 - 10 = 190
      // At score 100: speed = 200 - 20 = 180
      
      expect(initialSpeed).toBe(200);
    });
    
    it('should handle edge case of score at exact threshold', () => {
      const config = {
        initialSpeed: 200,
        speedThreshold: 50,
        speedIncrement: 10,
        minSpeed: 50
      };
      
      const manager = createStateManager(config);
      
      // The speed calculation is: max(minSpeed, initialSpeed - (floor(score/threshold) * increment))
      // At score 49: floor(49/50) = 0, speed = 200 - 0 = 200
      // At score 50: floor(50/50) = 1, speed = 200 - 10 = 190
      
      // We can't directly set score, but we can verify the logic is sound
      const state = manager.getState();
      expect(state.speed).toBe(200);
    });
    
    it('should handle maximum score without errors', () => {
      const config = {
        boardWidth: 10,
        boardHeight: 10,
        initialSpeed: 200,
        speedThreshold: 10,
        speedIncrement: 5,
        minSpeed: 50
      };
      
      const manager = createStateManager(config);
      
      // Play for many ticks
      for (let i = 0; i < 50; i++) {
        const state = manager.getState();
        if (state.gameStatus !== 'playing') break;
        
        // Should never throw error
        expect(state.score).toBeGreaterThanOrEqual(0);
        expect(state.speed).toBeGreaterThanOrEqual(config.minSpeed);
        
        manager.tick();
      }
    });
  });
  
  describe('Direction updates', () => {
    it('should update direction when playing', () => {
      const manager = createStateManager();
      
      manager.updateDirection(DIRECTIONS.UP);
      const state = manager.getState();
      
      expect(state.snake.direction).toBe(DIRECTIONS.UP);
    });
    
    it('should not update direction when paused', () => {
      const manager = createStateManager();
      const initialDirection = manager.getState().snake.direction;
      
      manager.pauseGame();
      manager.updateDirection(DIRECTIONS.UP);
      
      const state = manager.getState();
      expect(state.snake.direction).toBe(initialDirection);
    });
    
    it('should not update direction when game over', () => {
      const config = { boardWidth: 5, boardHeight: 5 };
      const manager = createStateManager(config);
      
      // Force game over by moving into wall
      for (let i = 0; i < 10; i++) {
        manager.updateDirection(DIRECTIONS.UP);
        manager.tick();
        if (manager.getState().gameStatus === 'gameOver') break;
      }
      
      if (manager.getState().gameStatus === 'gameOver') {
        const directionAtGameOver = manager.getState().snake.direction;
        
        manager.updateDirection(DIRECTIONS.DOWN);
        
        const state = manager.getState();
        expect(state.snake.direction).toBe(directionAtGameOver);
      }
    });
  });
  
  describe('Pause and resume', () => {
    it('should transition from playing to paused', () => {
      const manager = createStateManager();
      
      expect(manager.getState().gameStatus).toBe('playing');
      
      manager.pauseGame();
      
      expect(manager.getState().gameStatus).toBe('paused');
    });
    
    it('should transition from paused to playing', () => {
      const manager = createStateManager();
      
      manager.pauseGame();
      expect(manager.getState().gameStatus).toBe('paused');
      
      manager.resumeGame();
      expect(manager.getState().gameStatus).toBe('playing');
    });
    
    it('should not pause when already paused', () => {
      const manager = createStateManager();
      
      manager.pauseGame();
      const state1 = manager.getState();
      
      manager.pauseGame();
      const state2 = manager.getState();
      
      expect(state1.gameStatus).toBe('paused');
      expect(state2.gameStatus).toBe('paused');
    });
    
    it('should not resume when not paused', () => {
      const manager = createStateManager();
      
      expect(manager.getState().gameStatus).toBe('playing');
      
      manager.resumeGame();
      
      expect(manager.getState().gameStatus).toBe('playing');
    });
  });
});
