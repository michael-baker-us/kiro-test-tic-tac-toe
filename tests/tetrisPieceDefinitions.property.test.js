/**
 * Property-based tests for Tetris piece definitions
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPieceColor, getAllPieceTypes } from '../src/games/tetris/pieceDefinitions.js';

describe('Tetris Piece Definitions - Property Tests', () => {
  // Feature: tetris-game, Property 19: Piece color mapping
  // Validates: Requirements 11.1-11.7
  it('Property 19: All piece types map to correct standard Tetris colors', () => {
    // Expected color mapping per requirements 11.1-11.7
    const expectedColors = {
      I: '#00f0f0', // Cyan (11.1)
      O: '#f0f000', // Yellow (11.2)
      T: '#a000f0', // Purple (11.3)
      S: '#00f000', // Green (11.4)
      Z: '#f00000', // Red (11.5)
      J: '#0000f0', // Blue (11.6)
      L: '#f0a000'  // Orange (11.7)
    };

    fc.assert(
      fc.property(
        fc.constantFrom(...getAllPieceTypes()),
        (pieceType) => {
          const actualColor = getPieceColor(pieceType);
          const expectedColor = expectedColors[pieceType];
          
          // Verify the color matches the standard Tetris color for this piece type
          expect(actualColor).toBe(expectedColor);
        }
      ),
      { numRuns: 100 }
    );
  });
});
