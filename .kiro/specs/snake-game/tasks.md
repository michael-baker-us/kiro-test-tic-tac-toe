# Snake Game Implementation Plan

- [x] 1. Implement core game logic module
  - Create pure functions for snake movement, collision detection, and food spawning
  - Implement direction validation and opposite direction checking
  - Create board initialization and position utilities
  - _Requirements: 1.5, 2.2, 2.3, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 1.1 Write property test for directional input
  - **Property 1: Directional input changes direction**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 1.2 Write property test for opposite direction rejection
  - **Property 2: Opposite direction rejection**
  - **Validates: Requirements 1.5**

- [x] 1.3 Write property test for snake head advancement
  - **Property 4: Snake head advances correctly**
  - **Validates: Requirements 2.2**

- [x] 1.4 Write property test for snake length preservation
  - **Property 5: Snake length preservation without food**
  - **Validates: Requirements 2.3**

- [x] 1.5 Write property test for food spawning
  - **Property 8: Food respawns after consumption**
  - **Validates: Requirements 3.2, 3.3**

- [x] 1.6 Write property test for self-collision detection
  - **Property 10: Self-collision ends game**
  - **Validates: Requirements 4.5**

- [x] 1.7 Write unit tests for boundary collision edge cases
  - Test collision at top, bottom, left, and right boundaries
  - Test corner collision scenarios
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Implement state manager with observable pattern
  - Create state manager factory function with game state structure
  - Implement subscribe/unsubscribe mechanism for state changes
  - Add methods for direction updates, tick processing, and game status changes
  - Implement pause/resume functionality
  - Add speed progression logic based on score thresholds
  - _Requirements: 2.5, 3.1, 3.2, 3.5, 5.1, 5.5, 9.2, 9.4, 10.1, 10.3, 10.4_

- [x] 2.1 Write property test for pause stops movement
  - **Property 6: Pause stops movement**
  - **Validates: Requirements 2.5, 10.1**

- [x] 2.2 Write property test for food consumption increases length
  - **Property 7: Food consumption increases length**
  - **Validates: Requirements 3.1, 3.4**

- [x] 2.3 Write property test for food consumption increases score
  - **Property 9: Food consumption increases score**
  - **Validates: Requirements 3.5, 5.2**

- [x] 2.4 Write property test for game over stops movement
  - **Property 11: Game over stops movement**
  - **Validates: Requirements 4.6**

- [x] 2.5 Write property test for reset returns to initial state
  - **Property 12: Reset returns to initial state**
  - **Validates: Requirements 5.5, 6.2, 6.3, 6.5, 9.5**

- [x] 2.6 Write property test for food spawns on reset
  - **Property 13: Food spawns on reset**
  - **Validates: Requirements 6.4**

- [x] 2.7 Write property test for speed increases at thresholds
  - **Property 14: Speed increases at thresholds**
  - **Validates: Requirements 9.2**

- [x] 2.8 Write property test for speed never exceeds maximum
  - **Property 15: Speed never exceeds maximum**
  - **Validates: Requirements 9.4**

- [x] 2.9 Write property test for resume preserves state
  - **Property 16: Resume preserves state**
  - **Validates: Requirements 10.3, 10.5**

- [x] 2.10 Write property test for pause ignores direction input
  - **Property 17: Pause ignores direction input**
  - **Validates: Requirements 10.4**

- [x] 2.11 Write unit tests for state manager
  - Test initial state creation
  - Test state subscription and notification
  - Test edge cases for score and speed boundaries
  - _Requirements: 5.1, 9.1_

- [x] 3. Implement input handler for keyboard and touch controls
  - Create input handler factory function
  - Implement keyboard event listeners for arrow keys and space bar
  - Add touch event listeners for swipe gesture detection
  - Implement swipe direction calculation based on touch deltas
  - Add minimum swipe threshold to prevent accidental inputs
  - Implement event cleanup for proper resource management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 6.2, 7.2, 7.5, 10.1, 10.3_

- [x] 3.1 Write property test for swipe direction calculation
  - **Property 3: Swipe direction calculation**
  - **Validates: Requirements 1.6**

- [x] 3.2 Write unit tests for input handler
  - Test keyboard event handling
  - Test touch event handling with various swipe patterns
  - Test minimum swipe threshold
  - Test event cleanup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [x] 4. Implement UI controller with canvas rendering
  - Create UI controller factory function
  - Set up HTML5 Canvas and get 2D rendering context
  - Implement game board rendering with grid cells
  - Add snake rendering with distinct head and body styling
  - Implement food rendering with visual distinction
  - Create score display update logic
  - Add game over overlay with final score display
  - Implement pause overlay rendering
  - Add mobile instructions for touch controls
  - Subscribe to state changes and trigger re-renders
  - _Requirements: 5.3, 5.4, 6.1, 8.1, 8.2, 8.3, 8.4, 8.5, 10.2_

- [x] 4.1 Write unit tests for UI controller
  - Test canvas initialization
  - Test rendering with various game states
  - Test game over overlay display
  - Test pause overlay display
  - Test score display updates
  - _Requirements: 5.3, 5.4, 6.1, 10.2_

- [x] 5. Implement game loop with fixed time step
  - Create game loop using requestAnimationFrame
  - Implement fixed time step for consistent game speed
  - Add loop start/stop logic based on game status
  - Integrate with state manager tick method
  - Handle speed changes dynamically
  - _Requirements: 2.1, 2.4_

- [x] 5.1 Write unit tests for game loop
  - Test loop initialization and cleanup
  - Test pause/resume behavior
  - Test speed adjustment
  - _Requirements: 2.1, 2.4_

- [x] 6. Create game wrapper with platform interface
  - Implement createSnakeGame factory function
  - Create init method that sets up HTML structure
  - Wire together all modules (gameLogic, stateManager, uiController, inputHandler)
  - Implement destroy method for cleanup
  - Add responsive board sizing based on viewport
  - Detect mobile devices and show appropriate controls
  - _Requirements: 6.3, 6.4, 7.1, 7.3, 7.4, 11.1, 11.3, 11.5_

- [x] 6.1 Write integration tests for game wrapper
  - Test init and destroy lifecycle
  - Test module integration
  - Test responsive board sizing
  - Test mobile detection
  - _Requirements: 7.1, 7.4, 11.3_

- [x] 7. Integrate Snake game with multi-game platform
  - Register Snake game in gameRegistry with metadata
  - Add route handler for /snake path in router
  - Create game tile thumbnail image (optional)
  - Test navigation from landing page to Snake game
  - Test back button navigation from Snake game to landing page
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 7.1 Write integration tests for platform integration
  - Test game registration
  - Test navigation to Snake game
  - Test back button functionality
  - _Requirements: 11.1, 11.2, 11.4_

- [x] 8. Add CSS styling for Snake game
  - Create Snake game specific styles
  - Implement responsive grid layout
  - Style game canvas with borders and background
  - Style control buttons with touch-friendly sizes
  - Add game over overlay styling
  - Add pause overlay styling
  - Style score display
  - Add mobile-specific styles and media queries
  - Ensure consistent theming with existing platform styles
  - _Requirements: 7.1, 7.3, 7.4, 8.1, 8.2, 8.3, 8.5_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Test on mobile devices and optimize
  - Test touch controls on iOS Safari
  - Test touch controls on Chrome Mobile
  - Verify responsive layout on various screen sizes
  - Test performance and optimize if needed
  - Verify no scroll interference during gameplay
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
