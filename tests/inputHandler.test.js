// Unit tests for Snake input handler
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createInputHandler, calculateSwipeDirection } from '../src/games/snake/inputHandler.js';
import { DIRECTIONS } from '../src/games/snake/gameLogic.js';

describe('Input Handler', () => {
  let onDirectionChange;
  let onPause;
  let onRestart;
  let inputHandler;
  let mockElement;

  beforeEach(() => {
    onDirectionChange = vi.fn();
    onPause = vi.fn();
    onRestart = vi.fn();
    inputHandler = createInputHandler(onDirectionChange, onPause, onRestart);
    
    // Create a mock element
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
  });

  afterEach(() => {
    if (inputHandler) {
      inputHandler.destroy();
    }
  });

  describe('Keyboard Event Handling', () => {
    it('should handle arrow up key', () => {
      inputHandler.init(mockElement);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(event);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.UP);
    });

    it('should handle arrow down key', () => {
      inputHandler.init(mockElement);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.DOWN);
    });

    it('should handle arrow left key', () => {
      inputHandler.init(mockElement);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(event);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.LEFT);
    });

    it('should handle arrow right key', () => {
      inputHandler.init(mockElement);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.RIGHT);
    });

    it('should handle space bar for pause', () => {
      inputHandler.init(mockElement);
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
      
      expect(onPause).toHaveBeenCalled();
    });

    it('should handle Enter key for restart', () => {
      inputHandler.init(mockElement);
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);
      
      expect(onRestart).toHaveBeenCalled();
    });

    it('should handle "r" key for restart', () => {
      inputHandler.init(mockElement);
      
      const event = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(event);
      
      expect(onRestart).toHaveBeenCalled();
    });
  });

  describe('Touch Event Handling', () => {
    it('should detect right swipe', () => {
      inputHandler.init(mockElement);
      inputHandler.enableTouchControls();
      
      // Simulate touch start
      const touchStart = {
        touches: [{ clientX: 100, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchstart')[1](touchStart);
      
      // Simulate touch end (swipe right)
      const touchEnd = {
        changedTouches: [{ clientX: 200, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchend')[1](touchEnd);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.RIGHT);
    });

    it('should detect left swipe', () => {
      inputHandler.init(mockElement);
      inputHandler.enableTouchControls();
      
      // Simulate touch start
      const touchStart = {
        touches: [{ clientX: 200, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchstart')[1](touchStart);
      
      // Simulate touch end (swipe left)
      const touchEnd = {
        changedTouches: [{ clientX: 100, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchend')[1](touchEnd);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.LEFT);
    });

    it('should detect up swipe', () => {
      inputHandler.init(mockElement);
      inputHandler.enableTouchControls();
      
      // Simulate touch start
      const touchStart = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchstart')[1](touchStart);
      
      // Simulate touch end (swipe up)
      const touchEnd = {
        changedTouches: [{ clientX: 100, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchend')[1](touchEnd);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.UP);
    });

    it('should detect down swipe', () => {
      inputHandler.init(mockElement);
      inputHandler.enableTouchControls();
      
      // Simulate touch start
      const touchStart = {
        touches: [{ clientX: 100, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchstart')[1](touchStart);
      
      // Simulate touch end (swipe down)
      const touchEnd = {
        changedTouches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchend')[1](touchEnd);
      
      expect(onDirectionChange).toHaveBeenCalledWith(DIRECTIONS.DOWN);
    });

    it('should ignore swipes below minimum threshold', () => {
      inputHandler.init(mockElement);
      inputHandler.enableTouchControls();
      
      // Simulate touch start
      const touchStart = {
        touches: [{ clientX: 100, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchstart')[1](touchStart);
      
      // Simulate touch end (small movement, below threshold)
      const touchEnd = {
        changedTouches: [{ clientX: 110, clientY: 105 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchend')[1](touchEnd);
      
      expect(onDirectionChange).not.toHaveBeenCalled();
    });

    it('should not process touch events when touch controls are disabled', () => {
      inputHandler.init(mockElement);
      // Don't enable touch controls
      
      // Simulate touch start
      const touchStart = {
        touches: [{ clientX: 100, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchstart')[1](touchStart);
      
      // Simulate touch end
      const touchEnd = {
        changedTouches: [{ clientX: 200, clientY: 100 }],
        preventDefault: vi.fn()
      };
      mockElement.addEventListener.mock.calls
        .find(call => call[0] === 'touchend')[1](touchEnd);
      
      expect(onDirectionChange).not.toHaveBeenCalled();
    });
  });

  describe('Minimum Swipe Threshold', () => {
    it('should reject swipes with distance less than 30 pixels', () => {
      const direction = calculateSwipeDirection(20, 10);
      expect(direction).toBeNull();
    });

    it('should accept swipes with distance greater than 30 pixels', () => {
      const direction = calculateSwipeDirection(50, 0);
      expect(direction).toBe(DIRECTIONS.RIGHT);
    });

    it('should accept diagonal swipes that meet threshold', () => {
      const direction = calculateSwipeDirection(25, 25);
      expect(direction).not.toBeNull();
    });
  });

  describe('Event Cleanup', () => {
    it('should remove keyboard event listeners on destroy', () => {
      inputHandler.init(mockElement);
      
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      inputHandler.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it('should remove touch event listeners on destroy', () => {
      inputHandler.init(mockElement);
      inputHandler.destroy();
      
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    it('should handle destroy when not initialized', () => {
      expect(() => inputHandler.destroy()).not.toThrow();
    });

    it('should not throw when destroying multiple times', () => {
      inputHandler.init(mockElement);
      inputHandler.destroy();
      expect(() => inputHandler.destroy()).not.toThrow();
    });
  });
});
