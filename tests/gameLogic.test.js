// Unit tests for game logic
import { describe, it, expect } from 'vitest';
import { createEmptyBoard, checkWinner } from '../src/games/tic-tac-toe/gameLogic.js';

describe('Game Logic - Win Detection', () => {
  describe('Horizontal wins', () => {
    it('should detect win in top row', () => {
      const board = [
        'X', 'X', 'X',
        'O', 'O', null,
        null, null, null
      ];
      expect(checkWinner(board)).toBe('X');
    });

    it('should detect win in middle row', () => {
      const board = [
        'X', 'O', null,
        'O', 'O', 'O',
        'X', null, null
      ];
      expect(checkWinner(board)).toBe('O');
    });

    it('should detect win in bottom row', () => {
      const board = [
        'O', 'O', null,
        'O', 'X', null,
        'X', 'X', 'X'
      ];
      expect(checkWinner(board)).toBe('X');
    });
  });

  describe('Vertical wins', () => {
    it('should detect win in left column', () => {
      const board = [
        'X', 'O', 'O',
        'X', 'O', null,
        'X', null, null
      ];
      expect(checkWinner(board)).toBe('X');
    });

    it('should detect win in middle column', () => {
      const board = [
        'X', 'O', null,
        null, 'O', 'X',
        null, 'O', null
      ];
      expect(checkWinner(board)).toBe('O');
    });

    it('should detect win in right column', () => {
      const board = [
        'O', 'O', 'X',
        null, null, 'X',
        null, 'O', 'X'
      ];
      expect(checkWinner(board)).toBe('X');
    });
  });

  describe('Diagonal wins', () => {
    it('should detect win in top-left to bottom-right diagonal', () => {
      const board = [
        'X', 'O', 'O',
        null, 'X', 'O',
        null, null, 'X'
      ];
      expect(checkWinner(board)).toBe('X');
    });

    it('should detect win in top-right to bottom-left diagonal', () => {
      const board = [
        'X', 'X', 'O',
        null, 'O', 'X',
        'O', null, null
      ];
      expect(checkWinner(board)).toBe('O');
    });
  });

  describe('No winner scenarios', () => {
    it('should return null for empty board', () => {
      const board = createEmptyBoard();
      expect(checkWinner(board)).toBe(null);
    });

    it('should return null for board with no winner', () => {
      const board = [
        'X', 'O', 'X',
        'O', 'X', 'O',
        'O', 'X', null
      ];
      expect(checkWinner(board)).toBe(null);
    });

    it('should return null for draw board', () => {
      const board = [
        'X', 'O', 'X',
        'X', 'O', 'O',
        'O', 'X', 'X'
      ];
      expect(checkWinner(board)).toBe(null);
    });
  });
});
