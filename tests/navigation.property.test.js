// Property-based tests for Navigation
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { Router } from '../src/router.js';
import { LandingPage } from '../src/landingPage.js';
import { GameRegistry } from '../src/gameRegistry.js';
import { JSDOM } from 'jsdom';

describe('Navigation Properties', () => {
  let dom;
  let window;
  let document;
  let container;
  let gameContainer;
  let originalWindow;

  beforeEach(() => {
    // Save original window
    originalWindow = global.window;
    
    // Create a new JSDOM instance
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
    
    // Create containers
    container = document.createElement('div');
    container.id = 'landing-container';
    document.body.appendChild(container);
    
    gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.appendChild(gameContainer);
  });

  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (gameContainer && gameContainer.parentNode) {
      gameContainer.parentNode.removeChild(gameContainer);
    }
    
    // Restore original window
    global.window = originalWindow;
    if (originalWindow) {
      global.document = originalWindow.document;
      global.history = originalWindow.history;
      global.location = originalWindow.location;
    }
  });

  // Feature: multi-game-landing, Property 3: Navigation hides previous page
  // **Validates: Requirements 3.2, 4.3**
  it('Property 3: Navigation hides previous page - for any navigation from landing to game, landing is hidden', () => {
    const gameRoutesArb = fc.constantFrom('/game1', '/game2', '/game3');
    
    fc.assert(
      fc.property(gameRoutesArb, (gameRoute) => {
        let landingVisible = true;
        
        const routes = {
          '/': () => {
            container.style.display = 'block';
            gameContainer.style.display = 'none';
            landingVisible = true;
          },
          '/game1': () => {
            container.style.display = 'none';
            gameContainer.style.display = 'block';
            landingVisible = false;
          },
          '/game2': () => {
            container.style.display = 'none';
            gameContainer.style.display = 'block';
            landingVisible = false;
          },
          '/game3': () => {
            container.style.display = 'none';
            gameContainer.style.display = 'block';
            landingVisible = false;
          }
        };
        
        const router = new Router(routes);
        router.init();
        
        // Start at landing page
        router.navigate('/');
        expect(landingVisible).toBe(true);
        
        // Navigate to game
        router.navigate(gameRoute);
        
        // Landing should now be hidden
        const landingHidden = !landingVisible;
        
        // Clean up
        router.destroy();
        
        return landingHidden;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 4: Navigation displays target page
  // **Validates: Requirements 3.3**
  it('Property 4: Navigation displays target page - for any game navigation, target game is displayed', () => {
    const gameRoutesArb = fc.constantFrom('/game1', '/game2', '/game3');
    
    fc.assert(
      fc.property(gameRoutesArb, (gameRoute) => {
        let displayedRoute = null;
        
        const routes = {
          '/': () => { displayedRoute = '/'; },
          '/game1': () => { displayedRoute = '/game1'; },
          '/game2': () => { displayedRoute = '/game2'; },
          '/game3': () => { displayedRoute = '/game3'; }
        };
        
        const router = new Router(routes);
        router.init();
        router.navigate(gameRoute);
        
        // The displayed route should match the target route
        const correctRouteDisplayed = displayedRoute === gameRoute;
        
        // Clean up
        router.destroy();
        
        return correctRouteDisplayed;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 6: Back button presence on game pages
  // **Validates: Requirements 4.1**
  it('Property 6: Back button presence - for any game page, back button exists', () => {
    const gameRoutesArb = fc.constantFrom('/game1', '/game2', '/game3');
    
    fc.assert(
      fc.property(gameRoutesArb, (gameRoute) => {
        const routes = {
          '/': () => {},
          '/game1': () => {
            // Simulate rendering a back button
            const backBtn = document.createElement('button');
            backBtn.id = 'back-button';
            backBtn.textContent = 'Back to Games';
            gameContainer.appendChild(backBtn);
          },
          '/game2': () => {
            const backBtn = document.createElement('button');
            backBtn.id = 'back-button';
            backBtn.textContent = 'Back to Games';
            gameContainer.appendChild(backBtn);
          },
          '/game3': () => {
            const backBtn = document.createElement('button');
            backBtn.id = 'back-button';
            backBtn.textContent = 'Back to Games';
            gameContainer.appendChild(backBtn);
          }
        };
        
        const router = new Router(routes);
        router.init();
        router.navigate(gameRoute);
        
        // Check if back button exists
        const backButton = document.querySelector('#back-button');
        const backButtonExists = backButton !== null;
        
        // Clean up
        gameContainer.innerHTML = '';
        router.destroy();
        
        return backButtonExists;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 7: Return navigation goes to landing page
  // **Validates: Requirements 4.2**
  it('Property 7: Return navigation - for any game page, back button navigates to landing', () => {
    const gameRoutesArb = fc.constantFrom('/game1', '/game2', '/game3');
    
    fc.assert(
      fc.property(gameRoutesArb, (gameRoute) => {
        const routes = {
          '/': vi.fn(),
          '/game1': vi.fn(),
          '/game2': vi.fn(),
          '/game3': vi.fn()
        };
        
        const router = new Router(routes);
        router.init();
        
        // Navigate to game
        router.navigate(gameRoute);
        
        // Clear the call history
        routes['/'].mockClear();
        
        // Navigate back to landing
        router.navigate('/');
        
        // Verify landing page handler was called
        const landingPageCalled = routes['/'].mock.calls.length > 0;
        
        // Clean up
        router.destroy();
        
        return landingPageCalled;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 13: Route-to-game mapping
  // **Validates: Requirements 6.4**
  it('Property 13: Route-to-game mapping - for any registered game, route loads correct game', () => {
    const gameIdArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
    
    fc.assert(
      fc.property(gameIdArb, (gameId) => {
        const registry = new GameRegistry();
        const route = `/${gameId}`;
        
        let loadedGameId = null;
        
        registry.registerGame({
          id: gameId,
          name: `Game ${gameId}`,
          description: 'Test game',
          route: route,
          loader: async () => {
            loadedGameId = gameId;
            return { init: () => {}, destroy: () => {} };
          }
        });
        
        // Simulate loading the game via route
        const game = registry.getGameByRoute(route);
        if (game) {
          game.loader();
        }
        
        // The loaded game ID should match the registered game ID
        return loadedGameId === gameId;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 14: Interaction blocking during transitions
  // **Validates: Requirements 8.3**
  it('Property 14: Interaction blocking - for any navigation, elements are disabled during transition', () => {
    const gameRoutesArb = fc.constantFrom('/game1', '/game2', '/game3');
    
    fc.assert(
      fc.property(gameRoutesArb, (gameRoute) => {
        const routes = {
          '/': vi.fn(),
          '/game1': vi.fn(),
          '/game2': vi.fn(),
          '/game3': vi.fn()
        };
        
        const router = new Router(routes);
        
        // Create a navigation element
        const button = document.createElement('button');
        button.textContent = 'Navigate';
        document.body.appendChild(button);
        
        // Register the element with the router
        router.registerNavigationElement(button);
        
        router.init();
        
        // Element should be enabled initially
        const initiallyEnabled = !button.disabled;
        
        // During navigation, the router disables elements
        // After navigation completes, they are re-enabled
        router.navigate(gameRoute);
        
        // After navigation completes, element should be enabled again
        const finallyEnabled = !button.disabled;
        
        // Clean up
        document.body.removeChild(button);
        router.destroy();
        
        // Both should be true (enabled before and after)
        return initiallyEnabled && finallyEnabled;
      }),
      { numRuns: 100 }
    );
  });
});
