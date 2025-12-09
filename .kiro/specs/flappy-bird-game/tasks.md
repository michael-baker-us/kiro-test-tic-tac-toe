# Flappy Bird Game Implementation Plan

- [x] 1. Set up project structure and core configuration
  - Create directory structure at `src/games/flappy-bird/`
  - Define game configuration constants (gravity, flap velocity, pipe dimensions, etc.)
  - Set up module exports following existing game patterns
  - _Requirements: 8.3, 8.4_

- [x] 2. Implement state manager with game state management
  - [x] 2.1 Create state manager module with initial state
    - Implement createStateManager factory function
    - Define initial game state structure (bird, pipes, score, gameStatus)
    - Implement getState() method for state access
    - Implement subscribe/unsubscribe for observer pattern
    - _Requirements: 5.1, 4.2_
  
  - [x] 2.2 Implement state mutation methods
    - Add flap() method to apply upward velocity to bird
    - Add update(deltaTime) method to coordinate state updates
    - Add startGame(), endGame(), resetGame() methods for state transitions
    - Add incrementScore() method for scoring
    - _Requirements: 1.1, 5.2, 5.3, 5.4, 5.5, 4.1_
  
  - [x] 2.3 Write property test for state transitions
    - **Property 14: Menu to playing transition**
    - **Validates: Requirements 5.2**
  
  - [x] 2.4 Write property test for game reset
    - **Property 15: Game over restart resets state**
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 3. Implement core game logic with physics and collision detection
  - [x] 3.1 Create game logic module with bird physics
    - Implement updateBirdPhysics() to apply gravity and velocity
    - Handle velocity integration and position updates
    - Enforce top boundary constraint
    - Calculate bird rotation based on velocity
    - _Requirements: 1.2, 1.3, 1.5, 7.1, 7.2_
  
  - [x] 3.2 Write property tests for bird physics
    - **Property 1: Flap applies upward velocity**
    - **Validates: Requirements 1.1**
  
  - [x] 3.3 Write property test for physics integration
    - **Property 2: Physics integration updates position and velocity**
    - **Validates: Requirements 1.2, 1.5**
  
  - [x] 3.4 Write property test for top boundary
    - **Property 3: Top boundary constraint**
    - **Validates: Requirements 1.3**
  
  - [x] 3.5 Write property test for rotation animation
    - **Property 17: Rotation follows velocity**
    - **Validates: Requirements 7.1, 7.2**
  
  - [x] 3.6 Implement collision detection
    - Create checkCollision() function for bird-pipe intersection
    - Implement bounding box collision algorithm
    - Check collision with pipes (outside gap)
    - Check collision with bottom boundary
    - Verify no collision when bird is in gap
    - _Requirements: 3.1, 3.2, 3.4, 1.4_
  
  - [x] 3.7 Write property tests for collision detection
    - **Property 9: Collision detection accuracy**
    - **Validates: Requirements 3.1, 3.4**
  
  - [x] 3.8 Write property test for gap collision
    - **Property 10: No collision in gap**
    - **Validates: Requirements 3.1, 3.4**
  
  - [x] 3.9 Write property test for bottom boundary collision
    - **Property 4: Bottom boundary triggers game over**
    - **Validates: Requirements 1.4, 3.2**

- [x] 4. Implement pipe generation and management
  - [x] 4.1 Create pipe management functions
    - Implement generatePipe() to create pipes with random gap positions
    - Ensure gap height matches configuration
    - Validate gap is within playable boundaries
    - Implement updatePipes() to move pipes horizontally
    - Remove off-screen pipes from array
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.2 Write property test for pipe movement
    - **Property 5: Pipes move at constant speed**
    - **Validates: Requirements 2.2**
  
  - [x] 4.3 Write property test for pipe cleanup
    - **Property 6: Off-screen pipes are removed**
    - **Validates: Requirements 2.3**
  
  - [x] 4.4 Write property test for gap height
    - **Property 7: Generated pipes have correct gap height**
    - **Validates: Requirements 2.4**
  
  - [x] 4.5 Write property test for gap positioning
    - **Property 8: Generated pipes have valid gap positions**
    - **Validates: Requirements 2.5**
  
  - [x] 4.6 Implement scoring logic
    - Create checkScoring() function to detect when bird passes pipe
    - Mark pipes as passed to prevent duplicate scoring
    - Ensure each pipe is scored exactly once
    - _Requirements: 4.1, 4.5_
  
  - [x] 4.7 Write property test for score increment
    - **Property 12: Score increments when passing pipes**
    - **Validates: Requirements 4.1**
  
  - [x] 4.8 Write property test for single scoring
    - **Property 13: Pipes are scored only once**
    - **Validates: Requirements 4.5**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement UI controller with canvas rendering
  - [x] 6.1 Create UI controller module with canvas setup
    - Implement createUIController factory function
    - Create and configure HTML5 canvas element
    - Set up responsive canvas sizing for mobile
    - Get 2D rendering context
    - Subscribe to state changes for rendering
    - _Requirements: 6.3, 8.1_
  
  - [x] 6.2 Implement rendering functions
    - Create render() method to draw current game state
    - Draw bird with rotation based on velocity
    - Draw pipes with gaps
    - Display score during gameplay
    - Render start menu with instructions
    - Render game over screen with final score
    - _Requirements: 4.3, 4.4, 5.1, 7.1, 7.2_
  
  - [x] 6.3 Implement cleanup and resource management
    - Add destroy() method to remove canvas and listeners
    - Clear canvas on state changes
    - Handle window resize events for responsive sizing
    - _Requirements: 8.2_

- [x] 7. Implement input handler for user controls
  - [x] 7.1 Create input handler module
    - Implement createInputHandler factory function
    - Accept callbacks for flap, start, and restart actions
    - Set up mouse click event listeners
    - Set up keyboard event listeners (spacebar)
    - _Requirements: 1.1, 5.2, 5.3_
  
  - [x] 7.2 Add mobile touch support
    - Implement enableTouchControls() method
    - Listen for touchstart events on canvas
    - Call preventDefault() to prevent scrolling
    - Ensure touch events trigger same actions as clicks
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 7.3 Write property test for input equivalence
    - **Property 16: Touch and click equivalence**
    - **Validates: Requirements 6.1, 6.5**
  
  - [x] 7.4 Implement cleanup
    - Add destroy() method to remove all event listeners
    - Ensure no memory leaks from event handlers
    - _Requirements: 8.5_

- [x] 8. Implement game loop with timing control
  - [x] 8.1 Create game loop module
    - Implement createGameLoop factory function
    - Set up requestAnimationFrame loop
    - Calculate delta time between frames
    - Call state manager update with delta time
    - Trigger UI controller render after updates
    - _Requirements: 1.5, 2.2, 7.3_
  
  - [x] 8.2 Add loop control methods
    - Implement start() to begin animation loop
    - Implement stop() to cancel animation frame
    - Implement pause() and resume() for game pausing
    - Track loop state to prevent duplicate starts
    - _Requirements: 3.5, 8.2_
  
  - [x] 8.3 Write property test for game over state
    - **Property 11: Game over state prevents updates**
    - **Validates: Requirements 3.5**

- [x] 9. Create game wrapper implementing Game interface
  - [x] 9.1 Implement main game module
    - Create createFlappyBirdGame factory function
    - Implement init(containerElement) method
    - Initialize all sub-modules in correct order
    - Wire up callbacks between modules
    - Start game loop after initialization
    - _Requirements: 8.1, 8.4_
  
  - [x] 9.2 Implement lifecycle methods
    - Add destroy() method to clean up all modules
    - Add optional pause() method for tab switching
    - Add optional resume() method for tab switching
    - Ensure proper cleanup of all resources
    - _Requirements: 8.2, 8.5_
  
  - [x] 9.3 Write unit tests for game wrapper
    - Test init() creates game elements
    - Test destroy() cleans up resources
    - Test pause() stops game loop
    - Test exported interface has required methods
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 10. Integrate with main application
  - [x] 10.1 Update main application to include Flappy Bird
    - Add Flappy Bird to game selection menu in index.html
    - Import createFlappyBirdGame in script.js
    - Add game switching logic for Flappy Bird
    - Ensure proper cleanup when switching games
    - _Requirements: 8.1, 8.2_
  
  - [x] 10.2 Write integration tests
    - Test game initialization from main app
    - Test switching between games
    - Test cleanup when leaving Flappy Bird
    - Test mobile touch controls work in integrated environment
    - _Requirements: 8.1, 8.2, 8.5_

- [x] 11. Add visual polish and styling
  - [x] 11.1 Create game styling
    - Add CSS for canvas container
    - Style start menu and game over screens
    - Ensure responsive layout on mobile
    - Add touch-action CSS to prevent zoom
    - _Requirements: 6.3, 6.2_
  
  - [x] 11.2 Implement visual assets
    - Draw bird sprite with color and shape
    - Draw pipes with consistent styling
    - Add background color or gradient
    - Display score with readable font
    - _Requirements: 4.3, 4.4, 7.1, 7.2_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
