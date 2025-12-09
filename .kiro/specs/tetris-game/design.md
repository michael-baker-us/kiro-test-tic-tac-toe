# Tetris Game Design Document

## Overview

The Tetris game will be implemented as a modular JavaScript application following the same architectural patterns as the existing Snake and Tic-Tac-Toe games. The implementation will use a component-based architecture with clear separation between game logic, state management, UI rendering, and input handling.

The game will feature classic Tetris mechanics including:
- Seven standard Tetromino pieces (I, O, T, S, Z, J, L)
- Standard Tetris rotation system with wall kicks (SRS - Super Rotation System)
- Progressive difficulty with increasing drop speeds
- Line clearing with standard scoring
- Next piece preview and ghost piece visualization
- Pause/resume functionality
- Integration with the existing multi-game interface

## Architecture

The Tetris game will follow a modular architecture with the following components:

```
src/games/tetris/
├── index.js           # Game wrapper implementing the Game interface
├── stateManager.js    # Centralized state management
├── gameLogic.js       # Core Tetris logic (collision, rotation, line clearing)
├── pieceDefinitions.js # Tetromino shapes, colors, and rotation data
├── uiController.js    # DOM manipulation and rendering
├── inputHandler.js    # Keyboard input processing
└── gameLoop.js        # Game loop and timing control
```

### Component Responsibilities

**index.js (Game Wrapper)**
- Implements the standard Game interface (init, destroy)
- Coordinates all other components
- Manages component lifecycle
- Handles integration with the main application

**stateManager.js**
- Maintains the complete game state
- Provides state access and mutation methods
- Implements observer pattern for state changes
- Manages game status (playing, paused, game over)

**gameLogic.js**
- Collision detection
- Piece rotation with wall kicks
- Line clearing logic
- Scoring calculations
- Game over detection
- Ghost piece calculation

**pieceDefinitions.js**
- Tetromino shape matrices for all rotations
- Color definitions for each piece type
- Wall kick offset data (SRS standard)
- Spawn positions

**uiController.js**
- Renders the game board using Canvas API
- Displays current piece, ghost piece, and locked pieces
- Shows next piece preview
- Updates score, level, and lines display
- Renders pause and game over screens

**inputHandler.js**
- Captures keyboard events
- Implements key repeat for smooth movement
- Handles pause/resume controls
- Provides input debouncing for rotation

**gameLoop.js**
- Manages the game tick cycle
- Controls automatic piece dropping based on level
- Handles timing for lock delay
- Provides start/stop/pause functionality

## Data Models

### Game State

```javascript
{
  // Board state
  board: Array<Array<string|null>>,  // 20x10 grid, null for empty, color string for filled
  
  // Current piece
  currentPiece: {
    type: string,        // 'I', 'O', 'T', 'S', 'Z', 'J', 'L'
    rotation: number,    // 0, 1, 2, 3
    x: number,          // Column position (0-9)
    y: number,          // Row position (0-19)
    color: string       // CSS color
  },
  
  // Next piece
  nextPiece: {
    type: string,
    color: string
  },
  
  // Game statistics
  score: number,
  level: number,
  linesCleared: number,
  
  // Game status
  gameStatus: 'playing' | 'paused' | 'gameOver',
  
  // Timing
  dropSpeed: number,      // Milliseconds per row
  lastDropTime: number,   // Timestamp of last automatic drop
  lockDelay: number,      // Milliseconds before piece locks (500ms)
  lockDelayStart: number  // Timestamp when piece first touched ground
}
```

### Tetromino Definitions

Each Tetromino will be defined with:
- 4 rotation states (matrices)
- Color
- Wall kick offset data

```javascript
{
  I: {
    color: '#00f0f0',  // Cyan
    rotations: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    wallKicks: { /* I-piece specific SRS data */ }
  },
  // ... other pieces
}
```

### Wall Kick Data

Following the Super Rotation System (SRS) standard:

```javascript
{
  // Standard pieces (J, L, S, T, Z)
  standard: {
    '0->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '1->0': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    '1->2': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    '2->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '2->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
    '3->2': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '3->0': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '0->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]]
  },
  
  // I-piece specific
  I: {
    '0->1': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
    '1->0': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
    '1->2': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
    '2->1': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
    '2->3': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
    '3->2': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
    '3->0': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
    '0->3': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]]
  },
  
  // O-piece (no wall kicks, no rotation)
  O: {}
}
```

## Components and Interfaces

### State Manager Interface

```javascript
{
  // State access
  getState(): GameState
  
  // Game control
  startGame(): void
  pauseGame(): void
  resumeGame(): void
  resetGame(): void
  
  // Piece manipulation
  movePiece(dx: number, dy: number): boolean
  rotatePiece(direction: 'cw' | 'ccw'): boolean
  hardDrop(): void
  
  // Game progression
  lockPiece(): void
  spawnNextPiece(): boolean
  clearLines(): number
  updateScore(points: number): void
  updateLevel(): void
  
  // Observers
  subscribe(callback: Function): Function
}
```

### Game Logic Interface

```javascript
{
  // Collision detection
  checkCollision(board, piece, x, y, rotation): boolean
  
  // Rotation
  getRotatedPiece(piece, direction): Piece
  tryWallKicks(board, piece, oldRotation, newRotation, x, y): {x, y, rotation} | null
  
  // Line clearing
  findFullLines(board): Array<number>
  clearLines(board, lineIndices): Array<Array>
  
  // Scoring
  calculateScore(linesCleared, level, dropDistance): number
  
  // Ghost piece
  calculateGhostPosition(board, piece): number
  
  // Game over
  isGameOver(board, piece): boolean
}
```

### UI Controller Interface

```javascript
{
  init(): void
  destroy(): void
  render(state): void
  renderBoard(board, currentPiece, ghostY): void
  renderNextPiece(piece): void
  renderStats(score, level, lines): void
  renderPauseScreen(): void
  renderGameOverScreen(score): void
}
```

### Input Handler Interface

```javascript
{
  init(): void
  destroy(): void
  setCallbacks(callbacks): void
  // Callbacks: onMoveLeft, onMoveRight, onRotateCW, onRotateCCW, 
  //            onSoftDrop, onHardDrop, onPause
}
```

### Game Loop Interface

```javascript
{
  start(): void
  stop(): void
  pause(): void
  resume(): void
  setDropSpeed(speed): void
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid movement preserves single-step displacement
*For any* valid board state and active piece, when a movement command (left/right/down) is executed and the destination is valid, the piece position should change by exactly one unit in the commanded direction; when invalid, the position should remain unchanged.
**Validates: Requirements 1.1, 1.2, 1.7**

### Property 2: Rotation changes orientation correctly
*For any* valid board state and active piece, when a rotation command (clockwise/counter-clockwise) is executed and the rotation is valid, the piece rotation state should change by exactly +1 mod 4 (clockwise) or -1 mod 4 (counter-clockwise); when invalid, the rotation state should remain unchanged.
**Validates: Requirements 1.3, 1.4, 1.7**

### Property 3: Hard drop reaches ghost position
*For any* board state and active piece, executing a hard drop should move the piece to the same position as the calculated ghost piece position.
**Validates: Requirements 1.6, 6.1**

### Property 4: Piece spawns at correct position
*For any* game state after a piece locks or game starts, a new active piece should spawn at the top-center position (x=3 for most pieces, x=4 for O-piece, y=0).
**Validates: Requirements 2.1**

### Property 5: Automatic drop moves down one row
*For any* playing game state, when the drop speed interval elapses, the active piece should move down by exactly one row if valid, or lock if at the bottom.
**Validates: Requirements 2.2, 2.5**

### Property 6: Blocked spawn triggers game over
*For any* board state where the spawn position is occupied by locked pieces, attempting to spawn a new piece should transition the game to game over status.
**Validates: Requirements 2.4**

### Property 7: Complete rows are cleared
*For any* board state containing one or more completely filled rows, the line clearing operation should remove exactly those rows and only those rows.
**Validates: Requirements 3.1**

### Property 8: Gravity applies after line clear
*For any* board state after clearing lines, all rows above the cleared lines should shift down by exactly the number of cleared lines, preserving their relative order and content.
**Validates: Requirements 3.2**

### Property 9: Line clear scoring formula
*For any* line clear event, the score increase should equal `baseScore * level` where baseScore is 100 for 1 line, 300 for 2 lines, 500 for 3 lines, and 800 for 4 lines.
**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

### Property 10: Hard drop scoring
*For any* hard drop execution, the score increase should equal exactly 2 points multiplied by the number of rows the piece dropped.
**Validates: Requirements 3.7**

### Property 11: Level progression
*For any* game state, the level should equal `1 + floor(totalLinesCleared / 10)`.
**Validates: Requirements 4.2**

### Property 12: Drop speed formula
*For any* level value, the drop speed should equal `max(100, 1000 - (level - 1) * 100)` milliseconds.
**Validates: Requirements 4.3, 4.4**

### Property 13: Next piece advances in sequence
*For any* piece spawn event, the previous next piece should become the current piece, and a new next piece should be selected from the sequence.
**Validates: Requirements 5.3**

### Property 14: Pause prevents state changes
*For any* paused game state, gameplay inputs (movement, rotation, drop) should not modify the board, piece position, or score.
**Validates: Requirements 7.2**

### Property 15: Wall kicks attempt correct offsets
*For any* rotation that initially causes collision, the system should attempt wall kick offsets in the order specified by the SRS standard for that piece type and rotation transition.
**Validates: Requirements 8.1, 8.3, 8.4**

### Property 16: Failed rotations preserve state
*For any* rotation attempt where all wall kick positions result in collision, the piece position and rotation should remain unchanged.
**Validates: Requirements 8.2**

### Property 17: O-piece rotation is no-op
*For any* O-piece in any position, rotation commands should not change the piece position or rotation state.
**Validates: Requirements 8.5**

### Property 18: Game reset returns to initial state
*For any* game state (including game over), executing a reset should return the game to initial state with empty board, score=0, level=1, linesCleared=0, and a new piece spawned.
**Validates: Requirements 10.3, 10.4**

### Property 19: Piece color mapping
*For any* piece type, the assigned color should match the standard Tetris color scheme: I=cyan, O=yellow, T=purple, S=green, Z=red, J=blue, L=orange.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7**

## Error Handling

### Input Validation
- Invalid movement/rotation commands should be silently ignored
- Out-of-bounds positions should be prevented by collision detection
- Invalid piece types should throw errors during initialization

### State Validation
- Board dimensions must be exactly 10x20
- Piece positions must be within valid ranges
- Rotation values must be 0-3
- Level must be positive integer
- Score and lines cleared must be non-negative

### Edge Cases
- **Empty board**: Game should function normally with no locked pieces
- **Full board**: Should trigger game over when spawn is blocked
- **Rapid inputs**: Input handler should debounce rotation to prevent double-rotations
- **Simultaneous inputs**: Only one movement per frame should be processed
- **Lock delay edge**: Piece should lock after delay even if player is still inputting moves
- **Wall kick failures**: Should gracefully fall back to no rotation
- **Level overflow**: Drop speed should cap at minimum (100ms)

### Game Loop Edge Cases
- **Tab switching**: Game should pause when window loses focus
- **Rapid pause/resume**: Should handle multiple pause toggles correctly
- **Game over during drop**: Should complete the drop before showing game over

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Game Logic Tests:**
- Collision detection with board boundaries
- Collision detection with locked pieces
- Line clearing with various patterns (single, double, triple, quad)
- Scoring calculations for different scenarios
- Ghost piece calculation edge cases (empty board, full column)
- Game over detection when spawn is blocked

**State Management Tests:**
- Initial state values
- State transitions (playing → paused → playing)
- State transitions (playing → game over)
- Reset functionality

**Piece Definitions Tests:**
- All 7 piece types have 4 rotations (except O-piece)
- Rotation matrices are 4x4
- Colors are valid CSS color strings
- Wall kick data exists for all rotation transitions

**Input Handler Tests:**
- Key mapping correctness
- Event listener cleanup on destroy

**Integration Tests:**
- Game initialization and cleanup
- Tab switching behavior
- Full game flow (start → play → game over → restart)

### Property-Based Testing

Property-based tests will verify universal properties using the fast-check library with a minimum of 100 iterations per test.

**Testing Framework:** fast-check (already used in the project)

**Test Configuration:**
- Minimum 100 runs per property test
- Custom generators for board states, pieces, and positions
- Shrinking enabled to find minimal failing cases

**Property Test Requirements:**
- Each property-based test MUST include a comment with the format: `// Feature: tetris-game, Property {number}: {property_text}`
- Each property-based test MUST reference the requirements it validates
- Each correctness property MUST be implemented by exactly ONE property-based test

**Custom Generators:**

```javascript
// Generate valid board states
const boardArb = fc.array(
  fc.array(fc.constantFrom(null, 'cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'), 
  { minLength: 10, maxLength: 10 }),
  { minLength: 20, maxLength: 20 }
);

// Generate piece types
const pieceTypeArb = fc.constantFrom('I', 'O', 'T', 'S', 'Z', 'J', 'L');

// Generate rotations
const rotationArb = fc.integer({ min: 0, max: 3 });

// Generate valid positions
const xPositionArb = fc.integer({ min: 0, max: 9 });
const yPositionArb = fc.integer({ min: 0, max: 19 });

// Generate piece states
const pieceArb = fc.record({
  type: pieceTypeArb,
  rotation: rotationArb,
  x: xPositionArb,
  y: yPositionArb
});

// Generate game states
const gameStateArb = fc.record({
  board: boardArb,
  currentPiece: pieceArb,
  score: fc.nat(),
  level: fc.integer({ min: 1, max: 20 }),
  linesCleared: fc.nat()
});
```

**Property Tests to Implement:**
- Property 1: Valid movement (test with random boards and pieces)
- Property 2: Rotation correctness (test with random pieces and rotations)
- Property 3: Hard drop destination (test with random boards and pieces)
- Property 7: Line clearing (test with boards containing full rows)
- Property 8: Gravity after clear (test with various line clear scenarios)
- Property 9: Scoring formula (test with all line clear counts and levels)
- Property 11: Level progression (test with various line counts)
- Property 12: Drop speed formula (test with all level values)
- Property 15: Wall kick attempts (test with collision scenarios)
- Property 16: Failed rotation preservation (test with impossible rotations)
- Property 17: O-piece rotation (test with all O-piece positions)
- Property 18: Reset state (test from various game states)
- Property 19: Color mapping (test all piece types)

## Implementation Notes

### Canvas Rendering
- Use a single canvas element for the main game board
- Separate canvas for next piece preview
- Cell size: 30x30 pixels
- Board size: 300x600 pixels (10x20 cells)
- Use `requestAnimationFrame` for smooth rendering

### Performance Considerations
- Minimize DOM manipulation by using canvas
- Only re-render when state changes
- Use efficient collision detection (check only piece cells)
- Cache piece rotation matrices

### Browser Compatibility
- Target modern browsers with ES6+ support
- Use standard Canvas API (widely supported)
- No external dependencies beyond fast-check for testing

### Integration with Existing Games
- Follow the same module structure as Snake and Tic-Tac-Toe
- Implement the standard Game interface (init, destroy)
- Add Tetris tab to the navigation
- Use consistent styling with existing games
- Ensure proper cleanup on tab switch

### Accessibility Considerations
- Provide keyboard-only controls
- Use high-contrast colors for pieces
- Display clear game state information
- Provide visual feedback for all actions
