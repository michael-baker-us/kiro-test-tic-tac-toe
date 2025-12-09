import { describe, it, expect, beforeEach } from 'vitest';
import { GameRegistry } from '../src/gameRegistry.js';

describe('GameRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new GameRegistry();
  });

  describe('registerGame', () => {
    it('should register a valid game configuration', () => {
      const gameConfig = {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({ init: () => {}, destroy: () => {} })
      };

      registry.registerGame(gameConfig);
      expect(registry.hasGame('test-game')).toBe(true);
    });

    it('should throw error when registering duplicate game id', () => {
      const gameConfig = {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({})
      };

      registry.registerGame(gameConfig);
      expect(() => registry.registerGame(gameConfig)).toThrow(
        'Game with id "test-game" is already registered'
      );
    });

    it('should throw error for missing required fields', () => {
      const invalidConfig = {
        id: 'test-game',
        name: 'Test Game'
        // missing description, route, loader
      };

      expect(() => registry.registerGame(invalidConfig)).toThrow(
        'Game configuration missing required fields'
      );
    });

    it('should throw error for non-string id', () => {
      const invalidConfig = {
        id: 123,
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({})
      };

      expect(() => registry.registerGame(invalidConfig)).toThrow(
        'Game id must be a non-empty string'
      );
    });

    it('should throw error for non-function loader', () => {
      const invalidConfig = {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: 'not-a-function'
      };

      expect(() => registry.registerGame(invalidConfig)).toThrow(
        'Game loader must be a function'
      );
    });
  });

  describe('getAllGames', () => {
    it('should return empty array when no games registered', () => {
      expect(registry.getAllGames()).toEqual([]);
    });

    it('should return all registered games', () => {
      const game1 = {
        id: 'game1',
        name: 'Game 1',
        description: 'First game',
        route: '/game1',
        loader: async () => ({})
      };
      const game2 = {
        id: 'game2',
        name: 'Game 2',
        description: 'Second game',
        route: '/game2',
        loader: async () => ({})
      };

      registry.registerGame(game1);
      registry.registerGame(game2);

      const games = registry.getAllGames();
      expect(games).toHaveLength(2);
      expect(games.find(g => g.id === 'game1')).toBeDefined();
      expect(games.find(g => g.id === 'game2')).toBeDefined();
    });
  });

  describe('getGame', () => {
    it('should retrieve game by id', () => {
      const gameConfig = {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({})
      };

      registry.registerGame(gameConfig);
      const retrieved = registry.getGame('test-game');
      
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe('test-game');
      expect(retrieved.name).toBe('Test Game');
    });

    it('should return undefined for non-existent game', () => {
      expect(registry.getGame('non-existent')).toBeUndefined();
    });
  });

  describe('hasGame', () => {
    it('should return true for registered game', () => {
      const gameConfig = {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({})
      };

      registry.registerGame(gameConfig);
      expect(registry.hasGame('test-game')).toBe(true);
    });

    it('should return false for non-existent game', () => {
      expect(registry.hasGame('non-existent')).toBe(false);
    });
  });

  describe('getGameByRoute', () => {
    it('should retrieve game by route path', () => {
      const gameConfig = {
        id: 'test-game',
        name: 'Test Game',
        description: 'A test game',
        route: '/test-game',
        loader: async () => ({})
      };

      registry.registerGame(gameConfig);
      const retrieved = registry.getGameByRoute('/test-game');
      
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe('test-game');
    });

    it('should return undefined for non-existent route', () => {
      expect(registry.getGameByRoute('/non-existent')).toBeUndefined();
    });
  });
});
