# Flappy Bird Game Design Document

## Overview

The Flappy Bird game is a side-scrolling arcade game where players control a bird navigating through gaps in pipes. The game features simple one-button controls (tap/click to flap), physics-based movement with gravity, procedurally generated obstacles, collision detection, and score tracking. The implementation follows the existing game architecture pattern used in Snake, Tetris, and Tic-Tac-Toe games, with modular components for state management, UI rendering, input handling, and game loop.

The game will be built using vanilla JavaScript with HTML5 Canvas for rendering, ensuring compatibility with both desktop browsers and mobile touchscreen devices. It will integrate seamlessly into the existing multi-game web application deployed on GitHub Pages.

## Architecture

The Flappy Bird game follows a modular architecture consistent with existing games in the application:

### Module Structure

```
src/games/flappy-bird/
├── index.js              # Game wrapper implementing the Game interface
├── stateManager.js       # Game state management and business logic
├── gameLogic.js          # Core game mechanics (physics, collision, scoring)
├── uiController.js       # Canvas rendering and visual presentation
├── inputHandler.js       # Input event handling (mouse, touch, keyboard)
└── gameLoop.js           # Animation frame loop and timing
```

### Component Responsibilities

1. **index.js (Game Wrapper)**
   - Implements the standard Game interface (init, destroy, pause, resume)
   - Orchestrates module initialization and cleanup
   - Manages component lifecycle and dependencies
   - Provides integration point with the main application

2. **stateManager.js**
   - Maintains game state (bird position, pipes, score, game status)
   - Provides state access and mutation methods
   - Implements observer pattern for state change notifications
   - Handles game state transitions (menu → playing → game over)

3. **gameLogic.js**
   - Implements bird physics (gravity, velocity, flap mechanics)
   - Manages pipe generation and movement
   - Performs collision detection between bird and obstacles
   - Calculates score increments when passing pipes
   - Enforces game rules and boundaries

4. **uiController.js**
   - Renders game elements on HTML5 Canvas
   - Draws bird with rotation based on velocity
   - Renders pipes with gaps
   - Displays score, game over screen, and start menu
   - Handles responsive canvas sizing for mobile devices

5. **inputHandler.js**
   - Listens for mouse clicks, touch events, and keyboard input
   - Prevents default touch behaviors (scrolling, zooming)
   - Translates input events to game actions (flap, start, restart)
   - Manages input state and event cleanup

6. **gameLoop.js**
   - Manages requestAnimationFrame loop
   - Calculates delta time for consistent physics
   - Coordinates update and render cycles
   - Provides start, stop, pause, and resume controls

### Data Flow

```
User Input → InputHandler → StateManager → GameLogic
                                ↓
                          UIController ← GameLoop
```

1. User provides input (tap/click)
2. InputHandler captures event and notifies StateManager
3. StateManager updates state and triggers GameLogic
4. GameLogic applies physics, checks collisions, updates positions
5. GameLoop triggers render cycle
6. UIController reads state and renders to canvas

## Components and Interfaces

### Game Interface (index.js)

```javascript
export default function createFlappyBirdGame() {
  return {
    init(containerElement),    // Initialize game in container
    destroy(),                  // Clean up resources
    pause(),                    // Pause game (optional)
    resume()                    // Resume game (optional)
  };
}
```

### StateManager Interface

```javascript
export function createStateManager(config) {
  return {
    getState(),                 // Returns current game state
    subscribe(listener),        // Subscribe to state changes
    flap(),                     // Apply upward velocity to bird
    update(deltaTime),          // Update game state based on time
    startGame(),                // Transition to playing state
    endGame(),                  // Transition to game over state
    resetGame(),                // Reset to initial state
    incrementScore()            // Increase score by one
  };
}
```

### GameLogic Interface

```javascript
export const GameLogic = {
  updateBirdPhysics(bird, deltaTime, config),  // Apply gravity and velocity
  checkCollision(bird, pipes, canvasHeight),   // Detect collisions
  updatePipes(pipes, deltaTime, config),       // Move and manage pipes
  generatePipe(canvasWidth, canvasHeight, config), // Create new pipe
  checkScoring(bird, pipes)                    // Check if bird passed pipe
};
```

### UIController Interface

```javascript
export function createUIController(stateManager, container) {
  return {
    init(),                     // Set up canvas and rendering
    render(),                   // Draw current game state
    destroy()                   // Clean up canvas and listeners
  };
}
```

### InputHandler Interface

```javascript
export function createInputHandler(onFlap, onStart, onRestart) {
  return {
    init(container),            // Set up event listeners
    destroy(),                  // Remove event listeners
    enableTouchControls(),      // Enable mobile touch handling
    disableTouchControls()      // Disable mobile touch handling
  };
}
```

### GameLoop Interface

```javascript
export function createGameLoop(stateManager) {
  return {
    start(),                    // Begin animation loop
    stop(),                     // Stop animation loop
    pause(),                    // Pause without stopping
    resume()                    // Resume from pause
  };
}
```

## Data Models

### Game State

```javascript
{
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver',
  bird: {
    x: number,              // Horizontal position (fixed)
    y: number,              // Vertical position
    velocity: number,       // Vertical velocity
    width: number,          // Collision box width
    height: number,         // Collision box height
    rotation: number        // Visual rotation angle
  },
  pipes: [
    {
      x: number,            // Horizontal position
      gapY: number,         // Vertical position of gap center
      gapHeight: number,    // Height of the gap
      width: number,        // Pipe width
      passed: boolean       // Whether bird has passed this pipe
    }
  ],
  score: number,            // Current score
  highScore: number         // Best score (persisted)
}
```

### Configuration

```javascript
{
  gravity: 1200,            // Downward acceleration (pixels/s²)
  flapVelocity: -400,       // Upward velocity on flap (pixels/s)
  birdX: 80,                // Fixed horizontal position of bird
  birdSize: 34,             // Bird dimensions (square)
  pipeWidth: 52,            // Width of pipes
  pipeGap: 150,             // Height of gap between pipes
  pipeSpeed: 200,           // Horizontal pipe movement speed (pixels/s)
  pipeSpawnInterval: 1500,  // Time between pipe spawns (ms)
  maxRotation: 90,          // Maximum bird rotation (degrees)
  rotationSpeed: 3          // Rotation change rate
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework analysis, the following redundancies were identified:

- **Properties 1.4 and 3.2** both test bottom boundary collision triggering game over - these can be combined
- **Properties 6.1 and 6.5** both test touch/click input equivalence - these can be combined
- **Properties 1.2 and 1.5** both relate to physics updates - 1.5 is more comprehensive and subsumes 1.2

The consolidated property set eliminates these redundancies while maintaining complete coverage.

### Core Physics Properties

**Property 1: Flap applies upward velocity**
*For any* bird state, when a flap action is applied, the bird's velocity should be set to the configured flap velocity (negative value indicating upward movement)
**Validates: Requirements 1.1**

**Property 2: Physics integration updates position and velocity**
*For any* bird state and time delta, updating physics should change the bird's position by velocity * deltaTime and increase velocity by gravity * deltaTime
**Validates: Requirements 1.2, 1.5**

**Property 3: Top boundary constraint**
*For any* bird state after physics update, the bird's y position should never be less than zero
**Validates: Requirements 1.3**

**Property 4: Bottom boundary triggers game over**
*For any* bird state where y position is greater than or equal to canvas height, collision detection should return true
**Validates: Requirements 1.4, 3.2**

### Pipe Management Properties

**Property 5: Pipes move at constant speed**
*For any* set of pipes and time delta, after updating pipes, each pipe's x position should decrease by pipeSpeed * deltaTime
**Validates: Requirements 2.2**

**Property 6: Off-screen pipes are removed**
*For any* set of pipes after update, no pipe should have an x position where x + pipeWidth < 0
**Validates: Requirements 2.3**

**Property 7: Generated pipes have correct gap height**
*For any* newly generated pipe, the gap height should equal the configured gap height
**Validates: Requirements 2.4**

**Property 8: Generated pipes have valid gap positions**
*For any* newly generated pipe, the gap center position (gapY) should be positioned such that gapY - gapHeight/2 >= 0 and gapY + gapHeight/2 <= canvasHeight
**Validates: Requirements 2.5**

### Collision Detection Properties

**Property 9: Collision detection accuracy**
*For any* bird and pipe positions where the bird's bounding box overlaps with a pipe's bounding box (outside the gap), collision detection should return true
**Validates: Requirements 3.1, 3.4**

**Property 10: No collision in gap**
*For any* bird and pipe positions where the bird is horizontally aligned with the pipe but vertically within the gap boundaries, collision detection should return false
**Validates: Requirements 3.1, 3.4**

**Property 11: Game over state prevents updates**
*For any* game state where gameStatus is 'gameOver', calling update should not modify bird position or pipe positions
**Validates: Requirements 3.5**

### Scoring Properties

**Property 12: Score increments when passing pipes**
*For any* bird and pipe where the bird's x position crosses the pipe's center x position without collision, the score should increment by exactly 1
**Validates: Requirements 4.1**

**Property 13: Pipes are scored only once**
*For any* pipe that has been marked as passed, subsequent updates where the bird is still past the pipe's center should not increment the score again
**Validates: Requirements 4.5**

### State Management Properties

**Property 14: Menu to playing transition**
*For any* game state where gameStatus is 'menu', when a flap action is received, the gameStatus should transition to 'playing'
**Validates: Requirements 5.2**

**Property 15: Game over restart resets state**
*For any* game state where gameStatus is 'gameOver', calling reset should set gameStatus to 'menu', clear all pipes, reset bird to initial position, and set score to 0
**Validates: Requirements 5.3, 5.4, 5.5**

### Input Handling Properties

**Property 16: Touch and click equivalence**
*For any* game state, touch events and click events should trigger the same flap action with identical timing and effect
**Validates: Requirements 6.1, 6.5**

### Animation Properties

**Property 17: Rotation follows velocity**
*For any* bird state, when velocity is negative (moving up), rotation should decrease (tilt up), and when velocity is positive (falling), rotation should increase (tilt down)
**Validates: Requirements 7.1, 7.2**

## Error Handling

### Input Validation

- **Invalid container**: If init() is called without a valid container element, throw an error immediately
- **Canvas creation failure**: If canvas cannot be created or context cannot be obtained, display error message to user
- **Missing configuration**: Use default configuration values if custom config is incomplete

### Runtime Errors

- **Animation frame errors**: Wrap game loop in try-catch to prevent crashes from propagating
- **Rendering errors**: Log canvas rendering errors but continue game loop
- **State corruption**: Validate state structure before updates, reset to safe state if corrupted

### Mobile-Specific Handling

- **Touch event failures**: Fall back to mouse events if touch events are not supported
- **Viewport changes**: Listen for resize events and recalculate canvas dimensions
- **Performance degradation**: Monitor frame time and adjust update frequency if needed

### Resource Cleanup

- **Memory leaks**: Ensure all event listeners are removed in destroy()
- **Animation frames**: Cancel requestAnimationFrame when stopping game loop
- **Canvas cleanup**: Clear canvas and remove from DOM when destroying game

## Testing Strategy

The Flappy Bird game will use a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage and correctness.

### Property-Based Testing

Property-based testing will be implemented using **fast-check**, which is already used in the existing test suite. Each correctness property defined above will be implemented as a property-based test.

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for game state, bird positions, pipe configurations, and time deltas
- Each test will be tagged with a comment referencing the specific correctness property from this design document

**Test Format:**
```javascript
// Feature: flappy-bird-game, Property 1: Flap applies upward velocity
// Validates: Requirements 1.1
test('flap applies upward velocity', () => {
  fc.assert(
    fc.property(
      birdStateGenerator(),
      (birdState) => {
        // Test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

**Custom Generators:**
- `birdStateGenerator()`: Generates random valid bird states
- `pipeArrayGenerator()`: Generates random arrays of pipes
- `gameStateGenerator()`: Generates complete game states
- `timeDeltaGenerator()`: Generates realistic time deltas (0-100ms)
- `canvasDimensionsGenerator()`: Generates valid canvas sizes

### Unit Testing

Unit tests will complement property tests by covering:

**Specific Examples:**
- Initial game state has score of 0 (validates 4.2)
- Initial game status is 'menu' (validates 5.1)
- Touch events call preventDefault (validates 6.2)
- Game exports required interface methods (validates 8.4)
- Init successfully creates game elements (validates 8.1)
- Pause/destroy stops game loop (validates 8.2)
- Event listeners are properly cleaned up (validates 8.5)

**Edge Cases:**
- Bird at exact boundary positions
- Pipes at exact scoring threshold
- Zero time delta updates
- Rapid flap inputs
- State transitions during updates

**Integration Points:**
- Module initialization and cleanup
- State manager and game logic coordination
- UI controller rendering with state updates
- Input handler event propagation

### Test Organization

```
tests/
├── flappyBirdGameLogic.property.test.js    # Physics and collision properties
├── flappyBirdStateManager.property.test.js  # State management properties
├── flappyBirdPipes.property.test.js         # Pipe generation and movement
├── flappyBirdGameLogic.test.js              # Unit tests for game logic
├── flappyBirdStateManager.test.js           # Unit tests for state manager
├── flappyBirdIntegration.test.js            # Integration tests
└── flappyBirdGameWrapper.test.js            # Game interface tests
```

### Testing Priorities

1. **Critical Path**: Physics, collision detection, scoring (Properties 1-13)
2. **State Management**: Game state transitions and resets (Properties 14-15)
3. **Input Handling**: Touch and click equivalence (Property 16)
4. **Visual Feedback**: Rotation animations (Property 17)
5. **Integration**: Module coordination and lifecycle

### Continuous Testing

- All tests must pass before merging code
- Property tests catch edge cases across input space
- Unit tests verify specific behaviors and examples
- Integration tests ensure modules work together correctly

## Implementation Notes

### Canvas Rendering Optimization

- Use double buffering to prevent flickering
- Clear only dirty regions when possible
- Cache rendered sprites for better performance
- Use CSS transforms for canvas scaling on mobile

### Mobile Considerations

- Prevent zoom on double-tap using touch-action CSS
- Use passive event listeners where appropriate
- Test on various screen sizes and orientations
- Optimize for 60fps on mid-range mobile devices

### Accessibility

- Provide keyboard controls (spacebar to flap)
- Include ARIA labels for game state
- Ensure sufficient color contrast
- Support reduced motion preferences

### Performance Targets

- 60fps on desktop browsers
- 60fps on modern mobile devices (last 3 years)
- < 100ms input latency
- < 50MB memory usage
- Smooth gameplay on GitHub Pages CDN

### Browser Compatibility

- Modern browsers with ES6 module support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- iOS Safari 14+, Chrome Mobile 90+
- No polyfills required for target browsers
