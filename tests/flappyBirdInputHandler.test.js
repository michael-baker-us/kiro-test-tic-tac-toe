// Unit tests for Flappy Bird input handler
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createInputHandler } from '../src/games/flappy-bird/inputHandler.js';

describe('Flappy Bird Input Handler', () => {
  let container;
  let inputHandler;
  let onFlap;
  let onStart;
  let onRestart;
  
  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create mock callbacks
    onFlap = vi.fn();
    onStart = vi.fn();
    onRestart = vi.fn();
    
    // Create input handler
    inputHandler = createInputHandler(onFlap, onStart, onRestart);
  });
  
  afterEach(() => {
    // Clean up
    if (inputHandler) {
      inputHandler.destroy();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });
  
  describe('Mouse Click Events', () => {
    it('should call all callbacks on mouse click', () => {
      inputHandler.init(container);
      
      // Simulate click
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      container.dispatchEvent(clickEvent);
      
      // All callbacks should be called
      expect(onFlap).toHaveBeenCalledTimes(1);
      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onRestart).toHaveBeenCalledTimes(1);
    });
    
    it('should prevent default on click', () => {
      inputHandler.init(container);
      
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
      container.dispatchEvent(clickEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
  
  describe('Keyboard Events', () => {
    it('should call all callbacks on spacebar press', () => {
      inputHandler.init(container);
      
      // Simulate spacebar keydown
      const keyEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyEvent);
      
      // All callbacks should be called
      expect(onFlap).toHaveBeenCalledTimes(1);
      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onRestart).toHaveBeenCalledTimes(1);
    });
    
    it('should prevent default on spacebar press', () => {
      inputHandler.init(container);
      
      const keyEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true
      });
      
      const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');
      document.dispatchEvent(keyEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
    
    it('should ignore non-spacebar keys', () => {
      inputHandler.init(container);
      
      // Simulate 'a' key press
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyEvent);
      
      // No callbacks should be called
      expect(onFlap).not.toHaveBeenCalled();
      expect(onStart).not.toHaveBeenCalled();
      expect(onRestart).not.toHaveBeenCalled();
    });
  });
  
  describe('Touch Events', () => {
    it('should not respond to touch events when touch controls are disabled', () => {
      inputHandler.init(container);
      // Don't enable touch controls
      
      // Simulate touch
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 100 }]
      });
      container.dispatchEvent(touchEvent);
      
      // No callbacks should be called
      expect(onFlap).not.toHaveBeenCalled();
      expect(onStart).not.toHaveBeenCalled();
      expect(onRestart).not.toHaveBeenCalled();
    });
    
    it('should call all callbacks on touch when touch controls are enabled', () => {
      inputHandler.init(container);
      inputHandler.enableTouchControls();
      
      // Simulate touch
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 100 }]
      });
      container.dispatchEvent(touchEvent);
      
      // All callbacks should be called
      expect(onFlap).toHaveBeenCalledTimes(1);
      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onRestart).toHaveBeenCalledTimes(1);
    });
    
    it('should prevent default on touch to avoid scrolling', () => {
      inputHandler.init(container);
      inputHandler.enableTouchControls();
      
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');
      container.dispatchEvent(touchEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
    
    it('should not respond to touch after disabling touch controls', () => {
      inputHandler.init(container);
      inputHandler.enableTouchControls();
      inputHandler.disableTouchControls();
      
      // Simulate touch
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 100 }]
      });
      container.dispatchEvent(touchEvent);
      
      // No callbacks should be called
      expect(onFlap).not.toHaveBeenCalled();
      expect(onStart).not.toHaveBeenCalled();
      expect(onRestart).not.toHaveBeenCalled();
    });
  });
  
  describe('Cleanup', () => {
    it('should remove all event listeners on destroy', () => {
      inputHandler.init(container);
      inputHandler.enableTouchControls();
      
      // Destroy the handler
      inputHandler.destroy();
      
      // Try to trigger events
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      container.dispatchEvent(clickEvent);
      
      const keyEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      document.dispatchEvent(keyEvent);
      
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 100 }]
      });
      container.dispatchEvent(touchEvent);
      
      // No callbacks should be called after destroy
      expect(onFlap).not.toHaveBeenCalled();
      expect(onStart).not.toHaveBeenCalled();
      expect(onRestart).not.toHaveBeenCalled();
    });
    
    it('should handle destroy when not initialized', () => {
      const handler = createInputHandler(onFlap, onStart, onRestart);
      
      // Should not throw
      expect(() => handler.destroy()).not.toThrow();
    });
  });
  
  describe('Interface', () => {
    it('should expose required methods', () => {
      expect(inputHandler).toHaveProperty('init');
      expect(inputHandler).toHaveProperty('destroy');
      expect(inputHandler).toHaveProperty('enableTouchControls');
      expect(inputHandler).toHaveProperty('disableTouchControls');
      
      expect(typeof inputHandler.init).toBe('function');
      expect(typeof inputHandler.destroy).toBe('function');
      expect(typeof inputHandler.enableTouchControls).toBe('function');
      expect(typeof inputHandler.disableTouchControls).toBe('function');
    });
  });
});
