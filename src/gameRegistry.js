/**
 * GameRegistry - Centralized configuration for all available games
 * 
 * Manages game metadata and provides methods to register, retrieve,
 * and validate game configurations.
 */
export class GameRegistry {
  constructor() {
    this.games = new Map();
  }

  /**
   * Register a new game in the registry
   * @param {Object} gameConfig - Game configuration object
   * @param {string} gameConfig.id - Unique identifier
   * @param {string} gameConfig.name - Display name
   * @param {string} gameConfig.description - Brief description
   * @param {string} gameConfig.route - URL path
   * @param {Function} gameConfig.loader - Async function to load game
   * @param {string} [gameConfig.thumbnail] - Optional image URL
   * @throws {Error} If game configuration is invalid
   */
  registerGame(gameConfig) {
    this.validateGameConfig(gameConfig);
    
    if (this.games.has(gameConfig.id)) {
      throw new Error(`Game with id "${gameConfig.id}" is already registered`);
    }
    
    this.games.set(gameConfig.id, { ...gameConfig });
  }

  /**
   * Validate game configuration has all required fields
   * @param {Object} gameConfig - Game configuration to validate
   * @throws {Error} If configuration is invalid
   */
  validateGameConfig(gameConfig) {
    if (!gameConfig || typeof gameConfig !== 'object') {
      throw new Error('Game configuration must be an object');
    }

    const requiredFields = ['id', 'name', 'description', 'route', 'loader'];
    const missingFields = requiredFields.filter(field => !gameConfig[field]);
    
    if (missingFields.length > 0) {
      throw new Error(
        `Game configuration missing required fields: ${missingFields.join(', ')}`
      );
    }

    if (typeof gameConfig.id !== 'string' || gameConfig.id.trim() === '') {
      throw new Error('Game id must be a non-empty string');
    }

    if (typeof gameConfig.name !== 'string' || gameConfig.name.trim() === '') {
      throw new Error('Game name must be a non-empty string');
    }

    if (typeof gameConfig.description !== 'string' || gameConfig.description.trim() === '') {
      throw new Error('Game description must be a non-empty string');
    }

    if (typeof gameConfig.route !== 'string' || gameConfig.route.trim() === '') {
      throw new Error('Game route must be a non-empty string');
    }

    if (typeof gameConfig.loader !== 'function') {
      throw new Error('Game loader must be a function');
    }
  }

  /**
   * Get all registered games
   * @returns {Array} Array of game configurations
   */
  getAllGames() {
    return Array.from(this.games.values());
  }

  /**
   * Get a specific game by ID
   * @param {string} gameId - Game identifier
   * @returns {Object|undefined} Game configuration or undefined if not found
   */
  getGame(gameId) {
    return this.games.get(gameId);
  }

  /**
   * Check if a game exists in the registry
   * @param {string} gameId - Game identifier
   * @returns {boolean} True if game exists
   */
  hasGame(gameId) {
    return this.games.has(gameId);
  }

  /**
   * Get game by route path
   * @param {string} route - Route path
   * @returns {Object|undefined} Game configuration or undefined if not found
   */
  getGameByRoute(route) {
    return this.getAllGames().find(game => game.route === route);
  }

  /**
   * Clear all registered games (useful for testing)
   */
  clear() {
    this.games.clear();
  }
}
