# Tic-Tac-Toe Game

A browser-based tic-tac-toe game with AI opponent support and comprehensive testing using property-based testing.

## Features

- **Player vs Player Mode**: Classic two-player gameplay
- **Player vs AI Mode**: Challenge an AI opponent with three difficulty levels
  - **Easy**: Random move selection - perfect for beginners
  - **Medium**: Strategic play with basic tactics (win, block, center, corners)
  - **Hard**: Unbeatable AI using minimax algorithm
- **⚔️ Battle Mode**: Strategic twist on classic tic-tac-toe
  - Works in both PvP and AI modes!
  - Capture opponent's pieces by clicking on them
  - Risk vs reward: Capturing gives your opponent 2 consecutive turns!
  - **No recapture rule**: Captured pieces are locked (🔒) and cannot be recaptured
  - Play normally or use captures strategically
  - Visual indicators show capturable pieces
  - AI makes intelligent capture decisions based on difficulty
- **Persistent Scoreboard**: Track your wins, losses, and draws
  - Separate scoreboards for PvP and AI modes
  - Scores persist across browser sessions using localStorage
  - Reset button to clear scores
- Clean, responsive UI with visual feedback
- Win highlighting animation
- Comprehensive test coverage (78 tests including property-based tests)

## How to Play

1. Open `index.html` in a web browser
2. Select your game mode:
   - **Player vs Player**: Take turns with another player
   - **Player vs AI**: Play against the computer (you're always X)
3. **Optional**: Enable Battle Mode for PvP (checkbox below game mode)
4. If playing against AI, choose your difficulty level
5. Click on any empty cell to make your move
6. **In Battle Mode**: Click on opponent's pieces to capture them (gives them 2 turns!)
7. Get three in a row (horizontal, vertical, or diagonal) to win!
8. Click "New Game" to start over

### Battle Mode Strategy

- Capturing an opponent's piece replaces it with yours
- The opponent gets 2 consecutive turns after being captured
- **No immediate retaliation**: You cannot capture the last placed piece (marked with 🆕)
- **Captured pieces are locked forever** - they cannot be recaptured by anyone
- Locked pieces show a 🔒 icon and gray background
- Last placed pieces show a 🆕 icon and green border
- Use captures strategically to block wins or create opportunities
- You can still play normally without capturing
- Capturable pieces are highlighted in yellow

**AI Battle Mode Behavior:**
- **Easy AI**: Occasionally captures (30% chance) for unpredictable play
- **Medium/Hard AI**: Intelligent battle mode strategy
  - ✅ Always captures if it wins immediately
  - ✅ Never captures if you can win in your next 2 turns (too risky!)
  - ✅ Captures to prevent you from winning (blocks threats)
  - ✅ Evaluates if capture reduces your winning opportunities
  - ✅ Strategic captures in early/mid game (>4 empty cells)
  - ✅ Hard AI is more aggressive with captures (60% vs 40% for medium)

## Project Structure

```
├── src/
│   ├── gameLogic.js       # Core game logic (pure functions)
│   ├── stateManager.js    # State management
│   ├── aiPlayer.js        # AI opponent with difficulty levels
│   ├── gameController.js  # Game mode and AI coordination
│   ├── scoreboard.js      # Score tracking with localStorage
│   └── uiController.js    # UI rendering and event handling
├── tests/
│   ├── gameLogic.test.js
│   ├── gameLogic.property.test.js
│   ├── stateManager.test.js
│   ├── stateManager.property.test.js
│   ├── uiController.test.js
│   ├── aiPlayer.test.js
│   ├── scoreboard.test.js
│   └── integration.test.js
├── index.html             # Main HTML file
├── styles.css             # Styles
└── package.json

```

## Setup

Install dependencies:
```bash
npm install
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

## Testing Strategy

This project uses two complementary testing approaches:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across randomly generated inputs using fast-check

Each property-based test runs 100 iterations by default to ensure comprehensive coverage.

## AI Implementation

The AI uses different strategies based on difficulty:

- **Easy**: Selects random valid moves
- **Medium**: Uses heuristics (win > block > center > corner > random)
- **Hard**: Implements minimax algorithm for optimal play

The hard difficulty AI is mathematically unbeatable - the best you can do is draw!
