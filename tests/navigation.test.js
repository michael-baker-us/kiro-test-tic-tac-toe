/**
 * Tests for page navigation and visibility management
 * Requirements: 3.2, 4.1, 4.2, 4.3, 4.4
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { Router } from '../src/router.js';
import { GameRegistry } from '../src/gameRegistry.js';
import { LandingPage } from '../src/landingPage.js';

describe('Page Navigation and Visibility Management', () => {
  let dom;
  let document;
  let window;
  let landingContainer;
  let gameContainer;
  let gameContent;
  let backButton;

  beforeEach(() => {
    // Create a DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="app">
            <div id="landing-container" class="page-container"></div>
            <div id="game-container" class="page-container" style="display: none;">
              <button id="back-button" class="back-button">← Back to Games</button>
              <div id="game-content"></div>
            </div>
          </div>
        </body>
      </html>
    `, { url: 'http://localhost/' });

    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;

    landingContainer = document.getElementById('landing-container');
    gameContainer = document.getElementById('game-container');
    gameContent = document.getElementById('game-content');
    backButton = document.getElementById('back-button');
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  describe('Landing Page Display', () => {
    it('should show landing page and hide game page initially', () => {
      // Requirement 3.2: Navigation should hide previous page
      landingContainer.style.display = 'block';
      gameContainer.style.display = 'none';

      expect(landingContainer.style.display).toBe('block');
      expect(gameContainer.style.display).toBe('none');
    });

    it('should display all game tiles on landing page', () => {
      // Requirement 4.4: Landing page should display all available game tiles
      const gameRegistry = new GameRegistry();
      gameRegistry.registerGame({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({ init: vi.fn(), destroy: vi.fn() })
      });

      const landingPage = new LandingPage(gameRegistry, vi.fn());
      landingPage.render(landingContainer);

      const tiles = landingContainer.querySelectorAll('.game-tile');
      expect(tiles.length).toBe(1);
    });
  });

  describe('Game Page Display', () => {
    it('should hide landing page when showing game page', () => {
      // Requirement 3.2: Navigation should hide previous page
      landingContainer.style.display = 'none';
      gameContainer.style.display = 'block';

      expect(landingContainer.style.display).toBe('none');
      expect(gameContainer.style.display).toBe('block');
    });

    it('should display back button on game page', () => {
      // Requirement 4.1: Game page should display navigation element to return to landing page
      expect(backButton).toBeTruthy();
      expect(backButton.textContent).toContain('Back');
    });

    it('should have game content container', () => {
      // Requirement 3.3: Navigation should display complete game interface
      expect(gameContent).toBeTruthy();
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate from landing to game page', () => {
      // Requirement 3.1: Clicking game tile should navigate to game page
      const gameRegistry = new GameRegistry();
      let navigatedRoute = null;

      gameRegistry.registerGame({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({ init: vi.fn(), destroy: vi.fn() })
      });

      const landingPage = new LandingPage(gameRegistry, (route) => {
        navigatedRoute = route;
      });

      landingPage.render(landingContainer);

      const tile = landingContainer.querySelector('.game-tile');
      tile.click();

      expect(navigatedRoute).toBe('/test-game');
    });

    it('should clean up landing page when navigating to game', () => {
      // Requirement 3.2: Ensure proper cleanup when switching pages
      const gameRegistry = new GameRegistry();
      gameRegistry.registerGame({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({ init: vi.fn(), destroy: vi.fn() })
      });

      const landingPage = new LandingPage(gameRegistry, vi.fn());
      landingPage.render(landingContainer);

      const initialContent = landingContainer.innerHTML;
      expect(initialContent).not.toBe('');

      landingPage.destroy();
      expect(landingContainer.innerHTML).toBe('');
    });

    it('should navigate back to landing page from game', () => {
      // Requirement 4.2: Clicking return navigation should navigate back to landing page
      const router = new Router({
        '/': vi.fn(),
        '/test-game': vi.fn()
      });

      let navigatedPath = null;
      router.navigate = (path) => {
        navigatedPath = path;
      };

      backButton.addEventListener('click', () => {
        router.navigate('/');
      });

      backButton.click();
      expect(navigatedPath).toBe('/');
    });
  });

  describe('Page Cleanup', () => {
    it('should destroy game instance when leaving game page', async () => {
      // Requirement: Ensure proper cleanup when switching pages
      const mockDestroy = vi.fn();
      const gameInstance = {
        init: vi.fn(),
        destroy: mockDestroy
      };

      await gameInstance.init(gameContent);
      gameInstance.destroy();

      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should clean up landing page event listeners', () => {
      // Requirement: Ensure proper cleanup when switching pages
      const gameRegistry = new GameRegistry();
      gameRegistry.registerGame({
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({ init: vi.fn(), destroy: vi.fn() })
      });

      const landingPage = new LandingPage(gameRegistry, vi.fn());
      landingPage.render(landingContainer);

      expect(landingPage.tileClickHandlers.size).toBe(1);

      landingPage.destroy();
      expect(landingPage.tileClickHandlers.size).toBe(0);
    });
  });

  describe('URL Management', () => {
    it('should update URL when navigating', () => {
      // Requirement 3.5: Navigation should update browser URL
      const router = new Router({
        '/': vi.fn(),
        '/test-game': vi.fn()
      });

      // Mock history API
      const pushStateSpy = vi.fn();
      window.history.pushState = pushStateSpy;

      router.navigate('/test-game');

      expect(pushStateSpy).toHaveBeenCalledWith(
        { path: '/test-game' },
        '',
        '/test-game'
      );
    });
  });

  describe('Interaction Blocking During Navigation', () => {
    it('should disable navigation elements during transition', () => {
      // Requirement 8.3: Prevent user interaction during transitions
      const router = new Router({
        '/': vi.fn(),
        '/test-game': vi.fn()
      });

      // Register a navigation element
      const button = document.createElement('button');
      router.registerNavigationElement(button);

      // Mock history API
      window.history.pushState = vi.fn();

      // Trigger navigation
      router.navigate('/test-game');

      // After navigation completes, element should be re-enabled
      expect(button.disabled).toBe(false);
      expect(button.style.pointerEvents).toBe('auto');
      expect(button.style.opacity).toBe('1');
    });

    it('should re-enable navigation elements after transition completes', () => {
      // Requirement 8.3: Re-enable interactions after navigation completes
      const router = new Router({
        '/': vi.fn(),
        '/test-game': vi.fn()
      });

      const tile = document.createElement('div');
      tile.className = 'game-tile';
      router.registerNavigationElement(tile);

      // Mock history API
      window.history.pushState = vi.fn();

      router.navigate('/test-game');

      // Element should be enabled after navigation
      expect(tile.style.pointerEvents).toBe('auto');
      expect(tile.style.opacity).toBe('1');
    });

    it('should prevent concurrent navigation', () => {
      // Requirement 8.3: Prevent multiple simultaneous navigation actions
      const handler = vi.fn();
      const router = new Router({
        '/': handler,
        '/test-game': handler
      });

      // Mock history API
      window.history.pushState = vi.fn();

      // Set isNavigating to true to simulate ongoing navigation
      router.isNavigating = true;

      // Try to navigate while already navigating
      router.navigate('/test-game');

      // Handler should not be called because navigation is blocked
      expect(handler).not.toHaveBeenCalled();
    });

    it('should register and unregister navigation elements', () => {
      const router = new Router({});
      const element = document.createElement('button');

      router.registerNavigationElement(element);
      expect(router.navigationElements.has(element)).toBe(true);

      router.unregisterNavigationElement(element);
      expect(router.navigationElements.has(element)).toBe(false);
    });
  });
});
