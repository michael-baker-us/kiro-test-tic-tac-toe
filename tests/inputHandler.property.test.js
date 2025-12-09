// Property-based tests for Snake input handler
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateSwipeDirection } from '../src/games/snake/inputHandler.js';
import { DIRECTIONS } from '../src/games/snake/gameLogic.js';

describe('Snake Input Handler Properties', () => {
  // Feature: snake-game, Property 3: Swipe direction calculation
  it('Property 3: Swipe direction calculation - for any touch coordinates where distance exceeds minimum threshold, the calculated swipe direction should match the primary axis of movement', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: -500, max: 500 }),
        (deltaX, deltaY) => {
          const direction = calculateSwipeDirection(deltaX, deltaY);
          
          // Calculate distance
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const MIN_THRESHOLD = 30;
          
          // If below threshold, should return null
          if (distance < MIN_THRESHOLD) {
            return direction === null;
          }
          
          // If above threshold, should return a valid direction based on primary axis
          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);
          
          if (absDeltaX > absDeltaY) {
            // Horizontal swipe - should be LEFT or RIGHT
            if (deltaX > 0) {
              return direction === DIRECTIONS.RIGHT;
            } else {
              return direction === DIRECTIONS.LEFT;
            }
          } else {
            // Vertical swipe - should be UP or DOWN
            if (deltaY > 0) {
              return direction === DIRECTIONS.DOWN;
            } else {
              return direction === DIRECTIONS.UP;
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
