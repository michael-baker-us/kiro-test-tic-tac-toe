// Unit tests for Tetris input handler
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createInputHandler, calculateSwipeDirection } from '../src/games/tetris/inputHandler.js';

describe('calculateSwipeDirection', () => {
  it('should return left for horizontal left swipe', () => {
    expect(calculateSwipeDirection(-50, 10)).toBe('left');
  });

  it('should return right for horizontal right swipe', () => {
    expect(calculateSwipeDirection(50, 10)).toBe('right');
  });

  it('should return down for vertical down swipe', () => {
    expect(calculateSwipeDirection(10, 50)).toBe('down');
  });

  it('should return null for vertical up swipe', () => {
    expect(calculateSwipeDirection(10, -50)).toBe(null);
  });

  it('should return null for swipe below threshold', () => {
    expect(calculateSwipeDirection(10, 10)).toBe(null);
  });

  it('should prioritize horizontal over vertical when both are large', () => {
    expect(calculateSwipeDirection(60, 40)).toBe('right');
    expect(calculateSwipeDirection(-60, 40)).toBe('left');
  });

  it('should prioritize vertical when vertical delta is larger', () => {
    expect(calculateSwipeDirection(20, 60)).toBe('down');
  });
});

describe('Tetris Input Handler', () => {
  let onMoveLeft;
  let onMoveRight;
  let onMoveDown;
  let onRotateCW;
  let onRotateCCW;
  let onHardDrop;
  let onPause;
  let inputHandler;

  beforeEach(() => {
    onMoveLeft = vi.fn();
    onMoveRight = vi.fn();
    onMoveDown = vi.fn();
    onRotateCW = vi.fn();
    onRotateCCW = vi.fn();
    onHardDrop = vi.fn();
    onPause = vi.fn();
    
    inputHandler = createInputHandler({
      onMoveLeft,
      onMoveRight,
      onMoveDown,
      onRotateCW,
      onRotateCCW,
      onHardDrop,
      onPause
    });
  });

  afterEach(() => {
    if (inputHandler) {
      inputHandler.destroy();
    }
  });

  describe('Key Mapping - Movement', () => {
    it('should handle left arrow key', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(event);
      
      expect(onMoveLeft).toHaveBeenCalledTimes(1);
    });

    it('should handle right arrow key', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);
      
      expect(onMoveRight).toHaveBeenCalledTimes(1);
    });

    it('should handle down arrow key for soft drop', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
      
      expect(onMoveDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Key Mapping - Rotation', () => {
    it('should handle up arrow key for clockwise rotation', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(event);
      
      expect(onRotateCW).toHaveBeenCalledTimes(1);
    });

    it('should handle X key for clockwise rotation', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'x' });
      document.dispatchEvent(event);
      
      expect(onRotateCW).toHaveBeenCalledTimes(1);
    });

    it('should handle uppercase X key for clockwise rotation', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'X' });
      document.dispatchEvent(event);
      
      expect(onRotateCW).toHaveBeenCalledTimes(1);
    });

    it('should handle Z key for counter-clockwise rotation', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'z' });
      document.dispatchEvent(event);
      
      expect(onRotateCCW).toHaveBeenCalledTimes(1);
    });

    it('should handle uppercase Z key for counter-clockwise rotation', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'Z' });
      document.dispatchEvent(event);
      
      expect(onRotateCCW).toHaveBeenCalledTimes(1);
    });
  });

  describe('Key Mapping - Hard Drop', () => {
    it('should handle space bar for hard drop', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);
      
      expect(onHardDrop).toHaveBeenCalledTimes(1);
    });
  });

  describe('Key Mapping - Pause', () => {
    it('should handle P key for pause', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(event);
      
      expect(onPause).toHaveBeenCalledTimes(1);
    });

    it('should handle uppercase P key for pause', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'P' });
      document.dispatchEvent(event);
      
      expect(onPause).toHaveBeenCalledTimes(1);
    });

    it('should handle Escape key for pause', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(onPause).toHaveBeenCalledTimes(1);
    });
  });

  describe('Key Repeat for Movement', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should repeat left movement when key is held', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(event);
      
      expect(onMoveLeft).toHaveBeenCalledTimes(1);
      
      // Advance time past initial delay
      vi.advanceTimersByTime(150);
      
      // Advance time for several repeats
      vi.advanceTimersByTime(200); // 4 repeats at 50ms each
      
      expect(onMoveLeft).toHaveBeenCalledTimes(5); // 1 initial + 4 repeats
    });

    it('should repeat right movement when key is held', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);
      
      expect(onMoveRight).toHaveBeenCalledTimes(1);
      
      // Advance time past initial delay
      vi.advanceTimersByTime(150);
      
      // Advance time for several repeats
      vi.advanceTimersByTime(200);
      
      expect(onMoveRight).toHaveBeenCalledTimes(5);
    });

    it('should repeat down movement when key is held', () => {
      inputHandler.init();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event);
      
      expect(onMoveDown).toHaveBeenCalledTimes(1);
      
      // Advance time past initial delay
      vi.advanceTimersByTime(150);
      
      // Advance time for several repeats
      vi.advanceTimersByTime(200);
      
      expect(onMoveDown).toHaveBeenCalledTimes(5);
    });

    it('should stop repeating when key is released', () => {
      inputHandler.init();
      
      const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(keydownEvent);
      
      expect(onMoveLeft).toHaveBeenCalledTimes(1);
      
      // Advance time past initial delay
      vi.advanceTimersByTime(150);
      
      // Release key
      const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
      document.dispatchEvent(keyupEvent);
      
      // Advance time - should not trigger more calls
      vi.advanceTimersByTime(200);
      
      expect(onMoveLeft).toHaveBeenCalledTimes(1); // Still just 1
    });
  });

  describe('Rotation Debouncing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should debounce rapid clockwise rotation attempts', () => {
      inputHandler.init();
      
      // First rotation
      const event1 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(event1);
      
      expect(onRotateCW).toHaveBeenCalledTimes(1);
      
      // Try to rotate again immediately (should be ignored)
      const event2 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(event2);
      
      expect(onRotateCW).toHaveBeenCalledTimes(1); // Still 1
      
      // Advance time past debounce period
      vi.advanceTimersByTime(100);
      
      // Now rotation should work
      const event3 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(event3);
      
      expect(onRotateCW).toHaveBeenCalledTimes(2);
    });

    it('should debounce rapid counter-clockwise rotation attempts', () => {
      inputHandler.init();
      
      // First rotation
      const event1 = new KeyboardEvent('keydown', { key: 'z' });
      document.dispatchEvent(event1);
      
      expect(onRotateCCW).toHaveBeenCalledTimes(1);
      
      // Try to rotate again immediately (should be ignored)
      const event2 = new KeyboardEvent('keydown', { key: 'z' });
      document.dispatchEvent(event2);
      
      expect(onRotateCCW).toHaveBeenCalledTimes(1);
      
      // Advance time past debounce period
      vi.advanceTimersByTime(100);
      
      // Now rotation should work
      const event3 = new KeyboardEvent('keydown', { key: 'z' });
      document.dispatchEvent(event3);
      
      expect(onRotateCCW).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Listener Registration', () => {
    it('should register keydown listener on init', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      inputHandler.init();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });

    it('should register keyup listener on init', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      inputHandler.init();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should remove keydown listener on destroy', () => {
      inputHandler.init();
      
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      inputHandler.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('should remove keyup listener on destroy', () => {
      inputHandler.init();
      
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      inputHandler.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('should handle destroy when not initialized', () => {
      expect(() => inputHandler.destroy()).not.toThrow();
    });

    it('should not throw when destroying multiple times', () => {
      inputHandler.init();
      inputHandler.destroy();
      expect(() => inputHandler.destroy()).not.toThrow();
    });

    it('should clear all key repeat intervals on destroy', () => {
      vi.useFakeTimers();
      
      inputHandler.init();
      
      // Start key repeat
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(event);
      
      // Advance time to start repeat
      vi.advanceTimersByTime(150);
      
      // Destroy should clear intervals
      inputHandler.destroy();
      
      // Advance time - callback should not be called
      const callCountBeforeDestroy = onMoveLeft.mock.calls.length;
      vi.advanceTimersByTime(200);
      
      expect(onMoveLeft).toHaveBeenCalledTimes(callCountBeforeDestroy);
      
      vi.restoreAllMocks();
    });
  });

  describe('Callback Invocation', () => {
    it('should invoke callbacks when keys are pressed', () => {
      vi.useFakeTimers();
      inputHandler.init();
      
      // Test each callback
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(onMoveLeft).toHaveBeenCalled();
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(onMoveRight).toHaveBeenCalled();
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(onMoveDown).toHaveBeenCalled();
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(onRotateCW).toHaveBeenCalled();
      
      // Advance time past debounce period for next rotation
      vi.advanceTimersByTime(100);
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
      expect(onRotateCCW).toHaveBeenCalled();
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(onHardDrop).toHaveBeenCalled();
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
      expect(onPause).toHaveBeenCalled();
      
      vi.restoreAllMocks();
    });

    it('should not invoke callbacks when handler is not initialized', () => {
      // Don't call init()
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      
      expect(onMoveLeft).not.toHaveBeenCalled();
    });

    it('should allow updating callbacks with setCallbacks', () => {
      inputHandler.init();
      
      const newOnMoveLeft = vi.fn();
      inputHandler.setCallbacks({ onMoveLeft: newOnMoveLeft });
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      
      expect(newOnMoveLeft).toHaveBeenCalled();
      expect(onMoveLeft).not.toHaveBeenCalled();
    });
  });

  describe('Touch Controls', () => {
    let element;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should handle swipe left', () => {
      inputHandler.init(element);
      inputHandler.enableTouchControls();
      
      // Simulate touch start
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      // Simulate touch end (swipe left)
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onMoveLeft).toHaveBeenCalledTimes(1);
    });

    it('should handle swipe right', () => {
      inputHandler.init(element);
      inputHandler.enableTouchControls();
      
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 150, clientY: 100 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onMoveRight).toHaveBeenCalledTimes(1);
    });

    it('should handle swipe down', () => {
      inputHandler.init(element);
      inputHandler.enableTouchControls();
      
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 150 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onMoveDown).toHaveBeenCalledTimes(1);
    });

    it('should handle tap for rotation', () => {
      inputHandler.init(element);
      inputHandler.enableTouchControls();
      
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      // Small movement and quick time = tap
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 102, clientY: 102 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onRotateCW).toHaveBeenCalledTimes(1);
    });

    it('should handle double tap for hard drop', () => {
      vi.useFakeTimers();
      inputHandler.init(element);
      inputHandler.enableTouchControls();
      
      // First tap
      let touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      let touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 102, clientY: 102 }]
      });
      element.dispatchEvent(touchEnd);
      
      // Advance time slightly (within double tap threshold)
      vi.advanceTimersByTime(100);
      
      // Second tap
      touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 102, clientY: 102 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onHardDrop).toHaveBeenCalledTimes(1);
      
      vi.restoreAllMocks();
    });

    it('should not respond to touch when disabled', () => {
      inputHandler.init(element);
      // Don't enable touch controls
      
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onMoveLeft).not.toHaveBeenCalled();
    });

    it('should enable and disable touch controls', () => {
      inputHandler.init(element);
      
      // Initially disabled
      let touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      let touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onMoveLeft).not.toHaveBeenCalled();
      
      // Enable
      inputHandler.enableTouchControls();
      
      touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      });
      element.dispatchEvent(touchEnd);
      
      expect(onMoveLeft).toHaveBeenCalledTimes(1);
      
      // Disable
      inputHandler.disableTouchControls();
      
      touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(touchStart);
      
      touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      });
      element.dispatchEvent(touchEnd);
      
      // Should still be 1 from before
      expect(onMoveLeft).toHaveBeenCalledTimes(1);
    });
  });
});
