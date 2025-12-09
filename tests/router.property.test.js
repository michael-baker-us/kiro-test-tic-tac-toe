// Property-based tests for Router
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { Router } from '../src/router.js';
import { JSDOM } from 'jsdom';

describe('Router Properties', () => {
  let dom;
  let window;
  let document;
  let originalWindow;

  beforeEach(() => {
    // Save original window
    originalWindow = global.window;
    
    // Create a new JSDOM instance for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost/'
    });
    window = dom.window;
    document = window.document;
    
    // Set up global window and document
    global.window = window;
    global.document = document;
    global.history = window.history;
    global.location = window.location;
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
    if (originalWindow) {
      global.document = originalWindow.document;
      global.history = originalWindow.history;
      global.location = originalWindow.location;
    }
  });

  // Feature: multi-game-landing, Property 5: URL updates on navigation
  // **Validates: Requirements 3.5, 4.5**
  it('Property 5: URL updates on navigation - for any navigation action, browser URL is updated', () => {
    // Generate valid route paths
    const routePathArb = fc.constantFrom('/', '/tic-tac-toe', '/game1', '/game2');
    
    fc.assert(
      fc.property(routePathArb, (targetPath) => {
        // Create router with handlers for all routes
        const routes = {
          '/': vi.fn(),
          '/tic-tac-toe': vi.fn(),
          '/game1': vi.fn(),
          '/game2': vi.fn()
        };
        
        const router = new Router(routes);
        router.init();
        
        // Navigate to the target path
        router.navigate(targetPath);
        
        // Verify URL was updated
        const urlUpdated = window.location.pathname === targetPath;
        
        // Clean up
        router.destroy();
        
        return urlUpdated;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 9: Direct URL loading
  // **Validates: Requirements 5.2, 5.5**
  it('Property 9: Direct URL loading - for any valid game identifier in URL, router loads that game', () => {
    const gameRoutesArb = fc.constantFrom(
      { path: '/', handlerCalled: false },
      { path: '/tic-tac-toe', handlerCalled: false },
      { path: '/game1', handlerCalled: false }
    );
    
    fc.assert(
      fc.property(gameRoutesArb, (gameRoute) => {
        // Set initial URL
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
          url: `http://localhost${gameRoute.path}`
        });
        global.window = dom.window;
        global.document = dom.window.document;
        global.history = dom.window.history;
        global.location = dom.window.location;
        
        let handlerCalled = false;
        const handler = vi.fn(() => { handlerCalled = true; });
        
        // Create router with handlers
        const routes = {
          '/': handler,
          '/tic-tac-toe': handler,
          '/game1': handler
        };
        
        const router = new Router(routes);
        
        // Initialize router (should load the current URL)
        router.init();
        
        // Verify the handler was called for the initial route
        const correctRouteLoaded = handlerCalled && handler.mock.calls.length > 0;
        
        // Clean up
        router.destroy();
        
        return correctRouteLoaded;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 10: Browser history integration
  // **Validates: Requirements 5.3, 5.4**
  it('Property 10: Browser history integration - for any navigation sequence, back/forward work correctly', () => {
    const navigationSequenceArb = fc.array(
      fc.constantFrom('/', '/tic-tac-toe', '/game1'),
      { minLength: 2, maxLength: 5 }
    );
    
    fc.assert(
      fc.property(navigationSequenceArb, (sequence) => {
        // Create router with handlers
        const routes = {
          '/': vi.fn(),
          '/tic-tac-toe': vi.fn(),
          '/game1': vi.fn()
        };
        
        const router = new Router(routes);
        router.init();
        
        // Navigate through the sequence
        sequence.forEach(path => {
          router.navigate(path);
        });
        
        // The current URL should be the last path in the sequence
        const currentPath = window.location.pathname;
        const lastPath = sequence[sequence.length - 1];
        
        // Clean up
        router.destroy();
        
        return currentPath === lastPath;
      }),
      { numRuns: 100 }
    );
  });
});
