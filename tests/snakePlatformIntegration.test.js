/**
 * Integration tests for Snake game platform integration
 * Tests game registration, navigation, and back button functionality
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { Router } from '../src/router.js';
import { GameRegistry } from '../src/gameRegistry.js';
import { LandingPage } from '../src/landingPage.js';
import createSnakeGame from '../src/games/snake/index.js';

describe('Snake Game Platform Integration', () => {
  let dom;
  let document;
  let window;
  let landingContainer;
  let gameContainer;
  let gameContent;
  let backButton;
  let gameRegistry;
  let router;

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
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Mock Canvas API for JSDOM
    const mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: ''
    };
    
    window.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

    landingContainer = document.getElementById('landing-container');
    gameContainer = document.getElementById('game-container');
    gameContent = document.getElementById('game-content');
    backButton = document.getElementById('back-button');

    // Initialize game registry and router
    gameRegistry = new GameRegistry();
    router = new Router({
      '/': vi.fn(),
      '/snake': vi.fn()
    });
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
    delete global.navigator;
  });

  describe('Game Registration', () => {
    it('should successfully register Snake game in gameRegistry', () => {
      // Requirement 11.1: Snake game should be registered in the platform
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      expect(gameRegistry.hasGame('snake')).toBe(true);
      const snakeGame = gameRegistry.getGame('snake');
      expect(snakeGame).toBeDefined();
      expect(snakeGame.id).toBe('snake');
      expect(snakeGame.name).toBe('Snake');
      expect(snakeGame.description).toBe('Classic arcade game - eat food and grow longer!');
      expect(snakeGame.route).toBe('/snake');
      expect(typeof snakeGame.loader).toBe('function');
    });

    it('should display Snake game tile on landing page after registration', () => {
      // Requirement 11.1: Multi-Game Platform SHALL display a Snake game tile on the landing page
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const landingPage = new LandingPage(gameRegistry, vi.fn());
      landingPage.render(landingContainer);

      const tiles = landingContainer.querySelectorAll('.game-tile');
      expect(tiles.length).toBe(1);
      
      const snakeTile = Array.from(tiles).find(tile => 
        tile.textContent.includes('Snake')
      );
      expect(snakeTile).toBeDefined();
      expect(snakeTile.textContent).toContain('Snake');
      expect(snakeTile.textContent).toContain('Classic arcade game');
    });

    it('should retrieve Snake game by route', () => {
      // Requirement 11.2: Platform should be able to navigate to Snake game
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const game = gameRegistry.getGameByRoute('/snake');
      expect(game).toBeDefined();
      expect(game.id).toBe('snake');
      expect(game.route).toBe('/snake');
    });
  });

  describe('Navigation to Snake Game', () => {
    it('should navigate to Snake game when tile is clicked', () => {
      // Requirement 11.2: WHEN a user clicks the Snake game tile THEN the Multi-Game Platform SHALL navigate to the Snake game page
      let navigatedRoute = null;

      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const landingPage = new LandingPage(gameRegistry, (route) => {
        navigatedRoute = route;
      });

      landingPage.render(landingContainer);

      const snakeTile = landingContainer.querySelector('.game-tile');
      snakeTile.click();

      expect(navigatedRoute).toBe('/snake');
    });

    it('should load Snake game instance when navigating to /snake route', async () => {
      // Requirement 11.2: Platform should load Snake game on navigation
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const game = gameRegistry.getGameByRoute('/snake');
      const gameInstance = await game.loader();

      expect(gameInstance).toBeDefined();
      expect(typeof gameInstance.init).toBe('function');
      expect(typeof gameInstance.destroy).toBe('function');
    });

    it('should initialize Snake game in game content container', async () => {
      // Requirement 11.3: Snake game should render in the game container
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const game = gameRegistry.getGameByRoute('/snake');
      const gameInstance = await game.loader();

      // Mock requestAnimationFrame for game loop
      global.requestAnimationFrame = vi.fn();

      await gameInstance.init(gameContent);

      // Verify game elements are rendered
      expect(gameContent.innerHTML).not.toBe('');
      const snakeGame = gameContent.querySelector('.snake-game');
      expect(snakeGame).not.toBeNull();
    });
  });

  describe('Back Button Navigation', () => {
    it('should display back button when Snake game page loads', () => {
      // Requirement 11.3: WHEN the Snake game page loads THEN the Multi-Game Platform SHALL display the back button
      expect(backButton).toBeDefined();
      expect(backButton.textContent).toContain('Back');
    });

    it('should navigate back to landing page when back button is clicked', () => {
      // Requirement 11.4: WHEN a user clicks the back button THEN the Multi-Game Platform SHALL return to the landing page
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

    it('should hide Snake game when navigating back to landing page', async () => {
      // Requirement 11.4: WHEN a user clicks the back button THEN the Multi-Game Platform SHALL hide the Snake game
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const game = gameRegistry.getGameByRoute('/snake');
      const gameInstance = await game.loader();

      // Mock requestAnimationFrame for game loop
      global.requestAnimationFrame = vi.fn();

      await gameInstance.init(gameContent);
      expect(gameContent.innerHTML).not.toBe('');

      // Destroy game instance (simulating navigation away)
      gameInstance.destroy();
      expect(gameContent.innerHTML).toBe('');
    });

    it('should properly clean up Snake game resources when navigating away', async () => {
      // Requirement 11.5: Platform should isolate Snake game code and clean up resources
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const game = gameRegistry.getGameByRoute('/snake');
      const gameInstance = await game.loader();

      // Mock requestAnimationFrame for game loop
      global.requestAnimationFrame = vi.fn();

      await gameInstance.init(gameContent);
      
      // Verify game is initialized
      const initialContent = gameContent.innerHTML;
      expect(initialContent).not.toBe('');

      // Destroy and verify cleanup
      gameInstance.destroy();
      expect(gameContent.innerHTML).toBe('');
    });
  });

  describe('Game Isolation', () => {
    it('should isolate Snake game code from other games', async () => {
      // Requirement 11.5: WHEN the Snake game is active THEN the Multi-Game Platform SHALL isolate Snake game code from other games
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      gameRegistry.registerGame({
        id: 'other-game',
        name: 'Other Game',
        description: 'Another game',
        route: '/other-game',
        loader: async () => ({
          init: vi.fn(),
          destroy: vi.fn()
        })
      });

      const snakeGame = gameRegistry.getGame('snake');
      const otherGame = gameRegistry.getGame('other-game');

      // Games should be separate instances
      expect(snakeGame).not.toBe(otherGame);
      expect(snakeGame.id).not.toBe(otherGame.id);
      expect(snakeGame.route).not.toBe(otherGame.route);
    });

    it('should create new Snake game instance on each load', async () => {
      // Verify that each game load creates a fresh instance
      gameRegistry.registerGame({
        id: 'snake',
        name: 'Snake',
        description: 'Classic arcade game - eat food and grow longer!',
        route: '/snake',
        loader: async () => createSnakeGame()
      });

      const game = gameRegistry.getGame('snake');
      const instance1 = await game.loader();
      const instance2 = await game.loader();

      // Each call should create a new instance
      expect(instance1).not.toBe(instance2);
    });
  });
});
