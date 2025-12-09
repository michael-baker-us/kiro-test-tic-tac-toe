# Multi-Game Platform

A browser-based gaming platform featuring multiple games with simple tab-based navigation. Currently includes Snake and Tic-Tac-Toe games with comprehensive testing using property-based testing. Designed to work perfectly on GitHub Pages.

## Platform Features

- **Tab-Based Navigation**: Switch between games instantly without page reloads
- **Simple Single-Page Design**: No routing complexity, works reliably on GitHub Pages
- **State Preservation**: Game state is maintained when switching between games
- **Responsive Design**: Works on desktop and mobile devices

## Snake Game Features

- **Classic Gameplay**: Control the snake to eat food and grow longer
- **Keyboard Controls**: Arrow keys or WASD to control direction
- **Touch Controls**: Swipe gestures for mobile devices
- **Score Tracking**: Keep track of your current score
- **Collision Detection**: Game ends when snake hits walls or itself
- **Smooth Animation**: Responsive game loop with consistent timing

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
2. You'll see tabs at the top for Snake and Tic-Tac-Toe
3. Click on a tab to switch between games
4. Your game progress is preserved when switching tabs

## How to Play Tic-Tac-Toe

1. Click on the "Tic-Tac-Toe" tab at the top of the page
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
│   └── games/
│       ├── snake/
│       │   ├── index.js           # Game entry point
│       │   ├── gameLogic.js       # Core game logic
│       │   ├── gameLoop.js        # Game loop management
│       │   ├── stateManager.js    # State management
│       │   ├── inputHandler.js    # Keyboard/touch input
│       │   └── uiController.js    # UI rendering
│       └── tic-tac-toe/
│           ├── index.js           # Game entry point
│           ├── gameLogic.js       # Core game logic (pure functions)
│           ├── stateManager.js    # State management
│           ├── aiPlayer.js        # AI opponent with difficulty levels
│           ├── gameController.js  # Game mode and AI coordination
│           ├── scoreboard.js      # Score tracking with localStorage
│           └── uiController.js    # UI rendering and event handling
├── tests/
│   ├── gameLogic.test.js
│   ├── gameLogic.property.test.js
│   ├── stateManager.test.js
│   ├── stateManager.property.test.js
│   ├── uiController.test.js
│   ├── aiPlayer.test.js
│   ├── scoreboard.test.js
│   ├── battleMode.test.js
│   ├── snakeGameLogic.test.js
│   ├── snakeGameLogic.property.test.js
│   ├── snakeStateManager.test.js
│   ├── snakeStateManager.property.test.js
│   ├── inputHandler.test.js
│   ├── inputHandler.property.test.js
│   ├── tabSwitching.property.test.js
│   ├── integration.test.js
│   └── ticTacToeGame.test.js
├── index.html                 # Single-page application
├── script.js                  # Main entry point with tab switching
├── styles.css                 # Global styles
└── package.json
```

## GitHub Pages Deployment

This application is designed to work perfectly on GitHub Pages with no additional configuration required.

### Deployment Steps

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy game platform"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select your branch (usually `main`)
   - Click "Save"

3. **Access your site**:
   - Your site will be available at: `https://username.github.io/repository-name/`
   - GitHub Pages will automatically serve `index.html`

### Why It Works

This platform is perfectly suited for GitHub Pages because:
- **Single HTML file**: No routing means no 404 errors
- **Relative paths**: All resources load correctly from any directory
- **No server configuration**: No need for redirects or rewrites
- **Static assets only**: Everything is a static file
- **No build step required**: Deploy directly from your repository

### Local Testing

To test locally before deploying:
```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a simple HTTP server
npx http-server .
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

## Architecture

### Simple Single-Page Application

The platform uses a straightforward tab-based architecture:

**Key Design Principles:**
- **No routing complexity**: Simple show/hide of game containers
- **State preservation**: Games stay initialized when switching tabs
- **Direct imports**: Both games load on page initialization
- **GitHub Pages compatible**: Works perfectly with static file serving

### Tab Switching

The application uses simple DOM manipulation to switch between games:

1. **Page Load**: Both games initialize in their dedicated containers
2. **Tab Click**: Hide all containers, show selected container
3. **Visual Feedback**: Update tab styling to show active game
4. **State Maintained**: Game instances persist across tab switches

**Implementation:**
```javascript
function showGame(gameName) {
  // Hide all game containers
  document.querySelectorAll('.game-container').forEach(container => {
    container.style.display = 'none';
  });
  
  // Show selected game container
  document.getElementById(`${gameName}-container`).style.display = 'block';
  
  // Update tab styling
  updateTabStyles(gameName);
}
```

### Game Lifecycle

Each game follows a simple lifecycle:

1. **Initialization**: On page load, both games' `init(container)` methods are called
2. **Active**: Game runs and handles user interaction in its container
3. **Hidden**: When tab switches, container is hidden but game instance persists
4. **Shown**: When tab is clicked again, container is shown with preserved state

## Testing Strategy

This project uses two complementary testing approaches:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across randomly generated inputs using fast-check

Each property-based test runs 100 iterations by default to ensure comprehensive coverage.

### Test Coverage

The platform includes comprehensive tests for:

**Platform Components:**
- Tab Switching: Container visibility, tab styling, state preservation
- Integration: Page load, game initialization, tab navigation

**Snake Game:**
- Game Logic: Movement, collision detection, food generation
- State Manager: State transitions, score tracking
- Input Handler: Keyboard and touch input processing
- UI Controller: Rendering, animations

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
