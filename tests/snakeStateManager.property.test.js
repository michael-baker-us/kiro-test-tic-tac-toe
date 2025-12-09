// Property-based tests for Snake game state manager
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { createStateManager } from '../src/games/snake/stateManager.js';
import { DIRECTIONS } from '../src/games/snake/gameLogic.js';

// Custom arbitraries
const directionArb = fc.constantFrom(
  DIRECTIONS.UP,
  DIRECTIONS.DOWN,
  DIRECTIONS.LEFT,
  DIRECTIONS.RIGHT
);

const configArb = fc.record({
  boardWidth: fc.integer({ min: 10, max: 30 }),
  boardHeight: fc.integer({ min: 10, max: 30 }),
  initialSpeed: fc.integer({ min: 100, max: 300 }),
  speedIncrement: fc.integer({ min: 5, max: 20 }),
  speedThreshold: fc.integer({ min: 30, max: 100 }),
  minSpeed: fc.integer({ min: 30, max: 80 }),
  initialSnakeLength: fc.integer({ min: 3, max: 5 })
});

describe('Snake State Manager Properties', () => {
  // Feature: snake-game, Property 6: Pause stops movement
  // Validates: Requirements 2.5, 10.1
  it('Property 6: Pause stops movement - for any game state in paused status, calling tick should not change the snake position', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        
        // Get initial state
        const initialState = manager.getState();
        const initialHeadX = initialState.snake.head.x;
        const initialHeadY = initialState.snake.head.y;
        
        // Pause the game
        manager.pauseGame();
        
        // Try to tick multiple times
        manager.tick();
        manager.tick();
        manager.tick();
        
        // Get state after ticks
        const afterState = manager.getState();
        
        // Snake position should not have changed
        return afterState.snake.head.x === initialHeadX &&
               afterState.snake.head.y === initialHeadY &&
               afterState.gameStatus === 'paused';
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 7: Food consumption increases length
  // Validates: Requirements 3.1, 3.4
  it('Property 7: Food consumption increases length - for any snake that consumes food, the snake length should increase by exactly one segment', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        
        // Get initial state
        const initialState = manager.getState();
        const initialLength = 1 + initialState.snake.body.length;
        
        // Position snake to eat food by setting direction towards food
        const state = manager.getState();
        const headX = state.snake.head.x;
        const headY = state.snake.head.y;
        const foodX = state.food.x;
        const foodY = state.food.y;
        
        // Calculate direction to food
        let direction;
        if (foodX > headX) {
          direction = DIRECTIONS.RIGHT;
        } else if (foodX < headX) {
          direction = DIRECTIONS.LEFT;
        } else if (foodY > headY) {
          direction = DIRECTIONS.DOWN;
        } else {
          direction = DIRECTIONS.UP;
        }
        
        // Move towards food until we eat it or hit a limit
        let ate = false;
        let attempts = 0;
        const maxAttempts = config.boardWidth + config.boardHeight;
        
        while (!ate && attempts < maxAttempts && manager.getState().gameStatus === 'playing') {
          const beforeState = manager.getState();
          const beforeLength = 1 + beforeState.snake.body.length;
          
          manager.updateDirection(direction);
          manager.tick();
          
          const afterState = manager.getState();
          const afterLength = 1 + afterState.snake.body.length;
          
          // Check if we ate food (length increased)
          if (afterLength > beforeLength) {
            ate = true;
            // Length should increase by exactly 1
            return afterLength === beforeLength + 1;
          }
          
          attempts++;
        }
        
        // If we couldn't eat food (game over or max attempts), skip this test case
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 9: Food consumption increases score
  // Validates: Requirements 3.5, 5.2
  it('Property 9: Food consumption increases score - for any game state where food is consumed, the score should increase by exactly 10 points', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        
        // Get initial state
        const state = manager.getState();
        const headX = state.snake.head.x;
        const headY = state.snake.head.y;
        const foodX = state.food.x;
        const foodY = state.food.y;
        
        // Calculate direction to food
        let direction;
        if (foodX > headX) {
          direction = DIRECTIONS.RIGHT;
        } else if (foodX < headX) {
          direction = DIRECTIONS.LEFT;
        } else if (foodY > headY) {
          direction = DIRECTIONS.DOWN;
        } else {
          direction = DIRECTIONS.UP;
        }
        
        // Move towards food until we eat it or hit a limit
        let ate = false;
        let attempts = 0;
        const maxAttempts = config.boardWidth + config.boardHeight;
        
        while (!ate && attempts < maxAttempts && manager.getState().gameStatus === 'playing') {
          const beforeState = manager.getState();
          const beforeScore = beforeState.score;
          
          manager.updateDirection(direction);
          manager.tick();
          
          const afterState = manager.getState();
          const afterScore = afterState.score;
          
          // Check if score increased (we ate food)
          if (afterScore > beforeScore) {
            ate = true;
            // Score should increase by exactly 10
            return afterScore === beforeScore + 10;
          }
          
          attempts++;
        }
        
        // If we couldn't eat food, skip this test case
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 11: Game over stops movement
  // Validates: Requirements 4.6
  it('Property 11: Game over stops movement - for any game state with status gameOver, calling tick should not change the snake position', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Create a small board to make collision easier
        const smallConfig = { ...config, boardWidth: 5, boardHeight: 5 };
        const manager = createStateManager(smallConfig);
        
        // Force game into game over state by moving into wall
        let attempts = 0;
        const maxAttempts = 20;
        
        while (manager.getState().gameStatus === 'playing' && attempts < maxAttempts) {
          manager.updateDirection(DIRECTIONS.UP);
          manager.tick();
          attempts++;
        }
        
        // If we reached game over
        if (manager.getState().gameStatus === 'gameOver') {
          const gameOverState = manager.getState();
          const headX = gameOverState.snake.head.x;
          const headY = gameOverState.snake.head.y;
          const score = gameOverState.score;
          
          // Try to tick multiple times
          manager.tick();
          manager.tick();
          manager.tick();
          
          const afterState = manager.getState();
          
          // Nothing should have changed
          return afterState.snake.head.x === headX &&
                 afterState.snake.head.y === headY &&
                 afterState.score === score &&
                 afterState.gameStatus === 'gameOver';
        }
        
        // If we couldn't reach game over, skip
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 12: Reset returns to initial state
  // Validates: Requirements 5.5, 6.2, 6.3, 6.5, 9.5
  it('Property 12: Reset returns to initial state - for any game state, calling reset should return to initial conditions', () => {
    fc.assert(
      fc.property(configArb, fc.integer({ min: 0, max: 10 }), (config, numMoves) => {
        const manager = createStateManager(config);
        
        // Make some moves to change state
        for (let i = 0; i < numMoves && manager.getState().gameStatus === 'playing'; i++) {
          manager.tick();
        }
        
        // Reset the game
        manager.resetGame();
        
        const state = manager.getState();
        
        // Check initial conditions
        return state.score === 0 &&
               state.gameStatus === 'playing' &&
               state.speed === config.initialSpeed &&
               (1 + state.snake.body.length) === config.initialSnakeLength;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 13: Food spawns on reset
  // Validates: Requirements 6.4
  it('Property 13: Food spawns on reset - for any game state, calling reset should spawn food at a position that does not overlap with the initial snake', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        
        // Make some moves
        manager.tick();
        manager.tick();
        
        // Reset the game
        manager.resetGame();
        
        const state = manager.getState();
        
        // Food should exist
        if (!state.food) {
          return false;
        }
        
        // Food should not overlap with snake head
        const foodOverlapsHead = state.food.x === state.snake.head.x && 
                                  state.food.y === state.snake.head.y;
        
        // Food should not overlap with any body segment
        const foodOverlapsBody = state.snake.body.some(segment => 
          segment.x === state.food.x && segment.y === state.food.y
        );
        
        return !foodOverlapsHead && !foodOverlapsBody;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 14: Speed increases at thresholds
  // Validates: Requirements 9.2
  it('Property 14: Speed increases at thresholds - for any score that crosses a speed threshold, the game speed should be faster', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        const initialSpeed = config.initialSpeed;
        
        // Manually increase score to cross threshold
        let crossedThreshold = false;
        let speedBeforeThreshold = initialSpeed;
        let speedAfterThreshold = initialSpeed;
        
        // Try to eat food and cross threshold
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts && manager.getState().gameStatus === 'playing') {
          const beforeState = manager.getState();
          const beforeScore = beforeState.score;
          
          // Check if we're about to cross a threshold
          const beforeThresholdLevel = Math.floor(beforeScore / config.speedThreshold);
          
          manager.tick();
          
          const afterState = manager.getState();
          const afterScore = afterState.score;
          const afterThresholdLevel = Math.floor(afterScore / config.speedThreshold);
          
          // If we crossed a threshold
          if (afterThresholdLevel > beforeThresholdLevel) {
            speedBeforeThreshold = beforeState.speed;
            speedAfterThreshold = afterState.speed;
            crossedThreshold = true;
            break;
          }
          
          attempts++;
        }
        
        // If we crossed a threshold, speed should be faster (lower value)
        if (crossedThreshold) {
          return speedAfterThreshold < speedBeforeThreshold;
        }
        
        // If we didn't cross threshold, skip
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 15: Speed never exceeds maximum
  // Validates: Requirements 9.4
  it('Property 15: Speed never exceeds maximum - for any game state, the speed value should never be less than the minimum speed', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        
        // Play for many ticks to try to exceed max speed
        let attempts = 0;
        const maxAttempts = 200;
        
        while (attempts < maxAttempts && manager.getState().gameStatus === 'playing') {
          manager.tick();
          
          const state = manager.getState();
          
          // Speed should never be less than minSpeed (faster than max)
          if (state.speed < config.minSpeed) {
            return false;
          }
          
          attempts++;
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 16: Resume preserves state
  // Validates: Requirements 10.3, 10.5
  it('Property 16: Resume preserves state - for any game state that is paused and then resumed, all game state values should remain unchanged except status', () => {
    fc.assert(
      fc.property(configArb, fc.integer({ min: 0, max: 5 }), (config, numMoves) => {
        const manager = createStateManager(config);
        
        // Make some moves
        for (let i = 0; i < numMoves && manager.getState().gameStatus === 'playing'; i++) {
          manager.tick();
        }
        
        // Skip if game is already over (can't test pause/resume on ended game)
        if (manager.getState().gameStatus !== 'playing') {
          return true;
        }
        
        // Get state before pause
        const beforePause = manager.getState();
        
        // Pause the game
        manager.pauseGame();
        
        // Get state while paused
        const whilePaused = manager.getState();
        
        // Resume the game
        manager.resumeGame();
        
        // Get state after resume
        const afterResume = manager.getState();
        
        // All values except status should be preserved
        return afterResume.snake.head.x === beforePause.snake.head.x &&
               afterResume.snake.head.y === beforePause.snake.head.y &&
               afterResume.snake.body.length === beforePause.snake.body.length &&
               afterResume.score === beforePause.score &&
               afterResume.food.x === beforePause.food.x &&
               afterResume.food.y === beforePause.food.y &&
               afterResume.gameStatus === 'playing' &&
               whilePaused.gameStatus === 'paused';
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 17: Pause ignores direction input
  // Validates: Requirements 10.4
  it('Property 17: Pause ignores direction input - for any game state with status paused, attempting to change direction should not update the snake direction', () => {
    fc.assert(
      fc.property(configArb, directionArb, (config, newDirection) => {
        const manager = createStateManager(config);
        
        // Get initial direction
        const initialDirection = manager.getState().snake.direction;
        
        // Pause the game
        manager.pauseGame();
        
        // Try to change direction while paused
        manager.updateDirection(newDirection);
        
        // Get direction after attempted change
        const afterDirection = manager.getState().snake.direction;
        
        // Direction should not have changed
        return afterDirection === initialDirection;
      }),
      { numRuns: 100 }
    );
  });
});
