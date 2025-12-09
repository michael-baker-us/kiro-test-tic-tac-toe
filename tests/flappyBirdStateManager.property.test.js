// Property-based tests for Flappy Bird game state manager
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createStateManager } from '../src/games/flappy-bird/stateManager.js';
import { CONFIG } from '../src/games/flappy-bird/config.js';

// Custom arbitraries
const configArb = fc.record({
  gravity: fc.integer({ min: 800, max: 1600 }),
  flapVelocity: fc.integer({ min: -600, max: -200 }),
  birdX: fc.integer({ min: 50, max: 150 }),
  birdSize: fc.integer({ min: 20, max: 50 }),
  pipeWidth: fc.integer({ min: 40, max: 80 }),
  pipeGap: fc.integer({ min: 100, max: 200 }),
  pipeSpeed: fc.integer({ min: 100, max: 300 }),
  pipeSpawnInterval: fc.integer({ min: 1000, max: 2000 }),
  maxRotation: fc.integer({ min: 45, max: 90 }),
  rotationSpeed: fc.integer({ min: 1, max: 5 }),
  canvasWidth: fc.integer({ min: 300, max: 600 }),
  canvasHeight: fc.integer({ min: 400, max: 800 }),
  initialScore: fc.constant(0),
  GAME_STATES: fc.constant({
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  })
});

describe('Flappy Bird State Manager Properties', () => {
  // Feature: flappy-bird-game, Property 14: Menu to playing transition
  // Validates: Requirements 5.2
  it('Property 14: Menu to playing transition - for any game state where gameStatus is menu, when a flap action is received, the gameStatus should transition to playing', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        
        // Get initial state - should be in menu
        const initialState = manager.getState();
        
        // Verify we start in menu state
        if (initialState.gameStatus !== config.GAME_STATES.MENU) {
          return false;
        }
        
        // Trigger start game (simulating flap on menu)
        manager.startGame();
        
        // Get state after starting
        const afterState = manager.getState();
        
        // Should now be in playing state
        return afterState.gameStatus === config.GAME_STATES.PLAYING;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 15: Game over restart resets state
  // Validates: Requirements 5.3, 5.4, 5.5
  it('Property 15: Game over restart resets state - for any game state where gameStatus is gameOver, calling reset should set gameStatus to menu, clear all pipes, reset bird to initial position, and set score to 0', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const manager = createStateManager(config);
        
        // Start the game
        manager.startGame();
        
        // Modify state by incrementing score and ending game
        manager.incrementScore();
        manager.incrementScore();
        manager.incrementScore();
        manager.endGame();
        
        // Verify we're in game over state
        const gameOverState = manager.getState();
        if (gameOverState.gameStatus !== config.GAME_STATES.GAME_OVER) {
          return false;
        }
        
        // Reset the game
        manager.resetGame();
        
        // Get state after reset
        const resetState = manager.getState();
        
        // Verify all reset conditions
        const isMenuState = resetState.gameStatus === config.GAME_STATES.MENU;
        const pipesCleared = resetState.pipes.length === 0;
        const birdResetX = resetState.bird.x === config.birdX;
        const birdResetY = resetState.bird.y === config.canvasHeight / 2;
        const birdResetVelocity = resetState.bird.velocity === 0;
        const scoreReset = resetState.score === 0;
        
        return isMenuState && pipesCleared && birdResetX && birdResetY && 
               birdResetVelocity && scoreReset;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 11: Game over state prevents updates
  // Validates: Requirements 3.5
  it('Property 11: Game over state prevents updates - for any game state where gameStatus is gameOver, calling update should not modify bird position or pipe positions', () => {
    fc.assert(
      fc.property(
        configArb,
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),
        (config, deltaTime) => {
          const manager = createStateManager(config);
          
          // Start the game
          manager.startGame();
          
          // End the game to put it in game over state
          manager.endGame();
          
          // Verify we're in game over state
          const gameOverState = manager.getState();
          if (gameOverState.gameStatus !== config.GAME_STATES.GAME_OVER) {
            return false;
          }
          
          // Store bird and pipe state before update
          const birdYBefore = gameOverState.bird.y;
          const birdVelocityBefore = gameOverState.bird.velocity;
          const pipesCountBefore = gameOverState.pipes.length;
          const pipesXBefore = gameOverState.pipes.map(p => p.x);
          
          // Call update (should do nothing in game over state)
          manager.update(deltaTime);
          
          // Get state after update
          const afterUpdateState = manager.getState();
          
          // Verify nothing changed
          const birdYUnchanged = afterUpdateState.bird.y === birdYBefore;
          const birdVelocityUnchanged = afterUpdateState.bird.velocity === birdVelocityBefore;
          const pipesCountUnchanged = afterUpdateState.pipes.length === pipesCountBefore;
          const pipesXUnchanged = afterUpdateState.pipes.every((pipe, i) => 
            i < pipesXBefore.length && pipe.x === pipesXBefore[i]
          );
          
          return birdYUnchanged && birdVelocityUnchanged && 
                 pipesCountUnchanged && pipesXUnchanged;
        }
      ),
      { numRuns: 100 }
    );
  });
});
