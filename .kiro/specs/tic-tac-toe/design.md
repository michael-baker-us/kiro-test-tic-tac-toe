# Design Document

## Overview

The tic-tac-toe game will be implemented as a single-page web application using vanilla JavaScript, HTML, and CSS. The architecture follows a separation of concerns with distinct modules for game logic, UI rendering, and state management. The game logic will be pure and testable, with the UI layer handling DOM manipulation and user interactions.

## Architecture

The application consists of three main layers:

1. **Game Logic Layer** - Pure functions that handle game state, move validation, and win detection
2. **State Management Layer** - Manages the current game state and coordinates updates
3. **UI Layer** - Handles DOM manipulation, event listeners, and visual rendering

This separation allows the core game logic to be tested independently of the UI, and makes the codebase maintainable and extensible.

## Components and Interfaces

### Game Logic Module (`gameLogic.js`)

**Core Functions:**

- `createEmptyBoard()` - Returns a new 3x3 board represented as an array
- `isValidMove(board, position)` - Validates if a move can be made at the given position
- `makeMove(board, position, player)` - Returns a new board with the move applied
- `checkWinner(board)` - Returns the winning player ('X', 'O') or null
- `isDraw(board)` - Returns true if the board is full with no winner
- `getAvailableMoves(board)` - Returns array of available cell positions

**Board Representation:**
- 3x3 grid represented as a flat array of 9 elements
- Each element is either null (empty), 'X', or 'O'
- Positions indexed 0-8 (row-major order)

### State Manager (`stateManager.js`)

**Responsibilities:**
- Maintains current game state (board, current player, game status)
- Provides methods to update state
- Notifies UI of state changes

**State Structure:**
```javascript
{
  board: Array(9),      // Current board state
  currentPlayer: 'X',   // 'X' or 'O'
  gameStatus: 'playing', // 'playing', 'won', 'draw'
  winner: null          // null, 'X', or 'O'
}
```

**Methods:**
- `getState()` - Returns current state
- `makeMove(position)` - Attempts to make a move and updates state
- `resetGame()` - Resets to initial state
- `subscribe(callback)` - Registers callback for state changes

### UI Controller (`uiController.js`)

**Responsibilities:**
- Renders game board and status
- Handles user interactions
- Updates display based on state changes

**Methods:**
- `render(state)` - Updates DOM to reflect current state
- `attachEventListeners()` - Sets up click handlers
- `showMessage(message)` - Displays game status messages
- `highlightWinningCells(positions)` - Visual feedback for winning line

## Data Models

### Board State
- Type: `Array<'X' | 'O' | null>`
- Length: 9
- Immutable operations (functions return new boards)

### Player
- Type: `'X' | 'O'`
- X always goes first

### Game Status
- Type: `'playing' | 'won' | 'draw'`

### Position
- Type: `number` (0-8)
- Maps to board array index

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing the acceptance criteria, several properties can be combined or are redundant. Properties 2.1, 2.2, and 2.3 (horizontal, vertical, diagonal wins) can be unified into a single comprehensive win detection property. Property 5.2 is redundant with 1.3 as both test player switching.

### Property 1: Valid move placement

*For any* board state and any empty cell position, when a move is made by the current player, the resulting board SHALL contain that player's mark at the specified position.

**Validates: Requirements 1.1**

### Property 2: Invalid move rejection

*For any* board state and any occupied cell position, when a move is attempted at that position, the board state SHALL remain unchanged.

**Validates: Requirements 1.2**

### Property 3: Player alternation

*For any* valid game state where a legal move is made, the current player SHALL switch from X to O or from O to X.

**Validates: Requirements 1.3**

### Property 4: Win detection completeness

*For any* board configuration containing three identical marks in a row (horizontal, vertical, or diagonal), the win detection function SHALL correctly identify the winning player.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: Post-win move prevention

*For any* board state where a win condition exists, attempting to make additional moves SHALL be rejected and the board SHALL remain unchanged.

**Validates: Requirements 2.4**

### Property 6: Draw detection

*For any* board state where all nine cells are filled and no win condition exists, the game SHALL be identified as a draw.

**Validates: Requirements 3.1**

### Property 7: Post-draw move prevention

*For any* board state identified as a draw, attempting to make additional moves SHALL be rejected and the board SHALL remain unchanged.

**Validates: Requirements 3.3**

### Property 8: Game reset to empty board

*For any* game state (in progress, won, or draw), when reset is called, the resulting board SHALL contain nine empty cells.

**Validates: Requirements 4.1**

### Property 9: Game reset to player X

*For any* game state, when reset is called, the current player SHALL be set to X.

**Validates: Requirements 4.2**

### Property 10: Post-reset move acceptance

*For any* finished game state (won or draw), after reset is called, valid moves SHALL be accepted and processed normally.

**Validates: Requirements 4.4**

## Error Handling

The game logic will handle errors gracefully:

- **Invalid position** - Positions outside 0-8 range will be rejected
- **Occupied cell** - Moves to occupied cells will be rejected silently
- **Game finished** - Moves after game end will be rejected
- **Invalid player** - Only 'X' and 'O' are valid players

All game logic functions will validate inputs and return appropriate values (null, false, or unchanged state) for invalid operations rather than throwing exceptions.

## Testing Strategy

The testing approach combines unit tests for specific scenarios with property-based tests for universal correctness guarantees.

### Unit Testing

Unit tests will cover:
- Specific win patterns (example boards with known outcomes)
- Edge cases like empty board, single move, full board
- Reset functionality with specific game states
- UI rendering with known states

**Framework:** We'll use a lightweight testing framework compatible with browser JavaScript, such as Jest or Vitest.

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using randomly generated game states and moves.

**Framework:** We'll use fast-check for JavaScript property-based testing.

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will generate random board states, player configurations, and move sequences
- Each property test will include a comment tag referencing the design document property

**Test Tagging Format:**
```javascript
// Feature: tic-tac-toe, Property 1: Valid move placement
```

**Generator Strategy:**
- Board generator: Creates valid board states with varying fill levels
- Position generator: Produces positions 0-8
- Player generator: Produces 'X' or 'O'
- Game state generator: Creates realistic game states (valid move sequences)

The combination of unit tests and property-based tests ensures both concrete examples work correctly and universal properties hold across all possible inputs.

## Implementation Notes

### Performance Considerations
- Win checking is O(1) - only 8 possible winning lines to check
- Board operations are immutable for easier testing and debugging
- UI updates are batched to avoid unnecessary reflows

### Browser Compatibility
- Target modern browsers (ES6+ support)
- No external dependencies for core game logic
- CSS Grid for board layout

### Extensibility
- Game logic is decoupled from UI for potential AI opponent addition
- State management pattern allows for undo/redo features
- Modular structure supports future enhancements (score tracking, animations)
