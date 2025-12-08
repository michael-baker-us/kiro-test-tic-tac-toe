# Implementation Plan

- [x] 1. Set up project structure and testing framework
  - Create directory structure for source and test files
  - Install and configure fast-check for property-based testing
  - Install and configure Jest or Vitest for unit testing
  - Set up test runner scripts in package.json
  - _Requirements: All (foundation for implementation)_

- [x] 2. Implement core game logic module
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1_

- [x] 2.1 Create board representation and basic operations
  - Implement `createEmptyBoard()` function
  - Implement `isValidMove(board, position)` function
  - Implement `makeMove(board, position, player)` function with immutability
  - Implement `getAvailableMoves(board)` function
  - _Requirements: 1.1, 1.2_

- [x]* 2.2 Write property test for valid move placement
  - **Property 1: Valid move placement**
  - **Validates: Requirements 1.1**
  - Generate random boards and empty positions
  - Verify mark is placed correctly

- [x]* 2.3 Write property test for invalid move rejection
  - **Property 2: Invalid move rejection**
  - **Validates: Requirements 1.2**
  - Generate random boards and occupied positions
  - Verify board remains unchanged

- [x] 2.4 Implement win detection logic
  - Implement `checkWinner(board)` function
  - Check all 8 possible winning lines (3 rows, 3 columns, 2 diagonals)
  - Return winning player or null
  - _Requirements: 2.1, 2.2, 2.3_

- [x]* 2.5 Write property test for win detection
  - **Property 4: Win detection completeness**
  - **Validates: Requirements 2.1, 2.2, 2.3**
  - Generate boards with winning configurations
  - Verify correct winner identification

- [x]* 2.6 Write unit tests for specific win patterns
  - Test horizontal wins (all 3 rows)
  - Test vertical wins (all 3 columns)
  - Test diagonal wins (both diagonals)
  - Test no winner scenarios
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.7 Implement draw detection
  - Implement `isDraw(board)` function
  - Check if board is full and no winner exists
  - _Requirements: 3.1_

- [x]* 2.8 Write property test for draw detection
  - **Property 6: Draw detection**
  - **Validates: Requirements 3.1**
  - Generate full boards without wins
  - Verify draw is correctly identified

- [x] 3. Implement state management module
  - _Requirements: 1.3, 2.4, 3.3, 4.1, 4.2, 4.4_

- [x] 3.1 Create state manager with initial state
  - Define state structure (board, currentPlayer, gameStatus, winner)
  - Implement `getState()` method
  - Implement state initialization
  - _Requirements: 4.2_

- [x] 3.2 Implement move handling with player switching
  - Implement `makeMove(position)` method
  - Integrate with game logic validation
  - Switch current player after valid move
  - Update game status when win/draw detected
  - _Requirements: 1.1, 1.2, 1.3, 2.4, 3.3_

- [x]* 3.3 Write property test for player alternation
  - **Property 3: Player alternation**
  - **Validates: Requirements 1.3**
  - Generate random valid moves
  - Verify player switches correctly

- [x]* 3.4 Write property test for post-win move prevention
  - **Property 5: Post-win move prevention**
  - **Validates: Requirements 2.4**
  - Generate winning board states
  - Verify additional moves are rejected

- [x]* 3.5 Write property test for post-draw move prevention
  - **Property 7: Post-draw move prevention**
  - **Validates: Requirements 3.3**
  - Generate draw board states
  - Verify additional moves are rejected

- [x] 3.6 Implement game reset functionality
  - Implement `resetGame()` method
  - Clear board to empty state
  - Reset current player to X
  - Reset game status to playing
  - _Requirements: 4.1, 4.2, 4.4_

- [x]* 3.7 Write property test for game reset
  - **Property 8: Game reset to empty board**
  - **Property 9: Game reset to player X**
  - **Property 10: Post-reset move acceptance**
  - **Validates: Requirements 4.1, 4.2, 4.4**
  - Generate various finished game states
  - Verify reset produces correct initial state
  - Verify moves work after reset

- [x] 3.8 Implement state change subscription mechanism
  - Implement `subscribe(callback)` method
  - Notify subscribers when state changes
  - _Requirements: 1.4, 5.2, 6.4_

- [x] 4. Implement UI controller module
  - _Requirements: 5.1, 5.3, 6.1, 6.2, 6.3, 6.4_

- [x] 4.1 Create HTML structure
  - Build 3x3 grid layout using CSS Grid
  - Add status display area for messages
  - Add new game button
  - Add turn indicator display
  - _Requirements: 6.1_

- [x] 4.2 Implement CSS styling
  - Style game board with clear cell boundaries
  - Style X and O marks with distinct appearance
  - Add hover effects for available cells
  - Style status messages and button
  - Create responsive layout
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 4.3 Implement board rendering
  - Implement `render(state)` method
  - Update cell contents based on board state
  - Update status message based on game status
  - Update turn indicator
  - _Requirements: 5.1, 5.3, 6.4_

- [x] 4.4 Implement event handlers
  - Attach click handlers to cells
  - Integrate with state manager's makeMove
  - Attach click handler to new game button
  - Integrate with state manager's resetGame
  - _Requirements: 1.1, 4.1_

- [x] 4.5 Implement hover effects
  - Add CSS classes for hover states
  - Show preview of current player's mark on hover
  - Only show hover effect for available cells
  - _Requirements: 6.3_

- [x] 4.6 Wire up state subscription
  - Subscribe UI controller to state changes
  - Trigger re-render on state updates
  - _Requirements: 1.4, 6.4_

- [x]* 4.7 Write unit tests for UI rendering
  - Test rendering of empty board
  - Test rendering of board with moves
  - Test status message display for different game states
  - Test turn indicator updates
  - _Requirements: 5.1, 6.1, 6.4_

- [x] 5. Integration and final polish
  - _Requirements: All_

- [x] 5.1 Create main application entry point
  - Initialize state manager
  - Initialize UI controller
  - Connect components together
  - Start the game
  - _Requirements: All_

- [x] 5.2 Add win highlighting
  - Highlight winning cells with visual effect
  - Update render method to show winning line
  - _Requirements: 2.5_

- [x]* 5.3 Write integration tests
  - Test complete game flow from start to win
  - Test complete game flow from start to draw
  - Test reset after win
  - Test reset after draw
  - _Requirements: All_

- [x] 5.4 Final checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Fix any failing tests
  - Ensure all tests pass, ask the user if questions arise
