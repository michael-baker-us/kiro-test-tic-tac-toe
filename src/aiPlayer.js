// AI player module for tic-tac-toe
import { getAvailableMoves, checkWinner, makeMove as makeGameMove } from './gameLogic.js';

/**
 * Creates an AI player with configurable difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Object} AI player with getMove method
 */
export function createAIPlayer(difficulty = 'medium') {
  /**
   * Gets the best move for the AI based on difficulty level
   * @param {Array} board - Current board state
   * @param {string} aiPlayer - AI's player symbol ('X' or 'O')
   * @param {boolean} battleMode - Whether battle mode is enabled
   * @param {Object} battleModeState - Battle mode state (lockedPositions, lastPlacedPosition)
   * @returns {Object} Move object with position and isCapture flag
   */
  function getMove(board, aiPlayer, battleMode = false, battleModeState = {}) {
    const availableMoves = getAvailableMoves(board);
    
    if (availableMoves.length === 0) {
      return null;
    }
    
    let position;
    
    switch (difficulty) {
      case 'easy':
        position = getRandomMove(availableMoves);
        break;
      case 'medium':
        position = getMediumMove(board, aiPlayer, availableMoves);
        break;
      case 'hard':
        position = getHardMove(board, aiPlayer);
        break;
      default:
        position = getRandomMove(availableMoves);
    }
    
    // In battle mode, decide whether to capture
    if (battleMode) {
      return decideBattleMove(board, aiPlayer, position, battleModeState);
    }
    
    return { position, isCapture: false };
  }
  
  /**
   * Decides whether to make a normal move or capture in battle mode
   * @param {Array} board - Current board state
   * @param {string} aiPlayer - AI's player symbol
   * @param {number} normalMove - The normal move position
   * @param {Object} battleModeState - Battle mode state (lockedPositions, lastPlacedPosition)
   * @returns {Object} Move object with position and isCapture flag
   */
  function decideBattleMove(board, aiPlayer, normalMove, battleModeState = {}) {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    const { lockedPositions = [], lastPlacedPosition = null } = battleModeState;
    
    // Find all capturable positions (opponent pieces that are not locked and not last placed)
    const capturablePositions = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === opponent && 
          !lockedPositions.includes(i) && 
          i !== lastPlacedPosition) {
        capturablePositions.push(i);
      }
    }
    
    if (capturablePositions.length === 0) {
      return { position: normalMove, isCapture: false };
    }
    
    // ALWAYS check if capturing wins immediately
    for (const pos of capturablePositions) {
      const testBoard = [...board];
      testBoard[pos] = aiPlayer;
      if (checkWinner(testBoard) === aiPlayer) {
        return { position: pos, isCapture: true };
      }
    }
    
    // For easy difficulty, randomly decide (30% chance to capture)
    if (difficulty === 'easy') {
      if (Math.random() < 0.3 && capturablePositions.length > 0) {
        const randomCapture = capturablePositions[Math.floor(Math.random() * capturablePositions.length)];
        return { position: randomCapture, isCapture: true };
      }
      return { position: normalMove, isCapture: false };
    }
    
    // For medium/hard: Evaluate if opponent could win with 2 turns
    const availableMoves = getAvailableMoves(board);
    const opponentCanWinIn2Turns = canWinInNTurns(board, opponent, 2);
    
    // If opponent can win in 2 turns, DON'T capture (too risky)
    if (opponentCanWinIn2Turns) {
      return { position: normalMove, isCapture: false };
    }
    
    // Check if capturing prevents opponent from winning
    for (const pos of capturablePositions) {
      const testBoard = [...board];
      testBoard[pos] = aiPlayer;
      
      // If this capture prevents opponent from having a winning line
      if (preventsOpponentWin(board, testBoard, opponent)) {
        // For hard difficulty, always do it. For medium, 70% chance
        if (difficulty === 'hard' || Math.random() < 0.7) {
          return { position: pos, isCapture: true };
        }
      }
    }
    
    // In early/mid game (>4 empty cells), consider strategic captures
    if (availableMoves.length > 4) {
      // Check if capturing gives us a better position
      for (const pos of capturablePositions) {
        if (isStrategicPosition(board, pos, opponent)) {
          // For hard difficulty, 60% chance. For medium, 40% chance
          const captureChance = difficulty === 'hard' ? 0.6 : 0.4;
          if (Math.random() < captureChance) {
            return { position: pos, isCapture: true };
          }
        }
      }
    }
    
    // Default to normal move
    return { position: normalMove, isCapture: false };
  }
  
  /**
   * Checks if opponent can win in N turns
   */
  function canWinInNTurns(board, player, turns) {
    if (turns === 0) {
      return checkWinner(board) === player;
    }
    
    const availableMoves = getAvailableMoves(board);
    
    // Try all possible moves for the player
    for (const move of availableMoves) {
      const testBoard = makeGameMove(board, move, player);
      
      // If this move wins, return true
      if (checkWinner(testBoard) === player) {
        return true;
      }
      
      // If we have more turns, check recursively
      if (turns > 1 && canWinInNTurns(testBoard, player, turns - 1)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Checks if capturing prevents opponent from winning
   */
  function preventsOpponentWin(oldBoard, newBoard, opponent) {
    // Count opponent's potential winning lines before and after
    const oldThreats = countWinningThreats(oldBoard, opponent);
    const newThreats = countWinningThreats(newBoard, opponent);
    
    // If we reduced their threats, it's a good capture
    return newThreats < oldThreats;
  }
  
  /**
   * Counts how many lines the player could potentially win
   */
  function countWinningThreats(board, player) {
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    let threats = 0;
    
    for (const line of winningLines) {
      const values = line.map(pos => board[pos]);
      const playerCount = values.filter(v => v === player).length;
      const emptyCount = values.filter(v => v === null).length;
      
      // A threat is a line with 2 of player's pieces and 1 empty
      if (playerCount === 2 && emptyCount === 1) {
        threats++;
      }
    }
    
    return threats;
  }
  
  /**
   * Checks if a position is strategic (part of potential winning lines)
   */
  function isStrategicPosition(board, position, player) {
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]              // diagonals
    ];
    
    for (const line of winningLines) {
      if (line.includes(position)) {
        // Count how many of this player's pieces are in this line
        const count = line.filter(pos => board[pos] === player).length;
        if (count >= 2) {
          // This position is part of a line with 2+ pieces
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Easy difficulty - random move selection
   */
  function getRandomMove(availableMoves) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }
  
  /**
   * Medium difficulty - basic strategy
   * 1. Win if possible
   * 2. Block opponent's win
   * 3. Take center if available
   * 4. Take corner
   * 5. Random
   */
  function getMediumMove(board, aiPlayer, availableMoves) {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    
    // Try to win
    const winningMove = findWinningMove(board, aiPlayer, availableMoves);
    if (winningMove !== null) return winningMove;
    
    // Block opponent's win
    const blockingMove = findWinningMove(board, opponent, availableMoves);
    if (blockingMove !== null) return blockingMove;
    
    // Take center if available
    if (availableMoves.includes(4)) return 4;
    
    // Take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(c => availableMoves.includes(c));
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Random move
    return getRandomMove(availableMoves);
  }
  
  /**
   * Hard difficulty - minimax algorithm
   */
  function getHardMove(board, aiPlayer) {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    let bestScore = -Infinity;
    let bestMove = null;
    
    const availableMoves = getAvailableMoves(board);
    
    for (const move of availableMoves) {
      const newBoard = makeGameMove(board, move, aiPlayer);
      const score = minimax(newBoard, 0, false, aiPlayer, opponent);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  /**
   * Minimax algorithm for optimal play
   */
  function minimax(board, depth, isMaximizing, aiPlayer, opponent) {
    const winner = checkWinner(board);
    
    // Terminal states
    if (winner === aiPlayer) return 10 - depth;
    if (winner === opponent) return depth - 10;
    if (getAvailableMoves(board).length === 0) return 0;
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      const availableMoves = getAvailableMoves(board);
      
      for (const move of availableMoves) {
        const newBoard = makeGameMove(board, move, aiPlayer);
        const score = minimax(newBoard, depth + 1, false, aiPlayer, opponent);
        bestScore = Math.max(score, bestScore);
      }
      
      return bestScore;
    } else {
      let bestScore = Infinity;
      const availableMoves = getAvailableMoves(board);
      
      for (const move of availableMoves) {
        const newBoard = makeGameMove(board, move, opponent);
        const score = minimax(newBoard, depth + 1, true, aiPlayer, opponent);
        bestScore = Math.min(score, bestScore);
      }
      
      return bestScore;
    }
  }
  
  /**
   * Finds a winning move for the given player
   */
  function findWinningMove(board, player, availableMoves) {
    for (const move of availableMoves) {
      const testBoard = makeGameMove(board, move, player);
      if (checkWinner(testBoard) === player) {
        return move;
      }
    }
    return null;
  }
  
  return {
    getMove,
    difficulty
  };
}
