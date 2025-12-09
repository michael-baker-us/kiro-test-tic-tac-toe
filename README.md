# Multi-Game Platform

A browser-based gaming platform featuring multiple games with client-side navigation. Currently includes a fully-featured tic-tac-toe game with AI opponent support and comprehensive testing using property-based testing.

## Platform Features

- **Landing Page**: Browse and select from available games
- **Client-Side Routing**: Navigate between games without page reloads
- **Modular Architecture**: Easy to add new games to the platform
- **Browser History Support**: Back/forward buttons work as expected
- **Direct URL Access**: Share links to specific games

## Tic-Tac-Toe Game Features

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

## Getting Started

1. Open `index.html` in a web browser
2. You'll see the landing page with available games
3. Click on a game tile to start playing
4. Use the "Back to Games" button to return to the landing page

## How to Play Tic-Tac-Toe

1. From the landing page, click on the "Tic-Tac-Toe" tile
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
│   ├── router.js              # Client-side routing system
│   ├── landingPage.js         # Landing page component
│   ├── gameRegistry.js        # Game registration and configuration
│   ├── errorHandler.js        # Error handling utilities
│   └── games/
│       └── tic-tac-toe/
│           ├── index.js           # Game entry point
│           ├── gameLogic.js       # Core game logic (pure functions)
│           ├── stateManager.js    # State management
│           ├── aiPlayer.js        # AI opponent with difficulty levels
│           ├── gameController.js  # Game mode and AI coordination
│           ├── scoreboard.js      # Score tracking with localStorage
│           └── uiController.js    # UI rendering and event handling
├── tests/
│   ├── router.test.js
│   ├── landingPage.test.js
│   ├── gameRegistry.test.js
│   ├── errorHandler.test.js
│   ├── navigation.test.js
│   ├── gameLogic.test.js
│   ├── gameLogic.property.test.js
│   ├── stateManager.test.js
│   ├── stateManager.property.test.js
│   ├── uiController.test.js
│   ├── aiPlayer.test.js
│   ├── scoreboard.test.js
│   ├── battleMode.test.js
│   ├── ticTacToeGame.test.js
│   └── integration.test.js
├── index.html                 # Application shell
├── script.js                  # Main entry point
├── styles.css                 # Global styles
└── package.json
```

## Adding New Games

The platform is designed to make adding new games simple. Follow these steps:

### 1. Create Your Game Directory

Create a new directory under `src/games/` for your game:

```bash
mkdir -p src/games/your-game-name
```

### 2. Implement the Game Interface

Your game must implement the standard game interface in `src/games/your-game-name/index.js`:

```javascript
export default class YourGame {
  /**
   * Initialize the game in the provided container
   * @param {HTMLElement} container - The DOM element to render the game in
   */
  async init(container) {
    // Set up your game UI and logic
    // Render into the container element
  }

  /**
   * Clean up resources when leaving the game
   */
  destroy() {
    // Remove event listeners
    // Clear timers/intervals
    // Clean up any resources
  }
}
```

### 3. Register Your Game

In `script.js`, register your game with the game registry:

```javascript
gameRegistry.registerGame({
  id: 'your-game-name',           // Unique identifier (kebab-case)
  name: 'Your Game Name',         // Display name for the tile
  description: 'Brief description of your game',
  thumbnail: null,                // Optional: URL to thumbnail image
  route: '/your-game-name',       // URL path for the game
  loader: async () => {
    const module = await import('./src/games/your-game-name/index.js');
    return new module.default();
  }
});
```

### 4. Test Your Game

Your game will automatically:
- Appear as a tile on the landing page
- Be accessible via its route (e.g., `/your-game-name`)
- Support browser back/forward navigation
- Work with direct URL access

### Game Development Tips

- **Container-based**: Your game should render within the provided container, not assume full page control
- **Cleanup**: Always implement `destroy()` to prevent memory leaks when users navigate away
- **Responsive**: Design your game to work on different screen sizes
- **State Management**: Handle your own game state; it won't persist across navigation by default
- **Styling**: Add game-specific styles that don't conflict with the platform or other games

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

## Architecture

### Client-Side Routing

The platform uses a custom client-side router that:
- Manages navigation without full page reloads
- Updates the browser URL using the History API
- Handles browser back/forward buttons
- Supports direct URL access to games
- Provides 404 handling for invalid routes

### Navigation Flow

```
Landing Page (/)
    ↓ Click game tile
Game Page (/game-name)
    ↓ Click "Back to Games"
Landing Page (/)
```

**URL Structure:**
- `/` - Landing page with all games
- `/tic-tac-toe` - Tic-tac-toe game
- Future games will follow the pattern: `/game-name`

**Browser Integration:**
- Back button: Returns to previous page
- Forward button: Goes to next page in history
- Refresh: Stays on current page
- Direct URL: Loads the specified page directly

### Component Lifecycle

Each game follows a standard lifecycle:

1. **Registration**: Game is registered in the game registry with metadata
2. **Discovery**: Game appears as a tile on the landing page
3. **Loading**: When clicked, game module is dynamically imported
4. **Initialization**: Game's `init(container)` method is called
5. **Active**: Game runs and handles user interaction
6. **Cleanup**: When navigating away, game's `destroy()` method is called

## Testing Strategy

This project uses two complementary testing approaches:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across randomly generated inputs using fast-check

Each property-based test runs 100 iterations by default to ensure comprehensive coverage.

### Test Coverage

The platform includes comprehensive tests for:

**Platform Components:**
- Router: Navigation, URL management, history handling
- Landing Page: Game tile rendering, click handlers, cleanup
- Game Registry: Registration, retrieval, validation
- Error Handler: Invalid routes, game loading failures
- Navigation: Integration tests for complete navigation flows

**Tic-Tac-Toe Game:**
- Game Logic: Win detection, move validation, battle mode
- State Manager: State transitions, history, persistence
- AI Player: All difficulty levels, battle mode strategy
- UI Controller: Rendering, event handling, animations
- Scoreboard: Score tracking, persistence, reset
- Integration: Complete game flows

## AI Implementation

The AI uses different strategies based on difficulty:

- **Easy**: Selects random valid moves
- **Medium**: Uses heuristics (win > block > center > corner > random)
- **Hard**: Implements minimax algorithm for optimal play

The hard difficulty AI is mathematically unbeatable - the best you can do is draw!
