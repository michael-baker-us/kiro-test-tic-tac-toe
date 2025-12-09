# Tetris Game Implementation Plan

- [x] 1. Set up Tetris game structure and piece definitions
  - Create directory structure at `src/games/tetris/`
  - Implement piece definitions with shapes, colors, and wall kick data
  - Define all 7 Tetromino types (I, O, T, S, Z, J, L) with 4 rotation states each
  - Include SRS wall kick offset data for standard pieces and I-piece
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 8.3, 8.4, 8.5_

- [x] 1.1 Write property test for piece color mapping
  - **Property 19: Piece color mapping**
  - **Validates: Requirements 11.1-11.7**

- [x] 2. Implement core game logic module
  - Create `gameLogic.js` with collision detection
  - Implement rotation logic with wall kick support
  - Add line clearing detection and execution
  - Implement scoring calculations
  - Add ghost piece position calculation
  - Add game over detection
  - _Requirements: 1.7, 8.1, 8.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.1, 2.4_

- [x] 2.1 Write property test for valid movement
  - **Property 1: Valid movement preserves single-step displacement**
  - **Validates: Requirements 1.1, 1.2, 1.7**

- [x] 2.2 Write property test for rotation correctness
  - **Property 2: Rotation changes orientation correctly**
  - **Validates: Requirements 1.3, 1.4, 1.7**

- [x] 2.3 Write property test for hard drop destination
  - **Property 3: Hard drop reaches ghost position**
  - **Validates: Requirements 1.6, 6.1**

- [x] 2.4 Write property test for line clearing
  - **Property 7: Complete rows are cleared**
  - **Validates: Requirements 3.1**

- [x] 2.5 Write property test for gravity after line clear
  - **Property 8: Gravity applies after line clear**
  - **Validates: Requirements 3.2**

- [x] 2.6 Write property test for line clear scoring
  - **Property 9: Line clear scoring formula**
  - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**

- [x] 2.7 Write property test for hard drop scoring
  - **Property 10: Hard drop scoring**
  - **Validates: Requirements 3.7**

- [x] 2.8 Write property test for wall kick attempts
  - **Property 15: Wall kicks attempt correct offsets**
  - **Validates: Requirements 8.1, 8.3, 8.4**

- [x] 2.9 Write property test for failed rotation preservation
  - **Property 16: Failed rotations preserve state**
  - **Validates: Requirements 8.2**

- [x] 2.10 Write property test for O-piece rotation
  - **Property 17: O-piece rotation is no-op**
  - **Validates: Requirements 8.5**

- [x] 2.11 Write unit tests for game logic edge cases
  - Test collision with board boundaries
  - Test collision with locked pieces
  - Test ghost piece on empty board
  - Test ghost piece with full column
  - Test game over when spawn blocked
  - _Requirements: 1.7, 6.1, 2.4_

- [x] 3. Implement state manager
  - Create `stateManager.js` with initial state
  - Implement state access methods (getState)
  - Add game control methods (start, pause, resume, reset)
  - Implement piece manipulation methods (move, rotate, hard drop)
  - Add game progression methods (lock piece, spawn piece, clear lines, update score/level)
  - Implement observer pattern for state changes
  - _Requirements: 2.1, 7.1, 7.2, 7.3, 10.3, 10.4, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 4.3, 4.4, 5.3_

- [x] 3.1 Write property test for piece spawn position
  - **Property 4: Piece spawns at correct position**
  - **Validates: Requirements 2.1**

- [x] 3.2 Write property test for blocked spawn game over
  - **Property 6: Blocked spawn triggers game over**
  - **Validates: Requirements 2.4**

- [x] 3.3 Write property test for level progression
  - **Property 11: Level progression**
  - **Validates: Requirements 4.2**

- [x] 3.4 Write property test for drop speed formula
  - **Property 12: Drop speed formula**
  - **Validates: Requirements 4.3, 4.4**

- [x] 3.5 Write property test for next piece sequence
  - **Property 13: Next piece advances in sequence**
  - **Validates: Requirements 5.3**

- [x] 3.6 Write property test for pause state preservation
  - **Property 14: Pause prevents state changes**
  - **Validates: Requirements 7.2**

- [x] 3.7 Write property test for game reset
  - **Property 18: Game reset returns to initial state**
  - **Validates: Requirements 10.3, 10.4**

- [x] 3.8 Write unit tests for state manager
  - Test initial state values
  - Test state transitions (playing → paused → playing)
  - Test state transitions (playing → game over)
  - Test observer subscription and notification
  - _Requirements: 4.1, 7.1, 7.3, 2.4_

- [x] 4. Implement game loop
  - Create `gameLoop.js` with start/stop/pause/resume methods
  - Implement automatic piece dropping based on drop speed
  - Add lock delay timing
  - Integrate with state manager for game progression
  - _Requirements: 2.2, 2.3, 2.5, 4.3_

- [x] 4.1 Write property test for automatic drop
  - **Property 5: Automatic drop moves down one row**
  - **Validates: Requirements 2.2, 2.5**

- [x] 4.2 Write unit tests for game loop
  - Test start/stop functionality
  - Test pause/resume functionality
  - Test drop speed changes
  - Test lock delay timing
  - _Requirements: 2.2, 2.3, 7.2_

- [x] 5. Implement UI controller
  - Create `uiController.js` with canvas rendering
  - Render game board with locked pieces
  - Render current piece and ghost piece
  - Render next piece preview
  - Display score, level, and lines cleared
  - Render pause screen
  - Render game over screen
  - Subscribe to state changes for automatic re-rendering
  - _Requirements: 6.1, 6.2, 6.3, 5.2, 9.1, 9.2, 9.3, 9.4, 7.4, 10.1, 10.2_

- [x] 5.1 Write unit tests for UI controller
  - Test canvas initialization
  - Test board rendering with various states
  - Test piece rendering
  - Test ghost piece rendering
  - Test next piece preview rendering
  - Test stats display updates
  - Test pause screen rendering
  - Test game over screen rendering
  - _Requirements: 6.1, 5.2, 9.1, 9.2, 9.3, 7.4, 10.1_

- [x] 6. Implement input handler
  - Create `inputHandler.js` with keyboard event listeners
  - Map arrow keys to movement (left, right, down)
  - Map rotation keys (up arrow, X, Z)
  - Map hard drop (space bar)
  - Map pause keys (P, Escape)
  - Implement key repeat for smooth movement
  - Add rotation debouncing
  - Provide cleanup method for event listeners
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.1, 7.3_

- [x] 6.1 Write unit tests for input handler
  - Test key mapping correctness
  - Test event listener registration
  - Test event listener cleanup
  - Test callback invocation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.1_

- [x] 7. Implement game wrapper and integration
  - Create `index.js` implementing the Game interface
  - Coordinate all modules (state, logic, UI, input, loop)
  - Implement init method to set up the game
  - Implement destroy method for cleanup
  - Wire up all event handlers and callbacks
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 7.1 Write integration tests for game wrapper
  - Test game initialization
  - Test game cleanup on destroy
  - Test full game flow (start → play → game over → restart)
  - _Requirements: 12.2, 12.3, 12.4_

- [x] 8. Integrate Tetris into main application
  - Add Tetris tab to navigation in `index.html`
  - Create Tetris container element
  - Update `script.js` to import and initialize Tetris game
  - Add tab switching logic for Tetris
  - Ensure proper game pause/resume on tab switch
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 8.1 Write integration tests for tab switching
  - Test Tetris tab appears in navigation
  - Test Tetris initializes when selected
  - Test game pauses when switching away
  - Test game resumes when switching back
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 9. Add Tetris-specific styling
  - Add CSS for Tetris game container
  - Style canvas elements
  - Style next piece preview
  - Style stats display (score, level, lines)
  - Style pause and game over screens
  - Ensure consistent styling with existing games
  - _Requirements: 12.5_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
