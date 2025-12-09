// Property-based tests for GameRegistry
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { GameRegistry } from '../src/gameRegistry.js';

// Custom arbitraries for game configurations
const gameIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const gameNameArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const gameDescriptionArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const gameRouteArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)
  .map(s => s.startsWith('/') ? s : `/${s}`);
const gameLoaderArb = fc.constant(async () => ({ init: () => {}, destroy: () => {} }));
const thumbnailArb = fc.option(fc.webUrl(), { nil: null });

// Generate a valid game configuration
const validGameConfigArb = fc.record({
  id: gameIdArb,
  name: gameNameArb,
  description: gameDescriptionArb,
  route: gameRouteArb,
  loader: gameLoaderArb,
  thumbnail: thumbnailArb
});

describe('GameRegistry Properties', () => {
  // Feature: multi-game-landing, Property 12: Game configuration structure
  // **Validates: Requirements 6.3**
  it('Property 12: Game configuration structure - for any registered game, config includes required fields', () => {
    fc.assert(
      fc.property(validGameConfigArb, (gameConfig) => {
        // Create a fresh registry for each test run
        const registry = new GameRegistry();
        
        // Register the game
        registry.registerGame(gameConfig);
        
        // Retrieve the game
        const retrieved = registry.getGame(gameConfig.id);
        
        // Verify all required fields are present
        const hasId = typeof retrieved.id === 'string' && retrieved.id.trim().length > 0;
        const hasName = typeof retrieved.name === 'string' && retrieved.name.trim().length > 0;
        const hasDescription = typeof retrieved.description === 'string' && retrieved.description.trim().length > 0;
        const hasRoute = typeof retrieved.route === 'string' && retrieved.route.trim().length > 0;
        const hasLoader = typeof retrieved.loader === 'function';
        
        // All required fields must be present and valid
        return hasId && hasName && hasDescription && hasRoute && hasLoader;
      }),
      { numRuns: 100 }
    );
  });
});
