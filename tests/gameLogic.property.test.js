// Property-based tests for game logic
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  createEmptyBoard,
  makeMove,
  isValidMove,
  checkWinner,
  isDraw,
  getAvailableMoves
} from '../src/games/tic-tac-toe/gameLogic.js';

// Custom arbitraries for tic-tac-toe
const playerArb = fc.constantFrom('X', 'O');
const positionArb = fc.integer({ min: 0, max: 8 });

// Generate a board with some moves
const boardArb = fc.array(fc.constantFrom('X', 'O', null), { minLength: 9, maxLength: 9 });

// Generate a board with at least one empty cell
const boardWithEmptyCellArb = boardArb.filter(board => board.some(cell => cell === null));

// Generate a board with at least one occupied cell
const boardWithOccupiedCellArb = boardArb.filter(board => board.some(cell => cell !== null));

describe('Game Logic Properties', () => {
  // Feature: tic-tac-toe, Property 1: Valid move placement
  it('Property 1: Valid move placement - for any board and empty position, move places mark correctly', () => {
    fc.assert(
      fc.property(boardWithEmptyCellArb, playerArb, (board, player) => {
        // Get an empty position from the board
        const emptyPositions = board
          .map((cell, idx) => (cell === null ? idx : -1))
          .filter(idx => idx !== -1);
        
        if (emptyPositions.length === 0) return true; // Skip if no empty positions
        
        const position = emptyPositions[0];
        const newBoard = makeMove(board, position, player);
        
        // Verify the mark was placed at the correct position
        return newBoard[position] === player;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: tic-tac-toe, Property 2: Invalid move rejection
  it('Property 2: Invalid move rejection - for any board and occupied position, board remains unchanged', () => {
    fc.assert(
      fc.property(boardWithOccupiedCellArb, playerArb, (board, player) => {
        // Get an occupied position from the board
        const occupiedPositions = board
          .map((cell, idx) => (cell !== null ? idx : -1))
          .filter(idx => idx !== -1);
        
        if (occupiedPositions.length === 0) return true; // Skip if no occupied positions
        
        const position = occupiedPositions[0];
        const originalValue = board[position];
        const newBoard = makeMove(board, position, player);
        
        // Verify the board remains unchanged
        return JSON.stringify(newBoard) === JSON.stringify(board) && 
               newBoard[position] === originalValue;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: tic-tac-toe, Property 4: Win detection completeness
  it('Property 4: Win detection completeness - for any board with three in a row, winner is identified', () => {
    // Generate boards with known winning configurations
    const winningLinesArb = fc.constantFrom(
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]              // diagonals
    );
    
    fc.assert(
      fc.property(winningLinesArb, playerArb, (line, player) => {
        const board = createEmptyBoard();
        // Place the player's marks on the winning line
        line.forEach(pos => {
          board[pos] = player;
        });
        
        const winner = checkWinner(board);
        return winner === player;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: tic-tac-toe, Property 6: Draw detection
  it('Property 6: Draw detection - for any full board without winner, draw is identified', () => {
    // Generate a full board without a winner
    // Pattern that creates draws: alternating X and O without three in a row
    const drawBoardArb = fc.constant([
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X'
    ]);
    
    fc.assert(
      fc.property(drawBoardArb, (board) => {
        const winner = checkWinner(board);
        const draw = isDraw(board);
        
        // If there's no winner and board is full, it should be a draw
        return winner === null && draw === true;
      }),
      { numRuns: 100 }
    );
  });
});
