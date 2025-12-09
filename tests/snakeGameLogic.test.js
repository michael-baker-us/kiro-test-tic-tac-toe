// Unit tests for Snake game logic
import { describe, it, expect } from 'vitest';
import {
  DIRECTIONS,
  createGameBoard,
  initializeSnake,
  checkBoundaryCollision,
  getNextHeadPosition
} from '../src/games/snake/gameLogic.js';

describe('Snake Game Logic - Boundary Collision Edge Cases', () => {
  const board = createGameBoard(10, 10);

  it('should detect collision at top boundary', () => {
    const headAtTop = { x: 5, y: -1 };
    expect(checkBoundaryCollision(headAtTop, board)).toBe(true);
  });

  it('should detect collision at bottom boundary', () => {
    const headAtBottom = { x: 5, y: 10 };
    expect(checkBoundaryCollision(headAtBottom, board)).toBe(true);
  });

  it('should detect collision at left boundary', () => {
    const headAtLeft = { x: -1, y: 5 };
    expect(checkBoundaryCollision(headAtLeft, board)).toBe(true);
  });

  it('should detect collision at right boundary', () => {
    const headAtRight = { x: 10, y: 5 };
    expect(checkBoundaryCollision(headAtRight, board)).toBe(true);
  });

  it('should detect collision at top-left corner', () => {
    const headAtTopLeft = { x: -1, y: -1 };
    expect(checkBoundaryCollision(headAtTopLeft, board)).toBe(true);
  });

  it('should detect collision at top-right corner', () => {
    const headAtTopRight = { x: 10, y: -1 };
    expect(checkBoundaryCollision(headAtTopRight, board)).toBe(true);
  });

  it('should detect collision at bottom-left corner', () => {
    const headAtBottomLeft = { x: -1, y: 10 };
    expect(checkBoundaryCollision(headAtBottomLeft, board)).toBe(true);
  });

  it('should detect collision at bottom-right corner', () => {
    const headAtBottomRight = { x: 10, y: 10 };
    expect(checkBoundaryCollision(headAtBottomRight, board)).toBe(true);
  });

  it('should not detect collision when head is within bounds', () => {
    const headInBounds = { x: 5, y: 5 };
    expect(checkBoundaryCollision(headInBounds, board)).toBe(false);
  });

  it('should not detect collision at valid edge positions', () => {
    // Test all valid edge positions
    expect(checkBoundaryCollision({ x: 0, y: 0 }, board)).toBe(false); // top-left valid
    expect(checkBoundaryCollision({ x: 9, y: 0 }, board)).toBe(false); // top-right valid
    expect(checkBoundaryCollision({ x: 0, y: 9 }, board)).toBe(false); // bottom-left valid
    expect(checkBoundaryCollision({ x: 9, y: 9 }, board)).toBe(false); // bottom-right valid
  });
});
