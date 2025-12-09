# Snake Game Design Document

## Overview

The Snake game is a classic arcade game where the player controls a continuously moving snake that grows longer as it consumes food. The game ends when the snake collides with itself or the game boundaries. This implementation will follow the existing multi-game platform architecture, using a modular design with separated concerns for game logic, state management, UI rendering, and input handling.

The game will be mobile-friendly with touch controls (swipe gestures) and keyboard controls, making it playable on GitHub Pages across all devices. The implementation will use vanilla JavaScript with ES6 modules, following the same patterns established by the tic-tac-toe game.

## Architecture

The Snake game follows a Model-View-Controller (MVC) architecture with clear separation of concerns:

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Multi-Game Platform                   │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │   Router   │  │ Registry │  │  Landing Page    │   │
│  └────────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Snake Game Module                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │              index.js (Game Wrapper)               │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│         ┌────────────────┼────────────────┐             │
│         ▼                ▼                ▼             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │ Game Logic  │  │   State     │  │     UI       │   │
│  │  (Pure)     │  │  Manager    │  │  Controller  │   │
│  └─────────────┘  └─────────────┘  └──────────────┘   │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          ▼                               │
│                  ┌──────────────┐                       │
│                  │    Input     │                       │
│                  │   Handler    │                       │
│                  └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

### Module Responsibilities

1. **index.js (Game Wrapper)**: Entry point that implements the game interface expected by the platform (init/destroy methods)

2. **gameLogic.js**: Pure functions for game mechanics (collision detection, food spawning, snake movement)

3. **stateManager.js**: Manages game state with observable pattern for state changes

4. **uiController.js**: Handles rendering the game board, snake, food, and UI elements

5. **inputHandler.js**: Processes keyboard and touch input, converts to directional commands

## Components and Interfaces

### Game Interface (index.js)

The main game module exports a factory function that returns an object conforming to the platform's game interface:

```javascript
export default function createSnakeGame() {
  return {
    init(containerElement): Promise<void>
    destroy(): void
  }
}
```

### Game Logic Module (gameLogic.js)

Pure functions for game mechanics:

```javascript
// Board and initialization
createGameBoard(width, height): Board
initializeSnake(board): Snake

// Movement and collision
moveSnake(snake, direction): Snake
checkBoundaryCollision(head, board): boolean
checkSelfCollision(head, body): boolean

// Food management
spawnFood(board, snake): Position
checkFoodCollision(head, foodPosition): boolean

// Direction validation
isOppositeDirection(current, new): boolean
isValidDirection(direction): boolean

// Utility
getRandomEmptyPosition(board, snake): Position
```

### State Manager (stateManager.js)

Manages game state with observable pattern:

```javascript
createStateManager(config): {
  getState(): GameState
  subscribe(listener): unsubscribe
  updateDirection(direction): void
  tick(): void  // Called by game loop
  consumeFood(): void
  resetGame(): void
  pauseGame(): void
  resumeGame(): void
  increaseSpeed(): void
}
```

**GameState Structure:**
```javascript
{
  snake: {
    head: { x, y },
    body: [{ x, y }, ...],
    direction: 'up' | 'down' | 'left' | 'right'
  },
  food: { x, y },
  score: number,
  gameStatus: 'playing' | 'paused' | 'gameOver',
  speed: number,  // milliseconds per move
  boardWidth: number,
  boardHeight: number
}
```

### UI Controller (uiController.js)

Handles all rendering and visual updates:

```javascript
createUIController(stateManager, container): {
  init(): void
  render(state): void
  destroy(): void
  showGameOver(score): void
  showPauseIndicator(): void
  hidePauseIndicator(): void
}
```

### Input Handler (inputHandler.js)

Processes user input from keyboard and touch:

```javascript
createInputHandler(onDirectionChange, onPause, onRestart): {
  init(element): void
  destroy(): void
  enableTouchControls(): void
  disableTouchControls(): void
}
```

## Data Models

### Position
```javascript
{
  x: number,  // 0 to boardWidth-1
  y: number   // 0 to boardHeight-1
}
```

### Snake
```javascript
{
  head: Position,
  body: Position[],  // Ordered from neck to tail
  direction: 'up' | 'down' | 'left' | 'right'
}
```

### Board
```javascript
{
  width: number,   // Number of cells horizontally
  height: number   // Number of cells vertically
}
```

### GameConfig
```javascript
{
  boardWidth: number,      // Default: 20
  boardHeight: number,     // Default: 20
  initialSpeed: number,    // Default: 200ms
  speedIncrement: number,  // Default: 10ms
  speedThreshold: number,  // Default: 50 points per speed increase
  minSpeed: number,        // Default: 50ms (maximum speed)
  initialSnakeLength: number  // Default: 3
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, several redundant properties were identified:

- Properties 1.2, 1.3, 1.4 are redundant with 1.1 - they can be combined into a single "directional input" property
- Property 3.4 is redundant with 3.1 - both test snake length increase on food consumption
- Property 5.2 is redundant with 3.5 - both test score increase on food consumption
- Property 7.2 is redundant with 1.6 - both test swipe gesture processing
- Property 9.5 is redundant with 6.5 - both test speed reset on new game
- Property 10.1 is redundant with 2.5 - both test pause behavior
- Property 10.5 is redundant with 10.3 - both test state preservation during pause
- Boundary collision cases (4.1-4.4) are edge cases that will be handled by property test generators

The following properties provide unique validation value and will be implemented:

### Core Movement Properties

Property 1: Directional input changes direction
*For any* valid game state and valid direction input (up, down, left, right), applying the direction change should update the snake's direction to the new direction (unless it's the opposite direction).
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

Property 2: Opposite direction rejection
*For any* snake moving in a direction, attempting to change to the directly opposite direction should be ignored and the current direction maintained.
**Validates: Requirements 1.5**

Property 3: Swipe direction calculation
*For any* touch start and end coordinates where the distance exceeds the minimum threshold, the calculated swipe direction should match the primary axis of movement (horizontal or vertical with greater delta).
**Validates: Requirements 1.6**

Property 4: Snake head advances correctly
*For any* snake and direction, moving the snake should place the new head exactly one cell in the specified direction from the current head.
**Validates: Requirements 2.2**

Property 5: Snake length preservation without food
*For any* snake that moves without consuming food, the snake length should remain constant (tail removed when head added).
**Validates: Requirements 2.3**

Property 6: Pause stops movement
*For any* game state in paused status, calling tick should not change the snake's position.
**Validates: Requirements 2.5, 10.1**

### Food and Growth Properties

Property 7: Food consumption increases length
*For any* snake that consumes food, the snake length should increase by exactly one segment.
**Validates: Requirements 3.1, 3.4**

Property 8: Food respawns after consumption
*For any* food consumption event, the new food position should be different from the consumed food position and should not overlap with any snake segment.
**Validates: Requirements 3.2, 3.3**

Property 9: Food consumption increases score
*For any* game state where food is consumed, the score should increase by exactly 10 points.
**Validates: Requirements 3.5, 5.2**

### Collision Detection Properties

Property 10: Self-collision ends game
*For any* snake where the head position equals any body segment position, the game status should be 'gameOver'.
**Validates: Requirements 4.5**

Property 11: Game over stops movement
*For any* game state with status 'gameOver', calling tick should not change the snake position or any other game state.
**Validates: Requirements 4.6**

### Reset and Initialization Properties

Property 12: Reset returns to initial state
*For any* game state, calling reset should return the game to initial conditions: score = 0, snake at starting position with initial length, speed at initial value, and status = 'playing'.
**Validates: Requirements 5.5, 6.2, 6.3, 6.5, 9.5**

Property 13: Food spawns on reset
*For any* game state, calling reset should spawn food at a position that does not overlap with the initial snake position.
**Validates: Requirements 6.4**

### Speed Progression Properties

Property 14: Speed increases at thresholds
*For any* score that crosses a speed threshold (multiples of 50), the game speed should be faster than the previous speed (lower interval value).
**Validates: Requirements 9.2**

Property 15: Speed never exceeds maximum
*For any* game state, the speed value (interval) should never be less than the minimum speed (maximum velocity).
**Validates: Requirements 9.4**

### Pause/Resume Properties

Property 16: Resume preserves state
*For any* game state that is paused and then resumed, all game state values (snake position, score, food position) should remain unchanged except the status.
**Validates: Requirements 10.3, 10.5**

Property 17: Pause ignores direction input
*For any* game state with status 'paused', attempting to change direction should not update the snake's direction.
**Validates: Requirements 10.4**

## Error Handling

### Input Validation

1. **Invalid Direction Input**: The system will validate all direction inputs and ignore invalid values
2. **Out of Bounds Input**: Touch coordinates outside the game board will be ignored
3. **Rapid Input**: Multiple direction changes between game ticks will be queued, with only the most recent valid change applied

### Game State Errors

1. **Invalid State Transitions**: The state manager will validate all state transitions and prevent invalid changes
2. **Food Spawn Failures**: If the board is completely full (snake occupies all cells), the game will end as a win condition
3. **Collision Detection Failures**: All collision checks will be performed before state updates to ensure consistency

### UI Rendering Errors

1. **Missing DOM Elements**: The UI controller will validate that all required DOM elements exist before rendering
2. **Invalid State Rendering**: If the state is invalid, the UI will display an error message and offer to restart
3. **Animation Frame Errors**: If requestAnimationFrame fails, the game will fall back to setTimeout

### Platform Integration Errors

1. **Container Not Found**: If the container element is not provided or invalid, the init method will throw an error
2. **Cleanup Failures**: The destroy method will safely handle cleanup even if some resources are already released
3. **Event Listener Errors**: All event listeners will be wrapped in try-catch blocks to prevent crashes

## Testing Strategy

### Dual Testing Approach

The Snake game will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing

The implementation will use **fast-check** as the property-based testing library for JavaScript. This library provides:
- Arbitrary generators for creating random test inputs
- Shrinking capabilities to find minimal failing cases
- Configurable test runs for thorough coverage

**Configuration Requirements:**
- Each property-based test MUST run a minimum of 100 iterations
- Each property-based test MUST be tagged with a comment explicitly referencing the correctness property from this design document
- Tag format: `// Feature: snake-game, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Property Test Implementation:**

Each of the 17 correctness properties listed above will be implemented as a separate property-based test. The tests will use custom arbitraries (generators) for:
- Random game states (snake positions, directions, scores)
- Random board configurations
- Random input sequences (directions, touch coordinates)
- Random collision scenarios

**Example Property Test Structure:**
```javascript
it('Property 1: Directional input changes direction', () => {
  fc.assert(
    fc.property(gameStateArb, directionArb, (state, direction) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

### Unit Testing

Unit tests will cover:
- Specific initialization scenarios (empty board, initial snake placement)
- Edge cases (boundary collisions at each wall, minimum/maximum speeds)
- Error conditions (invalid inputs, missing DOM elements)
- Integration points (platform interface, event handlers)
- UI rendering (game over screen, pause indicator, score display)

Unit tests will be organized by module:
- `gameLogic.test.js` - Pure function tests
- `stateManager.test.js` - State management tests
- `uiController.test.js` - Rendering tests
- `inputHandler.test.js` - Input processing tests
- `snakeGame.test.js` - Integration tests

### Test Coverage Goals

- **Line Coverage**: Minimum 80% for all modules
- **Branch Coverage**: Minimum 75% for game logic
- **Property Coverage**: 100% of correctness properties implemented
- **Edge Case Coverage**: All boundary conditions tested

## Game Loop Design

The game loop will use `requestAnimationFrame` for smooth rendering with a fixed time step for game logic updates:

```javascript
let lastUpdateTime = 0;
const updateInterval = state.speed; // milliseconds per move

function gameLoop(currentTime) {
  if (state.gameStatus !== 'playing') {
    return; // Stop loop if not playing
  }
  
  const deltaTime = currentTime - lastUpdateTime;
  
  if (deltaTime >= updateInterval) {
    stateManager.tick(); // Update game state
    lastUpdateTime = currentTime;
  }
  
  requestAnimationFrame(gameLoop);
}
```

This approach ensures:
- Consistent game speed across different devices
- Smooth rendering at 60 FPS
- Decoupled game logic updates from rendering

## Mobile Optimization

### Touch Controls

The input handler will implement swipe gesture detection:

1. **Touch Start**: Record initial touch coordinates
2. **Touch Move**: Track current touch position (optional for visual feedback)
3. **Touch End**: Calculate swipe direction based on delta
4. **Direction Calculation**: 
   - If |deltaX| > |deltaY|: horizontal swipe (left/right)
   - If |deltaY| > |deltaX|: vertical swipe (up/down)
   - Minimum threshold: 30 pixels to prevent accidental swipes

### Responsive Design

The game board will scale based on viewport size:

- **Mobile Portrait**: 15x20 cells (narrower, taller)
- **Mobile Landscape**: 20x15 cells (wider, shorter)
- **Tablet/Desktop**: 20x20 cells (square)

Cell size will be calculated dynamically:
```javascript
const cellSize = Math.min(
  containerWidth / boardWidth,
  containerHeight / boardHeight
);
```

### Performance Considerations

1. **Canvas Rendering**: Use HTML5 Canvas for efficient rendering of the game board
2. **Minimal Redraws**: Only redraw changed cells, not the entire board
3. **Touch Event Optimization**: Use passive event listeners to prevent scroll blocking
4. **Memory Management**: Reuse objects instead of creating new ones each frame

## Platform Integration

### Game Registration

The Snake game will be registered in `script.js`:

```javascript
gameRegistry.registerGame({
  id: 'snake',
  name: 'Snake',
  description: 'Classic arcade game - eat food and grow longer!',
  route: '/snake',
  loader: async () => createSnakeGame(),
  thumbnail: 'assets/snake-thumbnail.png' // Optional
});
```

### Router Configuration

Add route handler in `script.js`:

```javascript
router.registerRoute('/snake', () => {
  showGamePage('/snake');
});
```

### HTML Structure

The game will render into the provided container with this structure:

```html
<div class="snake-game">
  <div class="game-header">
    <h1>Snake</h1>
    <div class="score-display">Score: <span id="score">0</span></div>
  </div>
  
  <canvas id="game-canvas" class="game-canvas"></canvas>
  
  <div class="game-controls">
    <button id="pause-btn" class="control-btn">Pause</button>
    <button id="restart-btn" class="control-btn">Restart</button>
  </div>
  
  <div class="game-over-overlay" id="game-over" style="display: none;">
    <h2>Game Over!</h2>
    <p class="final-score">Final Score: <span id="final-score">0</span></p>
    <button id="play-again-btn" class="primary-btn">Play Again</button>
  </div>
  
  <div class="pause-overlay" id="pause-overlay" style="display: none;">
    <h2>Paused</h2>
    <p>Press Space or tap Resume to continue</p>
  </div>
  
  <div class="mobile-instructions" id="mobile-instructions">
    <p>Swipe to control the snake</p>
  </div>
</div>
```

### CSS Styling

The game will follow the existing platform styling conventions:
- Use CSS variables for consistent theming
- Responsive grid layout for mobile compatibility
- Smooth transitions for state changes
- Touch-friendly button sizes (minimum 44x44px)

## Implementation Notes

### Development Sequence

1. Implement pure game logic functions (gameLogic.js)
2. Create state manager with observable pattern (stateManager.js)
3. Build UI controller with canvas rendering (uiController.js)
4. Implement input handler with keyboard and touch support (inputHandler.js)
5. Create game wrapper with platform interface (index.js)
6. Write property-based tests for each correctness property
7. Write unit tests for edge cases and error conditions
8. Integrate with platform (registration, routing, styling)
9. Test on mobile devices and optimize performance

### Code Quality Standards

- Use ES6 modules for all code
- Follow existing project conventions (naming, structure)
- Document all public functions with JSDoc comments
- Use pure functions where possible (especially in gameLogic.js)
- Avoid global state and side effects
- Handle all error cases gracefully

### Browser Compatibility

Target browsers:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

Required features:
- ES6 modules
- Canvas API
- Touch events
- requestAnimationFrame
- localStorage (for high scores, optional)
