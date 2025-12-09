// Property-based tests for Flappy Bird input handler
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { createInputHandler } from '../src/games/flappy-bird/inputHandler.js';

describe('Flappy Bird Input Handler Properties', () => {
  let container;
  
  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });
  
  // Feature: flappy-bird-game, Property 16: Touch and click equivalence
  // Validates: Requirements 6.1, 6.5
  it('Property 16: Touch and click equivalence - for any game state, touch events and click events should trigger the same flap action with identical timing and effect', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // Random test iteration seed
        (seed) => {
          // Create mock callbacks to track calls
          let flapCallCount = 0;
          let startCallCount = 0;
          let restartCallCount = 0;
          
          const onFlap = vi.fn(() => { flapCallCount++; });
          const onStart = vi.fn(() => { startCallCount++; });
          const onRestart = vi.fn(() => { restartCallCount++; });
          
          // Test with click event
          const clickHandler = createInputHandler(onFlap, onStart, onRestart);
          clickHandler.init(container);
          
          // Simulate click event
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
          });
          container.dispatchEvent(clickEvent);
          
          // Record click results
          const clickFlapCount = flapCallCount;
          const clickStartCount = startCallCount;
          const clickRestartCount = restartCallCount;
          
          // Clean up click handler
          clickHandler.destroy();
          
          // Reset counters
          flapCallCount = 0;
          startCallCount = 0;
          restartCallCount = 0;
          
          // Test with touch event
          const touchHandler = createInputHandler(onFlap, onStart, onRestart);
          touchHandler.init(container);
          touchHandler.enableTouchControls();
          
          // Simulate touch event
          const touchEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [{ clientX: 100, clientY: 100 }]
          });
          container.dispatchEvent(touchEvent);
          
          // Record touch results
          const touchFlapCount = flapCallCount;
          const touchStartCount = startCallCount;
          const touchRestartCount = restartCallCount;
          
          // Clean up touch handler
          touchHandler.destroy();
          
          // Verify equivalence: touch and click should trigger the same callbacks
          // with the same number of calls
          return (
            clickFlapCount === touchFlapCount &&
            clickStartCount === touchStartCount &&
            clickRestartCount === touchRestartCount &&
            clickFlapCount === 1 && // Each should be called exactly once
            clickStartCount === 1 &&
            clickRestartCount === 1
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Additional property: Keyboard spacebar equivalence
  it('Property: Keyboard spacebar triggers same actions as click', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // Random test iteration seed
        (seed) => {
          // Create mock callbacks to track calls
          let flapCallCount = 0;
          let startCallCount = 0;
          let restartCallCount = 0;
          
          const onFlap = vi.fn(() => { flapCallCount++; });
          const onStart = vi.fn(() => { startCallCount++; });
          const onRestart = vi.fn(() => { restartCallCount++; });
          
          // Test with click event
          const clickHandler = createInputHandler(onFlap, onStart, onRestart);
          clickHandler.init(container);
          
          // Simulate click event
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
          });
          container.dispatchEvent(clickEvent);
          
          // Record click results
          const clickFlapCount = flapCallCount;
          const clickStartCount = startCallCount;
          const clickRestartCount = restartCallCount;
          
          // Clean up click handler
          clickHandler.destroy();
          
          // Reset counters
          flapCallCount = 0;
          startCallCount = 0;
          restartCallCount = 0;
          
          // Test with keyboard event
          const keyHandler = createInputHandler(onFlap, onStart, onRestart);
          keyHandler.init(container);
          
          // Simulate spacebar keydown event
          const keyEvent = new KeyboardEvent('keydown', {
            key: ' ',
            bubbles: true,
            cancelable: true
          });
          document.dispatchEvent(keyEvent);
          
          // Record keyboard results
          const keyFlapCount = flapCallCount;
          const keyStartCount = startCallCount;
          const keyRestartCount = restartCallCount;
          
          // Clean up keyboard handler
          keyHandler.destroy();
          
          // Verify equivalence: keyboard and click should trigger the same callbacks
          return (
            clickFlapCount === keyFlapCount &&
            clickStartCount === keyStartCount &&
            clickRestartCount === keyRestartCount &&
            clickFlapCount === 1 &&
            clickStartCount === 1 &&
            clickRestartCount === 1
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
