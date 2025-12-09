// Property-based tests for LandingPage
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { LandingPage } from '../src/landingPage.js';
import { GameRegistry } from '../src/gameRegistry.js';
import { JSDOM } from 'jsdom';

describe('LandingPage Properties', () => {
  let dom;
  let document;
  let container;
  let originalWindow;

  beforeEach(() => {
    // Save original window
    originalWindow = global.window;
    
    // Create a new JSDOM instance
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.window = dom.window;
    global.document = dom.window.document;
    document = dom.window.document;
    
    // Create container
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Restore original window
    global.window = originalWindow;
    if (originalWindow) {
      global.document = originalWindow.document;
    }
  });

  // Custom arbitraries
  const gameIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
  const gameNameArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
  const gameDescriptionArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
  const gameRouteArb = fc.string({ minLength: 1, maxLength: 100 })
    .filter(s => s.trim().length > 0)
    .map(s => s.startsWith('/') ? s : `/${s}`);
  const gameLoaderArb = fc.constant(async () => ({ init: () => {}, destroy: () => {} }));
  const thumbnailArb = fc.option(fc.webUrl(), { nil: null });

  const validGameConfigArb = fc.record({
    id: gameIdArb,
    name: gameNameArb,
    description: gameDescriptionArb,
    route: gameRouteArb,
    loader: gameLoaderArb,
    thumbnail: thumbnailArb
  });

  // Feature: multi-game-landing, Property 1: Game tile rendering includes name and description
  // **Validates: Requirements 2.1, 2.2**
  it('Property 1: Game tile rendering includes name and description - for any game config, tile contains name and description', () => {
    fc.assert(
      fc.property(validGameConfigArb, (gameConfig) => {
        const registry = new GameRegistry();
        registry.registerGame(gameConfig);
        
        const landingPage = new LandingPage(registry, () => {});
        landingPage.render(container);
        
        // Find the game name and description elements
        const nameElement = container.querySelector('.game-name');
        const descriptionElement = container.querySelector('.game-description');
        
        // Verify name and description are present using textContent (handles HTML escaping)
        const hasName = nameElement && nameElement.textContent === gameConfig.name;
        const hasDescription = descriptionElement && descriptionElement.textContent === gameConfig.description;
        
        // Clean up
        landingPage.destroy();
        
        return hasName && hasDescription;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 2: Thumbnail conditional rendering
  // **Validates: Requirements 2.5**
  it('Property 2: Thumbnail conditional rendering - for any game, thumbnail present iff config has thumbnail', () => {
    fc.assert(
      fc.property(validGameConfigArb, (gameConfig) => {
        const registry = new GameRegistry();
        registry.registerGame(gameConfig);
        
        const landingPage = new LandingPage(registry, () => {});
        landingPage.render(container);
        
        // Check for image elements
        const images = container.querySelectorAll('img.game-thumbnail');
        const hasThumbnailElement = images.length > 0;
        const configHasThumbnail = gameConfig.thumbnail !== null && gameConfig.thumbnail !== undefined;
        
        // Clean up
        landingPage.destroy();
        
        // Thumbnail element should exist if and only if config has thumbnail
        return hasThumbnailElement === configHasThumbnail;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 8: Landing page displays all games
  // **Validates: Requirements 4.4**
  it('Property 8: Landing page displays all games - for any registry with N games, landing page shows N tiles', () => {
    const gamesArrayArb = fc.array(validGameConfigArb, { minLength: 0, maxLength: 10 })
      .map(games => {
        // Ensure unique IDs
        return games.map((game, index) => ({
          ...game,
          id: `game-${index}-${game.id}`
        }));
      });
    
    fc.assert(
      fc.property(gamesArrayArb, (games) => {
        const registry = new GameRegistry();
        games.forEach(game => registry.registerGame(game));
        
        const landingPage = new LandingPage(registry, () => {});
        landingPage.render(container);
        
        // Count game tiles
        const tiles = container.querySelectorAll('.game-tile');
        const tileCount = tiles.length;
        const expectedCount = games.length;
        
        // Clean up
        landingPage.destroy();
        
        return tileCount === expectedCount;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: multi-game-landing, Property 11: Game registry auto-display
  // **Validates: Requirements 6.2**
  it('Property 11: Game registry auto-display - for any game added to registry, tile appears automatically', () => {
    fc.assert(
      fc.property(validGameConfigArb, (gameConfig) => {
        const registry = new GameRegistry();
        
        // Register the game
        registry.registerGame(gameConfig);
        
        // Create landing page (should automatically display the game)
        const landingPage = new LandingPage(registry, () => {});
        landingPage.render(container);
        
        // Check if tile exists for this game using a more robust selector
        // We need to escape special characters in the ID for querySelector
        const tiles = container.querySelectorAll('.game-tile');
        let tileExists = false;
        
        tiles.forEach(tile => {
          if (tile.getAttribute('data-game-id') === gameConfig.id) {
            tileExists = true;
          }
        });
        
        // Clean up
        landingPage.destroy();
        
        return tileExists;
      }),
      { numRuns: 100 }
    );
  });
});
