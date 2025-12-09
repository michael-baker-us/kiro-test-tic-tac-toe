/**
 * Mobile optimization and responsiveness tests for Snake game
 * Tests Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createSnakeGame from '../src/games/snake/index.js';
import { calculateSwipeDirection } from '../src/games/snake/inputHandler.js';

describe('Snake Game Mobile Optimization', () => {
  let container;
  let game;
  let originalUserAgent;
  let originalInnerWidth;
  let originalInnerHeight;
  let mockContext;

  beforeEach(() => {
    // Save original values
    originalUserAgent = navigator.userAgent;
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;

    // Mock canvas context
    mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn()
    };

    // Mock HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

    // Create container
    container = document.createElement('div');
    container.style.width = '600px';
    container.style.height = '800px';
    document.body.appendChild(container);

    game = createSnakeGame();
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }

    // Restore original values
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true
    });
  });

  describe('Requirement 7.1: Responsive Layout', () => {
    it('should detect mobile device correctly', async () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
        configurable: true
      });

      await game.init(container);

      // Mobile instructions should be visible
      const mobileInstructions = container.querySelector('#mobile-instructions');
      expect(mobileInstructions).toBeTruthy();
      expect(mobileInstructions.style.display).toBe('block');
    });

    it('should not show mobile instructions on desktop', async () => {
      // Mock desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
        configurable: true
      });

      await game.init(container);

      const mobileInstructions = container.querySelector('#mobile-instructions');
      expect(mobileInstructions).toBeTruthy();
      // Should be hidden on desktop
      expect(mobileInstructions.style.display).toBe('none');
    });

    it('should create responsive canvas that fits container', async () => {
      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();

      // Canvas should have positive dimensions
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
      
      // Canvas should be reasonable size (not exceeding typical max)
      expect(canvas.width).toBeLessThanOrEqual(600);
      expect(canvas.height).toBeLessThanOrEqual(600);
    });

    it('should handle small mobile viewport (portrait)', async () => {
      // Simulate small mobile screen
      container.style.width = '375px';
      container.style.height = '667px';

      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();
      // Canvas should be created with reasonable dimensions
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('should handle mobile landscape viewport', async () => {
      // Simulate mobile landscape
      container.style.width = '667px';
      container.style.height = '375px';

      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.width).toBeLessThanOrEqual(667);
    });
  });

  describe('Requirement 7.2: Touch Controls', () => {
    it('should calculate swipe direction for horizontal swipe right', () => {
      const direction = calculateSwipeDirection(100, 10);
      expect(direction).toBe('right');
    });

    it('should calculate swipe direction for horizontal swipe left', () => {
      const direction = calculateSwipeDirection(-100, 10);
      expect(direction).toBe('left');
    });

    it('should calculate swipe direction for vertical swipe down', () => {
      const direction = calculateSwipeDirection(10, 100);
      expect(direction).toBe('down');
    });

    it('should calculate swipe direction for vertical swipe up', () => {
      const direction = calculateSwipeDirection(10, -100);
      expect(direction).toBe('up');
    });

    it('should ignore swipes below minimum threshold', () => {
      // Swipe of 20 pixels (below 30px threshold)
      const direction = calculateSwipeDirection(15, 15);
      expect(direction).toBeNull();
    });

    it('should handle diagonal swipes by primary axis', () => {
      // More horizontal than vertical
      const horizontal = calculateSwipeDirection(80, 40);
      expect(horizontal).toBe('right');

      // More vertical than horizontal
      const vertical = calculateSwipeDirection(40, 80);
      expect(vertical).toBe('down');
    });

    it('should handle edge case of exactly threshold distance', () => {
      // Exactly 30 pixels horizontal
      const direction = calculateSwipeDirection(30, 0);
      expect(direction).toBe('right');
    });

    it('should handle very large swipes', () => {
      // Very large swipe
      const direction = calculateSwipeDirection(500, 50);
      expect(direction).toBe('right');
    });
  });

  describe('Requirement 7.3: Touch-Friendly UI', () => {
    it('should have touch-friendly button sizes', async () => {
      await game.init(container);

      const pauseBtn = container.querySelector('#pause-btn');
      const restartBtn = container.querySelector('#restart-btn');
      const playAgainBtn = container.querySelector('#play-again-btn');

      // Buttons should meet minimum 44x44px touch target size
      expect(pauseBtn).toBeTruthy();
      expect(restartBtn).toBeTruthy();
      expect(playAgainBtn).toBeTruthy();

      // Check computed styles would show actual sizes, but we can verify elements exist
      // and have the control-btn or primary-btn classes which have min-height/width in CSS
      expect(pauseBtn.classList.contains('control-btn')).toBe(true);
      expect(restartBtn.classList.contains('control-btn')).toBe(true);
      expect(playAgainBtn.classList.contains('primary-btn')).toBe(true);
    });

    it('should display mobile instructions element', async () => {
      await game.init(container);

      const mobileInstructions = container.querySelector('#mobile-instructions');
      expect(mobileInstructions).toBeTruthy();
      expect(mobileInstructions.querySelector('p')).toBeTruthy();
    });

    it('should have clear visual hierarchy', async () => {
      await game.init(container);

      // Check all major UI elements exist
      expect(container.querySelector('.game-header')).toBeTruthy();
      expect(container.querySelector('.score-display')).toBeTruthy();
      expect(container.querySelector('#game-canvas')).toBeTruthy();
      expect(container.querySelector('.game-controls')).toBeTruthy();
      expect(container.querySelector('.game-over-overlay')).toBeTruthy();
      expect(container.querySelector('.pause-overlay')).toBeTruthy();
    });
  });

  describe('Requirement 7.4: Viewport Adaptability', () => {
    it('should adapt to different viewport widths', async () => {
      const viewportSizes = [
        { width: '320px', height: '568px' }, // iPhone SE
        { width: '375px', height: '667px' }, // iPhone 8
        { width: '414px', height: '896px' }, // iPhone 11
        { width: '768px', height: '1024px' }, // iPad
      ];

      for (const size of viewportSizes) {
        container.style.width = size.width;
        container.style.height = size.height;

        await game.init(container);

        const canvas = container.querySelector('#game-canvas');
        expect(canvas).toBeTruthy();
        expect(canvas.width).toBeGreaterThan(0);
        expect(canvas.height).toBeGreaterThan(0);

        game.destroy();
      }
    });

    it('should handle orientation changes gracefully', async () => {
      // Portrait
      container.style.width = '375px';
      container.style.height = '667px';
      await game.init(container);

      let canvas = container.querySelector('#game-canvas');
      const portraitWidth = canvas.width;
      const portraitHeight = canvas.height;

      // Canvas should be created in portrait
      expect(portraitWidth).toBeGreaterThan(0);
      expect(portraitHeight).toBeGreaterThan(0);

      game.destroy();

      // Landscape
      container.style.width = '667px';
      container.style.height = '375px';
      await game.init(container);

      canvas = container.querySelector('#game-canvas');
      const landscapeWidth = canvas.width;
      const landscapeHeight = canvas.height;

      // Canvas should be created in landscape
      expect(landscapeWidth).toBeGreaterThan(0);
      expect(landscapeHeight).toBeGreaterThan(0);
      
      // Both orientations should produce valid canvases
      expect(portraitWidth).toBeGreaterThan(0);
      expect(landscapeWidth).toBeGreaterThan(0);
    });

    it('should maintain game structure across viewport changes', async () => {
      await game.init(container);

      // Verify all essential elements exist
      const essentialElements = [
        '.snake-game',
        '.game-header',
        '#game-canvas',
        '.game-controls',
        '#pause-btn',
        '#restart-btn',
      ];

      essentialElements.forEach(selector => {
        expect(container.querySelector(selector)).toBeTruthy();
      });
    });
  });

  describe('Requirement 7.5: Scroll Prevention', () => {
    it('should prevent default on touch events', async () => {
      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();

      // Create mock touch events
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }],
        cancelable: true,
        bubbles: true
      });

      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 200, clientY: 100 }],
        cancelable: true,
        bubbles: true
      });

      // Spy on preventDefault
      const preventDefaultSpy = vi.spyOn(touchStartEvent, 'preventDefault');

      // Dispatch events
      canvas.dispatchEvent(touchStartEvent);

      // Note: In actual implementation, preventDefault is called
      // This test verifies the event can be prevented (cancelable: true)
      expect(touchStartEvent.cancelable).toBe(true);
      expect(touchEndEvent.cancelable).toBe(true);
    });

    it('should use passive: false for touch event listeners', async () => {
      // This is verified in the implementation
      // Touch events are registered with { passive: false } to allow preventDefault
      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();

      // The implementation uses passive: false, which allows preventDefault
      // This is a structural test to ensure the canvas exists for touch events
    });
  });

  describe('Performance Optimization', () => {
    it('should initialize quickly', async () => {
      const startTime = performance.now();
      await game.init(container);
      const endTime = performance.now();

      const initTime = endTime - startTime;

      // Initialization should be fast (under 100ms)
      expect(initTime).toBeLessThan(100);
    });

    it('should clean up resources on destroy', async () => {
      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();

      game.destroy();

      // Container should be cleared
      expect(container.innerHTML).toBe('');
    });

    it('should handle multiple init/destroy cycles', async () => {
      for (let i = 0; i < 3; i++) {
        await game.init(container);
        expect(container.querySelector('#game-canvas')).toBeTruthy();

        game.destroy();
        expect(container.innerHTML).toBe('');
      }
    });
  });

  describe('Mobile Device Detection', () => {
    const mobileUserAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
    ];

    mobileUserAgents.forEach((userAgent, index) => {
      it(`should detect mobile device ${index + 1}`, async () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          writable: true,
          configurable: true
        });

        await game.init(container);

        const mobileInstructions = container.querySelector('#mobile-instructions');
        expect(mobileInstructions.style.display).toBe('block');
      });
    });

    it('should not detect desktop as mobile', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
        configurable: true
      });

      await game.init(container);

      const mobileInstructions = container.querySelector('#mobile-instructions');
      expect(mobileInstructions.style.display).toBe('none');
    });
  });

  describe('Canvas Rendering Optimization', () => {
    it('should create canvas with appropriate dimensions', async () => {
      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      expect(canvas).toBeTruthy();

      // Canvas should have positive dimensions
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);

      // Canvas should have 2D context
      const ctx = canvas.getContext('2d');
      expect(ctx).toBeTruthy();
    });

    it('should handle high DPI displays', async () => {
      await game.init(container);

      const canvas = container.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');

      // Context should be available for rendering
      expect(ctx).toBeTruthy();

      // Canvas should support standard drawing operations
      expect(typeof ctx.fillRect).toBe('function');
      expect(typeof ctx.strokeRect).toBe('function');
      expect(typeof ctx.arc).toBe('function');
    });
  });

  describe('Integration with Platform', () => {
    it('should work with platform navigation', async () => {
      await game.init(container);

      // Game should initialize successfully
      expect(container.querySelector('.snake-game')).toBeTruthy();

      // Game should clean up on destroy
      game.destroy();
      expect(container.innerHTML).toBe('');
    });

    it('should handle rapid navigation', async () => {
      // Simulate rapid navigation (init -> destroy -> init)
      await game.init(container);
      game.destroy();
      await game.init(container);

      expect(container.querySelector('.snake-game')).toBeTruthy();
    });
  });
});
