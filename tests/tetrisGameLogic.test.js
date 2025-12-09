/**
 * Unit tests for Tetris game logic edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  checkCollision,
  calculateGhostPosition,
  isGameOver,
  createEmptyBoard,
  BOARD_WIDTH,
  BOARD_HEIGHT
} from '../src/games/tetris/gameLogic.js';
import { getPieceColor } from '../src/games/tetris/pieceDefinitions.js';

describe('Tetris Game Logic - Unit Tests', () => {
  
  describe('Collision Detection', () => {
    it('should detect collision with left board boundary', () => {
      const board = createEmptyBoard();
      const piece = {
        type: 'T',
        rotation: 0,
        x: -1, // Out of bounds
        y: 10,
        color: getPieceColor('T')
      };
      
      expect(checkCollision(board, piece)).toBe(true);
    });
    
    it('should detect collision with right board boundary', () => {
      const board = createEmptyBoard();
      const piece = {
        type: 'T',
        rotation: 0,
        x: 9, // Too far right for T-piece
        y: 10,
        color: getPieceColor('T')
      };
      
      expect(checkCollision(board, piece)).toBe(true);
    });
    
    it('should detect collision with bottom board boundary', () => {
      const board = createEmptyBoard();
      const piece = {
        type: 'T',
        rotation: 0,
        x: 4,
        y: 19, // At bottom, T-piece extends below
        color: getPieceColor('T')
      };
      
      expect(checkCollision(board, piece)).toBe(true);
    });
    
    it('should detect collision with locked pieces', () => {
      const board = createEmptyBoard();
      // Place a locked piece
      board[19][4] = '#00f0f0';
      board[19][5] = '#00f0f0';
      
      const piece = {
        type: 'T',
        rotation: 0,
        x: 4,
        y: 18, // T-piece would overlap with locked pieces
        color: getPieceColor('T')
      };
      
      expect(checkCollision(board, piece)).toBe(true);
    });
    
    it('should not detect collision on empty board with valid position', () => {
      const board = createEmptyBoard();
      const piece = {
        type: 'T',
        rotation: 0,
        x: 4,
        y: 10,
        color: getPieceColor('T')
      };
      
      expect(checkCollision(board, piece)).toBe(false);
    });
  });
  
  describe('Ghost Piece Calculation', () => {
    it('should calculate ghost position on empty board', () => {
      const board = createEmptyBoard();
      const piece = {
        type: 'T',
        rotation: 0,
        x: 4,
        y: 0,
        color: getPieceColor('T')
      };
      
      const ghostY = calculateGhostPosition(board, piece);
      
      // T-piece at rotation 0 has height 2, so should land at y=18
      expect(ghostY).toBe(18);
    });
    
    it('should calculate ghost position with locked pieces below', () => {
      const board = createEmptyBoard();
      // Fill bottom 5 rows
      for (let row = 15; row < 20; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          board[row][col] = '#00f0f0';
        }
      }
      
      const piece = {
        type: 'T',
        rotation: 0,
        x: 4,
        y: 0,
        color: getPieceColor('T')
      };
      
      const ghostY = calculateGhostPosition(board, piece);
      
      // T-piece should land at y=13 (just above the filled rows)
      expect(ghostY).toBe(13);
    });
    
    it('should handle ghost position when piece is already at bottom', () => {
      const board = createEmptyBoard();
      const piece = {
        type: 'T',
        rotation: 0,
        x: 4,
        y: 18, // Already at landing position
        color: getPieceColor('T')
      };
      
      const ghostY = calculateGhostPosition(board, piece);
      
      expect(ghostY).toBe(18);
    });
    
    it('should calculate ghost position in full column scenario', () => {
      const board = createEmptyBoard();
      // Fill column 6 from bottom to row 5 (vertical I-piece at x=4, rotation=1 uses column 6)
      for (let row = 5; row < 20; row++) {
        board[row][6] = '#00f0f0';
      }
      
      const piece = {
        type: 'I',
        rotation: 1, // Vertical I-piece (uses column 2 of 4x4 matrix)
        x: 4,
        y: 0,
        color: getPieceColor('I')
      };
      
      const ghostY = calculateGhostPosition(board, piece);
      
      // Vertical I-piece should land at y=1 (just above filled cells at row 5)
      expect(ghostY).toBe(1);
    });
  });
  
  describe('Game Over Detection', () => {
    it('should detect game over when spawn position is blocked', () => {
      const board = createEmptyBoard();
      // Block spawn area
      board[0][3] = '#00f0f0';
      board[0][4] = '#00f0f0';
      board[0][5] = '#00f0f0';
      
      const piece = {
        type: 'T',
        rotation: 0,
        x: 3, // Standard spawn position
        y: 0,
        color: getPieceColor('T')
      };
      
      expect(isGameOver(board, piece)).toBe(true);
    });
    
    it('should not detect game over on empty board', () => {
      const board = createEmptyBoard();
      const piece = {
        type: 'T',
        rotation: 0,
        x: 3,
        y: 0,
        color: getPieceColor('T')
      };
      
      expect(isGameOver(board, piece)).toBe(false);
    });
    
    it('should not detect game over when spawn position is partially blocked but piece fits', () => {
      const board = createEmptyBoard();
      // Block only one cell that T-piece doesn't use
      board[0][6] = '#00f0f0';
      
      const piece = {
        type: 'T',
        rotation: 0,
        x: 3,
        y: 0,
        color: getPieceColor('T')
      };
      
      expect(isGameOver(board, piece)).toBe(false);
    });
  });
  
  describe('Board Creation', () => {
    it('should create empty board with correct dimensions', () => {
      const board = createEmptyBoard();
      
      expect(board.length).toBe(BOARD_HEIGHT);
      expect(board[0].length).toBe(BOARD_WIDTH);
      
      // Verify all cells are null
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          expect(board[row][col]).toBe(null);
        }
      }
    });
  });
});
