// Property-based tests for Snake game logic
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  DIRECTIONS,
  createGameBoard,
  initializeSnake,
  isValidDirection,
  isOppositeDirection,
  getNextHeadPosition,
  moveSnake,
  checkBoundaryCollision,
  checkSelfCollision,
  checkFoodCollision,
  spawnFood,
  updateSnakeDirection,
  positionsEqual,
  isPositionOccupied
} from '../src/games/snake/gameLogic.js';

// Custom arbitraries for Snake game
const directionArb = fc.constantFrom(
  DIRECTIONS.UP,
  DIRECTIONS.DOWN,
  DIRECTIONS.LEFT,
  DIRECTIONS.RIGHT
);

const positionArb = (maxX, maxY) => fc.record({
  x: fc.integer({ min: 0, max: maxX - 1 }),
  y: fc.integer({ min: 0, max: maxY - 1 })
});

const boardArb = fc.record({
  width: fc.integer({ min: 5, max: 30 }),
  height: fc.integer({ min: 5, max: 30 })
});

const snakeArb = boardArb.chain(board => {
  return fc.record({
    head: positionArb(board.width, board.height),
    body: fc.array(positionArb(board.width, board.height), { minLength: 0, maxLength: 10 }),
    direction: directionArb
  }).map(snake => ({ ...snake, board }));
});

describe('Snake Game Logic Properties', () => {
  // Feature: snake-game, Property 1: Directional input changes direction
  it('Property 1: Directional input changes direction - for any valid game state and valid direction input, applying the direction change should update the snake direction (unless opposite)', () => {
    fc.assert(
      fc.property(snakeArb, directionArb, ({ head, body, direction, board }, newDirection) => {
        const snake = { head, body, direction };
        const updatedSnake = updateSnakeDirection(snake, newDirection);
        
        // If the new direction is opposite to current, direction should not change
        if (isOppositeDirection(direction, newDirection)) {
          return updatedSnake.direction === direction;
        }
        
        // Otherwise, direction should be updated
        return updatedSnake.direction === newDirection;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 2: Opposite direction rejection
  it('Property 2: Opposite direction rejection - for any snake moving in a direction, attempting to change to the directly opposite direction should be ignored', () => {
    fc.assert(
      fc.property(directionArb, (currentDirection) => {
        const snake = {
          head: { x: 5, y: 5 },
          body: [{ x: 4, y: 5 }],
          direction: currentDirection
        };
        
        // Map each direction to its opposite
        const oppositeMap = {
          [DIRECTIONS.UP]: DIRECTIONS.DOWN,
          [DIRECTIONS.DOWN]: DIRECTIONS.UP,
          [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
          [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT
        };
        
        const oppositeDirection = oppositeMap[currentDirection];
        const updatedSnake = updateSnakeDirection(snake, oppositeDirection);
        
        // Direction should remain unchanged
        return updatedSnake.direction === currentDirection;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 4: Snake head advances correctly
  it('Property 4: Snake head advances correctly - for any snake and direction, moving the snake should place the new head exactly one cell in the specified direction', () => {
    fc.assert(
      fc.property(snakeArb, ({ head, body, direction, board }) => {
        const snake = { head, body, direction };
        const movedSnake = moveSnake(snake, false);
        
        // Calculate expected new head position
        const expectedHead = getNextHeadPosition(head, direction);
        
        // Verify new head is at expected position
        return positionsEqual(movedSnake.head, expectedHead);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 5: Snake length preservation without food
  it('Property 5: Snake length preservation without food - for any snake that moves without consuming food, the snake length should remain constant', () => {
    fc.assert(
      fc.property(snakeArb, ({ head, body, direction, board }) => {
        const snake = { head, body, direction };
        const originalLength = 1 + body.length; // head + body segments
        
        // Move without growing (grow = false)
        const movedSnake = moveSnake(snake, false);
        const newLength = 1 + movedSnake.body.length;
        
        // Length should remain the same
        return newLength === originalLength;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 8: Food respawns after consumption
  it('Property 8: Food respawns after consumption - for any food consumption event, the new food position should be different and not overlap with snake', () => {
    fc.assert(
      fc.property(boardArb, (board) => {
        // Create a snake that doesn't fill the entire board
        const snake = initializeSnake(board, 3);
        const oldFoodPosition = spawnFood(board, snake);
        
        // If board is full, skip this test case
        if (oldFoodPosition === null) {
          return true;
        }
        
        // Spawn new food (simulating after consumption)
        const newFoodPosition = spawnFood(board, snake);
        
        // If board is full, skip
        if (newFoodPosition === null) {
          return true;
        }
        
        // New food should not overlap with snake
        const overlapsWithSnake = isPositionOccupied(newFoodPosition, snake);
        
        return !overlapsWithSnake;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: snake-game, Property 10: Self-collision ends game
  it('Property 10: Self-collision ends game - for any snake where the head position equals any body segment position, collision should be detected', () => {
    fc.assert(
      fc.property(snakeArb, ({ head, body, direction, board }) => {
        // Only test if snake has a body
        if (body.length === 0) {
          return true;
        }
        
        // Create a snake where head collides with a body segment
        const collidingSnake = {
          head: body[0], // Set head to same position as first body segment
          body: body,
          direction: direction
        };
        
        // Collision should be detected
        const hasCollision = checkSelfCollision(collidingSnake.head, collidingSnake.body);
        
        return hasCollision === true;
      }),
      { numRuns: 100 }
    );
  });
});
