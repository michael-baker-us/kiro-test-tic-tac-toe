# Design Document

## Overview

This design transforms the multi-game platform from a complex routed application into a simple single-page application (SPA) suitable for GitHub Pages deployment. The solution replaces client-side routing with a tab-based interface that shows/hides game containers, eliminating all server-side dependencies while maintaining full game functionality.

The key insight is that GitHub Pages serves static files perfectly well - we just need to stop trying to use routing features that require server configuration. By keeping everything on a single page and using simple DOM manipulation to switch between games, we achieve a robust, maintainable solution.

## Architecture

### High-Level Structure

```
index.html (Single Page)
├── Tab Navigation Bar
│   ├── Snake Tab
│   └── Tic-Tac-Toe Tab
└── Game Containers
    ├── Snake Container (show/hide)
    └── Tic-Tac-Toe Container (show/hide)
```

### Component Removal

The following components will be removed entirely:
- `src/router.js` - No routing needed
- `src/landingPage.js` - No separate landing page
- `src/gameRegistry.js` - Direct game imports instead
- `src/errorHandler.js` - Simple error handling inline

### Simplified Flow

1. **Page Load**: HTML loads with tab UI and two game containers
2. **Initialization**: JavaScript initializes both games in their containers
3. **Tab Click**: Show clicked game's container, hide the other
4. **Game Play**: Games run independently in their containers
5. **Tab Switch**: Hide current game, show other game (both stay initialized)

## Components and Interfaces

### Main Application (script.js)

The main entry point will be dramatically simplified:

```javascript
// Direct imports - no dynamic loading
import SnakeGame from './src/games/snake/index.js';
import TicTacToeGame from './src/games/tic-tac-toe/index.js';

// Game instances
let snakeGame = null;
let ticTacToeGame = null;

// Current active game
let activeGame = 'snake'; // or 'tic-tac-toe'

// Initialize both games
async function initGames() {
  const snakeContainer = document.getElementById('snake-container');
  const ticTacToeContainer = document.getElementById('tic-tac-toe-container');
  
  snakeGame = new SnakeGame();
  await snakeGame.init(snakeContainer);
  
  ticTacToeGame = new TicTacToeGame();
  await ticTacToeGame.init(ticTacToeContainer);
  
  // Show default game
  showGame('snake');
}

// Switch between games
function showGame(gameName) {
  // Hide all containers
  // Show selected container
  // Update tab styling
  activeGame = gameName;
}
```

### HTML Structure (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Collection</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <!-- Tab Navigation -->
    <nav class="game-tabs">
      <button class="tab-button active" data-game="snake">🐍 Snake</button>
      <button class="tab-button" data-game="tic-tac-toe">⭕ Tic-Tac-Toe</button>
    </nav>
    
    <!-- Game Containers -->
    <div id="snake-container" class="game-container"></div>
    <div id="tic-tac-toe-container" class="game-container" style="display: none;"></div>
  </div>
  
  <script type="module" src="script.js"></script>
</body>
</html>
```

### Tab Navigation System

Simple event-driven tab switching:

```javascript
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const gameName = button.dataset.game;
      showGame(gameName);
      updateTabStyles(gameName);
    });
  });
}

function updateTabStyles(activeGameName) {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    if (button.dataset.game === activeGameName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}
```

## Data Models

No complex data models needed. Simple state tracking:

```javascript
const appState = {
  activeGame: 'snake',  // Current visible game
  gamesInitialized: false  // Whether games have been loaded
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single visible game container

*For any* sequence of tab clicks, exactly one game container should be visible (have display !== 'none') after each click
**Validates: Requirements 1.2**

### Property 2: Active tab styling consistency

*For any* tab selection, the selected tab should have the 'active' class and all other tabs should not have the 'active' class
**Validates: Requirements 3.2**

### Property 3: Game instance persistence

*For any* sequence of tab switches, game instances should never be recreated - the same object references should be maintained throughout the application lifecycle
**Validates: Requirements 1.3, 2.3, 2.4**

## Error Handling

Simplified error handling without a dedicated error handler class:

### Initialization Errors

```javascript
try {
  await initGames();
} catch (error) {
  console.error('Failed to initialize games:', error);
  document.getElementById('app').innerHTML = `
    <div class="error-message">
      <h2>Failed to load games</h2>
      <p>${error.message}</p>
      <button onclick="location.reload()">Reload Page</button>
    </div>
  `;
}
```

### Game Loading Errors

If a specific game fails to load, show error in that game's container:

```javascript
try {
  snakeGame = new SnakeGame();
  await snakeGame.init(snakeContainer);
} catch (error) {
  snakeContainer.innerHTML = `
    <div class="game-error">
      <h3>Snake game failed to load</h3>
      <p>${error.message}</p>
    </div>
  `;
}
```

## Testing Strategy

### Unit Tests

- **Tab switching logic**: Verify correct containers show/hide
- **Tab styling updates**: Verify active class applied correctly
- **Game initialization**: Verify both games initialize successfully
- **Error handling**: Verify errors display appropriately

### Property-Based Tests

We will use **fast-check** for property-based testing with a minimum of 100 iterations per test.

Each property-based test must:
- Be tagged with: `**Feature: github-pages-simplification, Property {number}: {property_text}**`
- Implement exactly one correctness property from this design document
- Run at least 100 iterations

Property-based tests will verify:

1. **Property 1 (Single visible game)**: Generate random sequences of tab clicks, verify exactly one container is visible after each click
2. **Property 2 (Tab-container correspondence)**: Generate random tab selections, verify the correct container is visible
3. **Property 3 (Game persistence)**: Generate random navigation sequences, verify game instances are not recreated

### Integration Tests

- **Full application flow**: Load page, switch tabs, verify games work
- **State preservation**: Play game, switch tabs, return, verify state preserved
- **Error recovery**: Simulate errors, verify error messages display

## File Changes Summary

### Files to Delete
- `src/router.js`
- `src/landingPage.js`
- `src/gameRegistry.js`
- `src/errorHandler.js`
- Related test files for deleted components

### Files to Modify
- `index.html` - New simplified structure with tabs
- `script.js` - Simplified initialization and tab switching
- `styles.css` - Add tab navigation styles, remove landing page styles

### Files to Keep Unchanged
- `src/games/snake/*` - All Snake game files
- `src/games/tic-tac-toe/*` - All Tic-Tac-Toe game files
- Game-specific test files

## Deployment Considerations

### GitHub Pages Compatibility

This design is perfectly suited for GitHub Pages because:

1. **Single HTML file**: No routing means no 404 errors
2. **Relative paths**: All resources load from the same directory
3. **No server config**: No need for redirects or rewrites
4. **Static assets**: Everything is a static file
5. **No build step**: Can deploy directly from repository

### Deployment Steps

1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select branch (usually `main` or `gh-pages`)
4. Access at `https://username.github.io/repository-name/`

No additional configuration files needed (no `404.html`, no `_config.yml`).

## Performance Considerations

### Initialization

Both games initialize on page load. This is acceptable because:
- Games are lightweight
- No network requests for game code (bundled)
- Users will likely play both games in a session

### Memory

Both games stay in memory. This is acceptable because:
- Modern browsers handle this easily
- Games are small (< 1MB combined)
- Better UX than destroying/recreating games

### Alternative: Lazy Initialization

If performance becomes an issue, games could be initialized on first tab click:

```javascript
async function showGame(gameName) {
  if (gameName === 'snake' && !snakeGame) {
    snakeGame = new SnakeGame();
    await snakeGame.init(snakeContainer);
  }
  // ... show container
}
```

This optimization is not included in the initial implementation but could be added later if needed.

## Migration Path

### Backward Compatibility

This change breaks URL-based navigation:
- Old: `https://site.com/snake` 
- New: `https://site.com/` (with tabs)

Since the old URLs don't work on GitHub Pages anyway, this is not a regression.

### User Impact

Users will notice:
- ✅ Faster game switching (no page reload)
- ✅ State preserved when switching games
- ✅ Simpler, cleaner interface
- ✅ Reliable loading on GitHub Pages
- ❌ Can't share direct links to specific games (acceptable trade-off)

## Future Enhancements

If more games are added:

1. **Dropdown menu**: If > 4 games, use dropdown instead of tabs
2. **Lazy loading**: Initialize games on first view
3. **URL hash**: Use `#snake` for bookmarking (optional, doesn't require server)

These enhancements are not part of this specification but could be added later without major refactoring.
