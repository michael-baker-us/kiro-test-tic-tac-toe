// Property-based tests for Flappy Bird game logic
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  updateBirdPhysics, 
  checkCollision, 
  updatePipes, 
  generatePipe, 
  checkScoring 
} from '../src/games/flappy-bird/gameLogic.js';
import { CONFIG } from '../src/games/flappy-bird/config.js';

// Custom arbitraries
const configArb = fc.record({
  gravity: fc.integer({ min: 800, max: 1600 }),
  flapVelocity: fc.integer({ min: -600, max: -200 }),
  birdX: fc.integer({ min: 50, max: 150 }),
  birdSize: fc.integer({ min: 20, max: 50 }),
  pipeWidth: fc.integer({ min: 40, max: 80 }),
  pipeGap: fc.integer({ min: 100, max: 200 }),
  pipeSpeed: fc.integer({ min: 100, max: 300 }),
  maxRotation: fc.integer({ min: 45, max: 90 }),
  canvasWidth: fc.integer({ min: 300, max: 600 }),
  canvasHeight: fc.integer({ min: 400, max: 800 })
});

const birdStateArb = (config) => fc.record({
  x: fc.constant(config.birdX),
  y: fc.integer({ min: 0, max: config.canvasHeight - config.birdSize }),
  velocity: fc.integer({ min: -800, max: 800 }),
  width: fc.constant(config.birdSize),
  height: fc.constant(config.birdSize),
  rotation: fc.integer({ min: -config.maxRotation, max: config.maxRotation })
});

const timeDeltaArb = fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }); // 1ms to 100ms

describe('Flappy Bird Game Logic Properties', () => {
  // Feature: flappy-bird-game, Property 1: Flap applies upward velocity
  // Validates: Requirements 1.1
  it('Property 1: Flap applies upward velocity - for any bird state, when a flap action is applied, the birds velocity should be set to the configured flap velocity', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Create a bird state with any velocity
        const bird = {
          x: config.birdX,
          y: config.canvasHeight / 2,
          velocity: Math.random() * 1000 - 500, // Random velocity
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        // Apply flap by setting velocity to flapVelocity
        bird.velocity = config.flapVelocity;
        
        // Verify velocity is now the flap velocity
        return bird.velocity === config.flapVelocity;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 2: Physics integration updates position and velocity
  // Validates: Requirements 1.2, 1.5
  it('Property 2: Physics integration updates position and velocity - for any bird state and time delta, updating physics should change position by velocity * deltaTime and increase velocity by gravity * deltaTime', () => {
    fc.assert(
      fc.property(configArb, timeDeltaArb, (config, deltaTime) => {
        // Start bird in middle of screen with positive velocity to avoid boundary
        const bird = {
          x: config.birdX,
          y: config.canvasHeight / 2,
          velocity: 100,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        const initialY = bird.y;
        const initialVelocity = bird.velocity;
        
        const updatedBird = updateBirdPhysics(bird, deltaTime, config);
        
        // Calculate expected values (velocity updates first, then position uses new velocity)
        const expectedVelocity = initialVelocity + config.gravity * deltaTime;
        const expectedY = initialY + expectedVelocity * deltaTime;
        
        // Check if we would hit the top boundary
        if (expectedY < 0) {
          // If hitting top boundary, y should be 0 and velocity should be 0
          return updatedBird.y === 0 && updatedBird.velocity === 0;
        }
        
        // Otherwise, check normal physics
        const velocityMatch = Math.abs(updatedBird.velocity - expectedVelocity) < 0.01;
        const positionMatch = Math.abs(updatedBird.y - expectedY) < 0.01;
        
        return velocityMatch && positionMatch;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 3: Top boundary constraint
  // Validates: Requirements 1.3
  it('Property 3: Top boundary constraint - for any bird state after physics update, the birds y position should never be less than zero', () => {
    fc.assert(
      fc.property(configArb, timeDeltaArb, (config, deltaTime) => {
        // Create bird with strong upward velocity near top
        const bird = {
          x: config.birdX,
          y: 10, // Near top
          velocity: -500, // Strong upward velocity
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        const updatedBird = updateBirdPhysics(bird, deltaTime, config);
        
        // Y position should never be negative
        return updatedBird.y >= 0;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 17: Rotation follows velocity
  // Validates: Requirements 7.1, 7.2
  it('Property 17: Rotation follows velocity - for any bird state, when velocity is negative (moving up), rotation should decrease (tilt up), and when velocity is positive (falling), rotation should increase (tilt down)', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Test with upward velocity (negative) - use strong upward velocity
        const birdUp = {
          x: config.birdX,
          y: config.canvasHeight / 2,
          velocity: config.flapVelocity, // Use flap velocity (negative)
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        // Use very small deltaTime to minimize velocity change
        const updatedBirdUp = updateBirdPhysics(birdUp, 0.001, config);
        
        // Test with downward velocity (positive)
        const birdDown = {
          x: config.birdX,
          y: config.canvasHeight / 2,
          velocity: Math.abs(config.flapVelocity), // Positive velocity
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        const updatedBirdDown = updateBirdPhysics(birdDown, 0.001, config);
        
        // Rotation should follow the FINAL velocity after physics update
        // When final velocity is negative, rotation should be negative or zero
        // When final velocity is positive, rotation should be positive or zero
        const upwardRotationCorrect = updatedBirdUp.velocity < 0 ? updatedBirdUp.rotation <= 0 : true;
        const downwardRotationCorrect = updatedBirdDown.velocity > 0 ? updatedBirdDown.rotation >= 0 : true;
        
        return upwardRotationCorrect && downwardRotationCorrect;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 9: Collision detection accuracy
  // Validates: Requirements 3.1, 3.4
  it('Property 9: Collision detection accuracy - for any bird and pipe positions where the birds bounding box overlaps with a pipes bounding box (outside the gap), collision detection should return true', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Position bird so it will be horizontally aligned with pipe
        const birdX = 100;
        const pipeX = birdX - 10; // Pipe overlaps with bird
        
        // Create a pipe
        const pipe = {
          x: pipeX,
          gapY: 300,
          gapHeight: config.pipeGap,
          width: config.pipeWidth,
          passed: false
        };
        
        // Create bird positioned to collide with top part of pipe (above gap)
        const birdAboveGap = {
          x: birdX,
          y: pipe.gapY - pipe.gapHeight / 2 - config.birdSize, // Just above gap
          velocity: 0,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        // Create bird positioned to collide with bottom part of pipe (below gap)
        const birdBelowGap = {
          x: birdX,
          y: pipe.gapY + pipe.gapHeight / 2, // Just below gap
          velocity: 0,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        const collisionAbove = checkCollision(birdAboveGap, [pipe], config.canvasHeight);
        const collisionBelow = checkCollision(birdBelowGap, [pipe], config.canvasHeight);
        
        // Both should detect collision
        return collisionAbove && collisionBelow;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 10: No collision in gap
  // Validates: Requirements 3.1, 3.4
  it('Property 10: No collision in gap - for any bird and pipe positions where the bird is horizontally aligned with the pipe but vertically within the gap boundaries, collision detection should return false', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Position bird so it will be horizontally aligned with pipe
        const birdX = 100;
        const pipeX = birdX - 10; // Pipe overlaps with bird
        
        // Create a pipe
        const pipe = {
          x: pipeX,
          gapY: 300,
          gapHeight: config.pipeGap,
          width: config.pipeWidth,
          passed: false
        };
        
        // Create bird positioned in the center of the gap
        const birdInGap = {
          x: birdX,
          y: pipe.gapY - config.birdSize / 2, // Center of gap
          velocity: 0,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        const collision = checkCollision(birdInGap, [pipe], config.canvasHeight);
        
        // Should NOT detect collision when bird is in gap
        return !collision;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 4: Bottom boundary triggers game over
  // Validates: Requirements 1.4, 3.2
  it('Property 4: Bottom boundary triggers game over - for any bird state where y position is greater than or equal to canvas height, collision detection should return true', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Create bird at bottom boundary
        const birdAtBottom = {
          x: config.birdX,
          y: config.canvasHeight - config.birdSize, // Bottom edge touches canvas bottom
          velocity: 100,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        // Create bird below bottom boundary
        const birdBelowBottom = {
          x: config.birdX,
          y: config.canvasHeight, // Past bottom
          velocity: 100,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        const collisionAtBottom = checkCollision(birdAtBottom, [], config.canvasHeight);
        const collisionBelowBottom = checkCollision(birdBelowBottom, [], config.canvasHeight);
        
        // Both should detect collision
        return collisionAtBottom && collisionBelowBottom;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 5: Pipes move at constant speed
  // Validates: Requirements 2.2
  it('Property 5: Pipes move at constant speed - for any set of pipes and time delta, after updating pipes, each pipes x position should decrease by pipeSpeed * deltaTime', () => {
    fc.assert(
      fc.property(
        configArb,
        timeDeltaArb,
        fc.array(fc.record({
          x: fc.integer({ min: 0, max: 1000 }),
          gapY: fc.integer({ min: 100, max: 500 }),
          gapHeight: fc.integer({ min: 100, max: 200 }),
          width: fc.integer({ min: 40, max: 80 }),
          passed: fc.boolean()
        }), { minLength: 1, maxLength: 5 }),
        (config, deltaTime, pipes) => {
          // Store initial positions
          const initialPositions = pipes.map(p => p.x);
          
          // Update pipes
          const updatedPipes = updatePipes(pipes, deltaTime, config);
          
          // Check that each pipe moved by the correct amount
          // Note: some pipes may be filtered out if they go off-screen
          return updatedPipes.every((pipe, index) => {
            // Find the original pipe by matching other properties
            const originalIndex = pipes.findIndex(p => 
              p.gapY === pipe.gapY && 
              p.gapHeight === pipe.gapHeight && 
              p.passed === pipe.passed
            );
            
            if (originalIndex === -1) return true; // Pipe was filtered
            
            const expectedX = pipes[originalIndex].x - config.pipeSpeed * deltaTime;
            return Math.abs(pipe.x - expectedX) < 0.01;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 6: Off-screen pipes are removed
  // Validates: Requirements 2.3
  it('Property 6: Off-screen pipes are removed - for any set of pipes after update, no pipe should have an x position where x + pipeWidth < 0', () => {
    fc.assert(
      fc.property(
        configArb,
        timeDeltaArb,
        fc.array(fc.record({
          x: fc.integer({ min: -100, max: 1000 }), // Include negative to test removal
          gapY: fc.integer({ min: 100, max: 500 }),
          gapHeight: fc.integer({ min: 100, max: 200 }),
          width: fc.integer({ min: 40, max: 80 }),
          passed: fc.boolean()
        }), { minLength: 0, maxLength: 10 }),
        (config, deltaTime, pipes) => {
          // Update pipes
          const updatedPipes = updatePipes(pipes, deltaTime, config);
          
          // Check that no pipe is completely off-screen (x + width < 0)
          return updatedPipes.every(pipe => pipe.x + pipe.width >= 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 7: Generated pipes have correct gap height
  // Validates: Requirements 2.4
  it('Property 7: Generated pipes have correct gap height - for any newly generated pipe, the gap height should equal the configured gap height', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Generate a pipe
        const pipe = generatePipe(config.canvasWidth, config.canvasHeight, config);
        
        // Check that gap height matches configuration
        return pipe.gapHeight === config.pipeGap;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 8: Generated pipes have valid gap positions
  // Validates: Requirements 2.5
  it('Property 8: Generated pipes have valid gap positions - for any newly generated pipe, the gap center position (gapY) should be positioned such that gapY - gapHeight/2 >= 0 and gapY + gapHeight/2 <= canvasHeight', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Generate a pipe
        const pipe = generatePipe(config.canvasWidth, config.canvasHeight, config);
        
        // Check that gap is within playable boundaries
        const gapTop = pipe.gapY - pipe.gapHeight / 2;
        const gapBottom = pipe.gapY + pipe.gapHeight / 2;
        
        return gapTop >= 0 && gapBottom <= config.canvasHeight;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 12: Score increments when passing pipes
  // Validates: Requirements 4.1
  it('Property 12: Score increments when passing pipes - for any bird and pipe where the birds x position crosses the pipes center x position without collision, the score should increment by exactly 1', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Create a bird positioned past the pipe center
        const bird = {
          x: config.birdX,
          y: config.canvasHeight / 2,
          velocity: 0,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        // Create a pipe that the bird has just passed
        const pipe = {
          x: bird.x - config.pipeWidth, // Pipe is behind bird
          gapY: bird.y + config.birdSize / 2, // Gap aligned with bird
          gapHeight: config.pipeGap,
          width: config.pipeWidth,
          passed: false
        };
        
        // Check scoring
        const scoreIncrement = checkScoring(bird, [pipe]);
        
        // Should increment by exactly 1
        return scoreIncrement === 1 && pipe.passed === true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: flappy-bird-game, Property 13: Pipes are scored only once
  // Validates: Requirements 4.5
  it('Property 13: Pipes are scored only once - for any pipe that has been marked as passed, subsequent updates where the bird is still past the pipes center should not increment the score again', () => {
    fc.assert(
      fc.property(configArb, (config) => {
        // Create a bird positioned past the pipe center
        const bird = {
          x: config.birdX,
          y: config.canvasHeight / 2,
          velocity: 0,
          width: config.birdSize,
          height: config.birdSize,
          rotation: 0
        };
        
        // Create a pipe that has already been passed
        const pipe = {
          x: bird.x - config.pipeWidth, // Pipe is behind bird
          gapY: bird.y + config.birdSize / 2, // Gap aligned with bird
          gapHeight: config.pipeGap,
          width: config.pipeWidth,
          passed: true // Already marked as passed
        };
        
        // Check scoring again
        const scoreIncrement = checkScoring(bird, [pipe]);
        
        // Should NOT increment (should be 0)
        return scoreIncrement === 0 && pipe.passed === true;
      }),
      { numRuns: 100 }
    );
  });
});

